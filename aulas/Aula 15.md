# Aula 15

## Cadastro de posts de blog

### Server actions e acesso ao banco de dados

1. Criar o diretório `blog` dentro de `lib`;
1. No mesmo diretório, criar `tags.ts` com:

    ```typescript
    import { blogPostsTags, projectsTags } from '@/data/drizzle/schema';
    import db from '../database/conn';
    import { union } from 'drizzle-orm/sqlite-core';
    import { eq, inArray } from 'drizzle-orm';

    type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];

    export async function getAllTagsUsed() {
        const allTags = await union(
            db.select({ tag: blogPostsTags.tag }).from(blogPostsTags),
            db.select({ tag: projectsTags.tag }).from(projectsTags)
        );

        return allTags.map((tobj) => tobj.tag);
    }

    export async function getTagsUsedInPosts(ids: number[]) {
        const rows = await db
            .select({ postId: blogPostsTags.postId, tag: blogPostsTags.tag })
            .from(blogPostsTags)
            .where(inArray(blogPostsTags.postId, ids));
        return rows;
    }

    export async function setTagsForPost(id: number, tags: string[]) {
        if (tags.length < 1) return;

        const newRows: (typeof blogPostsTags.$inferInsert)[] = tags.map((t) => ({
            postId: id,
            tag: t,
        }));

        await db.transaction(
            async (tx) => {
                await tx.delete(blogPostsTags).where(eq(blogPostsTags.postId, id));
                await tx.insert(blogPostsTags).values(newRows);
            },
            { behavior: 'deferred' }
        );
    }

    ```

1. Também no mesmo diretório, criar `blog.ts` com:

    ```typescript
    import {
        blogPosts,
        blogPostsFts,
        blogPostsTagsFts,
    } from '@/data/drizzle/schema';
    import db from '../database/conn';
    import {
        getTableColumns,
        asc,
        desc,
        eq,
        sql,
        count,
        inArray,
    } from 'drizzle-orm';
    import { defaultItemsOnPage, processSearchText } from '../database/helpers';
    import { RowNotFound } from '../database/errors';
    import { getTagsUsedInPosts } from './tags';
    import { union } from 'drizzle-orm/sqlite-core';

    export type InputDataFormat = typeof blogPosts.$inferInsert;

    export async function getAllCount(
        search: string = '',
        visibleOnly: boolean = false
    ) {
        let qb = db
            .select({ count: count(blogPosts.id) })
            .from(blogPosts)
            .$dynamic();

        if (visibleOnly) qb.where(eq(blogPosts.isVisible, 1));

        if (search) {
            const queryBlogFts = db
                .select({ postId: sql`rowid`.as('post_id') })
                .from(blogPostsFts)
                .where(eq(blogPostsFts, processSearchText(search)));
            const queryBlogTags = db
                .select({ postId: sql`rowid`.as('post_id') })
                .from(blogPostsTagsFts)
                .where(eq(blogPostsTagsFts, processSearchText(search)));

            qb.where(inArray(blogPosts.id, union(queryBlogFts, queryBlogTags)));
        }

        const rows = await qb;
        return rows.shift()?.count ?? 0;
    }

    export async function getAll() {
        return db.select().from(blogPosts);
    }

    type GetResult = typeof blogPosts.$inferSelect;
    type GetResultWithTags = typeof blogPosts.$inferSelect & { tags: string[] };

    export async function getMultiple(
        search: string,
        pageNum: number,
        numResultsOnPage: number,
        orderBy: keyof typeof blogPosts._.columns,
        ascMode: boolean,
        visibleOnly: boolean,
        fetchTags: true
    ): Promise<GetResultWithTags[]>;
    export async function getMultiple(
        search: string,
        pageNum: number,
        numResultsOnPage: number,
        orderBy: keyof typeof blogPosts._.columns,
        ascMode: boolean,
        visibleOnly: boolean,
        fetchTags: false
    ): Promise<GetResult[]>;
    export async function getMultiple(
        search: string = '',
        pageNum: number = 1,
        numResultsOnPage: number = defaultItemsOnPage,
        orderBy: keyof typeof blogPosts._.columns = 'id',
        ascMode: boolean = false,
        visibleOnly: boolean = false,
        fetchTags: boolean = false
    ): Promise<GetResult[] | GetResultWithTags[]> {
        let qb = db
            .select(getTableColumns(blogPosts))
            .from(blogPosts)
            .orderBy(ascMode ? asc(blogPosts[orderBy]) : desc(blogPosts[orderBy]))
            .groupBy(blogPosts.id)
            .limit(numResultsOnPage)
            .offset((pageNum - 1) * numResultsOnPage)
            .$dynamic();

        if (visibleOnly) qb.where(eq(blogPosts.isVisible, 1));

        if (search) {
            const queryBlogFts = db
                .select({ postId: sql`rowid`.as('post_id') })
                .from(blogPostsFts)
                .where(eq(blogPostsFts, processSearchText(search)));
            const queryBlogTags = db
                .select({ postId: sql`rowid`.as('post_id') })
                .from(blogPostsTagsFts)
                .where(eq(blogPostsTagsFts, processSearchText(search)));

            qb.where(inArray(blogPosts.id, union(queryBlogFts, queryBlogTags)));
        }

        const results: GetResult[] = await qb;

        if (fetchTags) {
            let resultsWithTags: GetResultWithTags[];
            const ids = results.map((r) => r.id);
            const tagsRows = await getTagsUsedInPosts(ids);

            resultsWithTags = results.map((post) => ({
                ...post,
                tags: tagsRows
                    .filter((tr) => tr.postId === post.id)
                    .map((tr) => tr.tag),
            }));
            return resultsWithTags;
        }

        return results;
    }

    export async function getSingle(id: number) {
        const rows = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, id))
            .limit(1);

        if (rows.length < 1) throw new RowNotFound('Mídia não localizada!');

        return rows.shift()!;
    }

    export async function insert(data: InputDataFormat) {
        const { title, content, enableHtml, isVisible } = data;

        const result = await db
            .insert(blogPosts)
            .values({ title, content, enableHtml, isVisible });

        if (!result.lastInsertRowid) throw new Error('Erro ao cadastrar post!');

        return result;
    }

    export async function update(id: number, data: InputDataFormat) {
        const { title, content, enableHtml, isVisible } = data;

        const result = await db
            .update(blogPosts)
            .set({ title, content, enableHtml, isVisible })
            .where(eq(blogPosts.id, id));

        return result;
    }

    export async function remove(id: number) {
        const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));

        if (result.rowsAffected < 1) throw new Error('Erro ao excluir post!');

        return result;
    }

    ```

