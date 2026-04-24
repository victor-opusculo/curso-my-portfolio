# Aula 27

## Páginas públicas de blog

1. Criar em `app` o diretório `blog`;
1. Nele, a home `page.tsx` com:

    ```tsx
    import TagCloud from '@/components/blog/TagCloud';
    import BasicSearchField from '@/components/data/BasicSearchField';
    import Paginator from '@/components/data/Paginator';
    import { getAllCount, getMultiple } from '@/lib/blog/blog';
    import { truncate, utcToLocalString } from '@/lib/helpers';
    import { Metadata } from 'next';
    import Link from 'next/link';

    export const dynamic = 'force-dynamic';
    const thisRoute = '/blog';

    export const metadata: Metadata = {
        title: 'Blog',
    };

    export default async function GuestBlogHome(props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }) {
        const postsOnPage = 10;

        const params = await props.searchParams;

        const q = params.q?.toString() ?? '';
        const pageNum = Number.parseInt(params.page?.toString() ?? '1');

        const count = await getAllCount(q, true);
        const posts = await getMultiple(
            q,
            pageNum,
            postsOnPage,
            'publishedAtUtc',
            false,
            true,
            true
        );

        return (
            <div className="mx-8 my-4">
                <h2>Blog</h2>

                <BasicSearchField basePath={thisRoute} currentValue={q} />
                <div className="md:flex md:flex-row md:gap-8">
                    <div className="md:grow">
                        {posts.length > 0 ? (
                            posts.map((post, idx) => (
                                <article
                                    className="w-full block mb-4 border-b border-b-neutral-300 dark:border-b-neutral-700"
                                    key={idx}
                                >
                                    <h3 className="font-bold text-lg my-2">
                                        <Link href={`/blog/${post.id}`}>
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="font-sm text-right italic">
                                        {utcToLocalString(post.publishedAtUtc)}
                                    </p>
                                    <div className="whitespace-pre-line">
                                        {truncate(post.content, 280)}
                                    </div>
                                    <div className="text-right">
                                        <Link
                                            href={`/blog/${post.id}`}
                                            className="link font-bold"
                                        >
                                            Ler mais
                                        </Link>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="text-center text-lg">
                                Ainda não há posts!
                            </p>
                        )}
                    </div>
                    <aside className="md:shrink">
                        <h3 className="font-bold uppercase mt-4 mb-2">
                            Nuvem de tags
                        </h3>
                        <TagCloud />
                    </aside>
                </div>

                <Paginator
                    basePath={thisRoute}
                    baseQueryString={params}
                    numberResultsOnPage={postsOnPage}
                    pageNumber={pageNum}
                    totalItems={count}
                />
            </div>
        );
    }

    ```

1. Depois, o subdiretório `[postId]` com a página `page.tsx`:

    ```tsx
    import PostViewer from '@/components/blog/PostViewer';
    import HistoryBackButton from '@/components/data/HistoryBackButton';
    import { getSingle } from '@/lib/blog/blog';
    import { getTagsUsedInPost } from '@/lib/blog/tags';
    import { isAdminSession } from '@/lib/dal';
    import { RowNotFound } from '@/lib/database/errors';
    import { Metadata } from 'next';
    import { notFound } from 'next/navigation';
    import { cache } from 'react';

    const getPost = cache(getSingle);
    const getTags = cache(getTagsUsedInPost);

    interface Props {
        params: Promise<{ postId: number }>;
    }

    export async function generateMetadata(props: Props): Promise<Metadata> {
        const params = await props.params;
        const post = await getPost(params.postId);

        return { title: post.title };
    }

    export default async function GuestBlogView(props: Props) {
        const params = await props.params;

        try {
            let post = await getPost(params.postId);
            let tags = await getTags(params.postId);

            if (!Boolean(post.isVisible)) notFound();

            return (
                <div className="mx-8 my-4">
                    <PostViewer post={post} tags={tags} />

                    <div className="my-4">
                        <HistoryBackButton />
                    </div>
                </div>
            );
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else
                throw (await isAdminSession())
                    ? err
                    : new Error('Um erro aconteceu');
        }
    }
    ```

## Página de tags

### Acesso aos dados