1. Então, o arquivo de server actions `actions.ts` com:

    ```typescript
    'use server';

    import { redirect } from 'next/navigation';
    import { IncompleteDataError } from '../database/errors';
    import { getAllCount, getMultiple, insert, remove, update } from './blog';
    import { verifyAdminSession } from '../dal';
    import { defaultItemsOnPage } from '../database/helpers';
    import { blogPosts } from '@/data/drizzle/schema';
    import { setTagsForPost } from './tags';

    export type FormState =
        | {
            errors?: {
                title?: string[];
                content?: string[];
            };
            message?: string;

            data?: {
                title?: string;
                content?: string;
                enableHtml?: number;
                isVisible?: number;

                tags?: string[];
            };
        }
        | undefined;

    export async function getAllPostCount(
        search: string = '',
        visibleOnly: boolean = false
    ) {
        await verifyAdminSession();
        return getAllCount(search, visibleOnly);
    }

    export async function getMultiplePosts(
        search: string = '',
        pageNum: number = 1,
        numResultsOnPage: number = defaultItemsOnPage,
        orderBy: keyof typeof blogPosts._.columns = 'id',
        ascMode: boolean = false,
        visibleOnly: boolean = false
    ) {
        await verifyAdminSession();

        const count = await getAllPostCount(search, visibleOnly);
        const rows = await getMultiple(
            search,
            pageNum,
            numResultsOnPage,
            orderBy,
            ascMode,
            visibleOnly,
            false
        );

        return { count, rows };
    }

    export async function sendPost(
        formState: FormState,
        formData: FormData
    ): Promise<FormState> {
        await verifyAdminSession();

        const id = Number(formData.get('id')?.valueOf());
        const title = formData.get('title')?.toString();
        const content = formData.get('content')?.toString();
        const enableHtml = Number(formData.get('enableHtml')?.valueOf() ?? false);
        const isVisible = Number(formData.get('isVisible')?.valueOf() ?? false);

        let tags: string[] | undefined;

        let gotId: bigint | undefined;
        try {
            tags = JSON.parse(formData.get('tags')?.toString() ?? '[]');

            if (!Array.isArray(tags) || !tags.every((v) => typeof v === 'string'))
                throw new IncompleteDataError('tags', 'Tags em formato inválido');

            if (!title)
                throw new IncompleteDataError('title', 'Título não especificado');

            if (!content)
                throw new IncompleteDataError(
                    'content',
                    'Conteúdo do post não especificado'
                );

            if (!id)
                gotId = (await insert({ title, content, enableHtml, isVisible }))
                    .lastInsertRowid;
            else {
                await update(id, { title, content, enableHtml, isVisible });
                gotId = BigInt(id);
            }

            if (gotId) await setTagsForPost(Number(gotId), tags);
        } catch (err) {
            if (err instanceof IncompleteDataError)
                return {
                    errors: { [err.field]: [err.message] },
                    data: {
                        title,
                        content,
                        enableHtml,
                        isVisible,
                        tags: tags ?? [],
                    },
                };
            else
                return {
                    message: String(err),
                    data: {
                        title,
                        content,
                        enableHtml,
                        isVisible,
                        tags: tags ?? [],
                    },
                };
        }

        if (gotId) redirect(`/admin/panel/blog/${gotId}/edit`);
        else redirect(`/admin/panel/blog/`);
    }

    export async function deletePost(id: number) {
        await verifyAdminSession();

        await remove(id);

        redirect('/admin/panel/blog');
    }

    ```