1. Em `lib`, criar o diretório `tags`, com o arquivo `tags.ts`:

    ```ts
    import {
        blogPosts,
        blogPostsTags,
        projects,
        projectsTags,
    } from '@/data/drizzle/schema';
    import db from '../database/conn';
    import { defaultItemsOnPage } from '../database/helpers';
    import { eq, sql, count, SelectedFields, and } from 'drizzle-orm';

    export type TagSearchTypes = 'project' | 'blog_post';
    export type TagSearchRow = { type: TagSearchTypes; id: number; title: string };

    export async function tagSearch(
        tag: string,
        pageNum: number,
        numResultsOnPage: number = defaultItemsOnPage
    ): Promise<{ rows: TagSearchRow[]; count: number }> {
        const countProjects = db
            .select({ count: count(projects.id) })
            .from(projectsTags)
            .innerJoin(projects, eq(projectsTags.projId, projects.id))
            .where(eq(projectsTags.tag, tag))
            .groupBy(projects.id);

        const rowsProjects = db
            .select({
                type: sql<TagSearchTypes>`'project'`,
                id: projects.id,
                title: projects.title,
            })
            .from(projectsTags)
            .innerJoin(projects, eq(projectsTags.projId, projects.id))
            .where(eq(projectsTags.tag, tag))
            .groupBy(projects.id);

        const countPosts = db
            .select({ count: count(blogPosts.id) })
            .from(blogPostsTags)
            .innerJoin(blogPosts, eq(blogPostsTags.postId, blogPosts.id))
            .where(and(eq(blogPostsTags.tag, tag), eq(blogPosts.isVisible, 1)))
            .groupBy(blogPosts.id);

        const rowsPosts = db
            .select({
                type: sql<TagSearchTypes>`'blog_post'`,
                id: blogPosts.id,
                title: blogPosts.title,
            })
            .from(blogPostsTags)
            .innerJoin(blogPosts, eq(blogPostsTags.postId, blogPosts.id))
            .where(and(eq(blogPostsTags.tag, tag), eq(blogPosts.isVisible, 1)))
            .groupBy(blogPosts.id);

        const rows = await rowsProjects
            .union(rowsPosts)
            .limit(numResultsOnPage)
            .offset((pageNum - 1) * numResultsOnPage);
        const countRows = await countProjects.union(countPosts);
        const countNum = countRows.shift()?.count ?? 0;

        return { rows, count: countNum };
    }
    ```

### Página pública

1. Em `app`, criar o diretório `tag` e, dentro dele, o subdiretório `[tagName]`;
1. Dentro do subdiretório, criar a página `page.tsx` com:

    ```tsx
    import DataGrid from '@/components/data/DataGrid';
    import Paginator from '@/components/data/Paginator';
    import { tagSearch, TagSearchRow } from '@/lib/tags/tags';
    import { Metadata } from 'next';

    interface Props {
        params: Promise<{ tagName: string }>;
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }

    export async function generateMetadata(props: Props): Promise<Metadata> {
        const tag = (await props.params).tagName;
        return { title: `Tag: ${decodeURIComponent(tag)}` };
    }

    const itemsOnPage = 50;

    const getRowInfo = (row: TagSearchRow, info: 'url' | 'title' | 'type') => {
        switch (info) {
            case 'type':
                return row.type === 'project' ? 'Projeto' : 'Post no blog';
            case 'url':
                return row.type === 'project'
                    ? `/projects/${row.id}`
                    : `/blog/${row.id}`;
            default:
            case 'title':
                return row.title;
        }
    };

    export default async function GuestTagSearch(props: Props) {
        const params = await props.params;
        const searchParams = await props.searchParams;
        const pageNum = Number(searchParams.page?.toString() ?? 1);

        const tagName = decodeURIComponent(params.tagName);

        const { rows, count } = await tagSearch(tagName, pageNum, itemsOnPage);

        const transformed = rows.map((row) => ({
            Tipo: getRowInfo(row, 'type'),
            Nome: (
                <a href={getRowInfo(row, 'url')} className="link">
                    {getRowInfo(row, 'title')}
                </a>
            ),
        }));

        return (
            <div className="m-4">
                <h2 className="my-8">Tag: {tagName}</h2>

                <DataGrid data={transformed} />

                <Paginator
                    basePath={`/tag/${tagName}`}
                    baseQueryString={searchParams}
                    pageNumber={pageNum}
                    numberResultsOnPage={itemsOnPage}
                    totalItems={count}
                />
            </div>
        );
    }

    ```