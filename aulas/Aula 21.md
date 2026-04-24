# Aula 21

## Cadastro de projeto

### Server Actions e acesso ao banco de dados

1. Em `lib`, criar o diretório `projects`;
1. Dentro, criar `tags.ts` com:

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

    export async function getTagsUsedInProject(id: number) {
        const rows = await db
            .select({ tag: projectsTags.tag })
            .from(projectsTags)
            .where(eq(projectsTags.projId, id));
        return rows.map((tobj) => tobj.tag);
    }

    export async function getTagsUsedInProjects(ids: number[]) {
        const rows = await db
            .select({ projId: projectsTags.projId, tag: projectsTags.tag })
            .from(projectsTags)
            .where(inArray(projectsTags.projId, ids));
        return rows;
    }

    export async function setTagsForProject(
        tx: TransactionType,
        id: number,
        tags: string[]
    ) {
        if (tags.length < 1) {
            await tx.delete(projectsTags).where(eq(projectsTags.projId, id));
            return;
        }

        const newRows: (typeof projectsTags.$inferInsert)[] = tags.map((t) => ({
            projId: id,
            tag: t,
        }));

        await tx.delete(projectsTags).where(eq(projectsTags.projId, id));
        await tx.insert(projectsTags).values(newRows);
    }
    ```

1. Criar `tools.ts` com:

    ```typescript
    import { projects, projectsTools, tools } from '@/data/drizzle/schema';
    import db from '../database/conn';
    import { eq } from 'drizzle-orm';
    import { getTableColumns } from 'drizzle-orm';

    type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];

    export async function setProjectTools(
        tx: TransactionType,
        projId: number,
        toolsIds: number[]
    ) {
        const values = toolsIds.map((tid) => ({ projId, toolId: tid }));

        await tx.delete(projectsTools).where(eq(projectsTools.projId, projId));

        if (values.length > 0)
            await tx.insert(projectsTools).values(values);
    }

    export async function getProjectTools(projId: number) {
        return db
            .select(getTableColumns(tools))
            .from(projectsTools)
            .innerJoin(tools, eq(tools.id, projectsTools.toolId))
            .where(eq(projectsTools.projId, projId));
    }

    ```

1. Criar `projectAttachments.ts` com:

    ```typescript
    import db from '../database/conn';
    import { projectsAttachs } from '@/data/drizzle/schema';
    import { eq } from 'drizzle-orm';

    type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
    export type AttachmentData = { mediaId: number; isGallery: boolean };

    export async function setAttachments(
        tx: TransactionType,
        projectId: number,
        list: AttachmentData[]
    ) {
        await tx
            .delete(projectsAttachs)
            .where(eq(projectsAttachs.projId, projectId));

        const newValues = list.map((item) => ({
            projId: projectId,
            mediaId: item.mediaId,
            isGallery: Number(item.isGallery),
        }));

        if (newValues.length > 0)
            await tx
            .insert(projectsAttachs)
            .values(newValues);
    }

    export async function getAttachmentsFromProject(
        projId: number
    ): Promise<AttachmentData[]> {
        const rows = await db
            .select()
            .from(projectsAttachs)
            .where(eq(projectsAttachs.projId, projId));
        return rows.map((row) => ({
            mediaId: row.mediaId,
            isGallery: Boolean(row.isGallery),
        }));
    }

    ```

1. Criar `projects.ts` com:

    ```typescript
    import { sql, eq, count, getTableColumns, asc, desc } from 'drizzle-orm';
    import db from '../database/conn';
    import { defaultItemsOnPage, processSearchText } from '../database/helpers';
    import { projects, projectsFts, projectsTagsFts } from '@/data/drizzle/schema';
    import { IncompleteDataError, RowNotFound } from '../database/errors';
    import { union } from 'drizzle-orm/sqlite-core';
    import { setAttachments, AttachmentData } from './projectAttachments';
    import { getTagsUsedInProjects, setTagsForProject } from './tags';
    import { setProjectTools } from './tools';

    export type InputDataFormat = typeof projects.$inferInsert & {
        attachments: AttachmentData[];
        tags: string[];
        tools: number[];
    };

    export async function getAllCount(search: string = '') {
        let qb = db
            .select({ count: count(projects.id) })
            .from(projects)
            .$dynamic();

        if (search) {
            const queryPrjFts = db
                .select({ projId: sql`rowid`.as('proj_id') })
                .from(projectsFts)
                .where(eq(projectsFts, processSearchText(search)));
            const queryPrjTags = db
                .select({ projId: sql`rowid`.as('proj_id') })
                .from(projectsTagsFts)
                .where(eq(projectsTagsFts, processSearchText(search)));

            qb = qb.where(
                sql`${projects.id} IN ${union(queryPrjFts, queryPrjTags)}`
            );
        }

        const rows = await qb;
        return rows.shift()?.count ?? 0;
    }

    export async function insert(formData: InputDataFormat) {
        const {
            title,
            description,
            logoMediaId,
            linksJson,
            attachments,
            tags,
            tools,
        } = formData;

        if (!title)
            throw new IncompleteDataError(
                'title',
                'Título deste projeto não informado!'
            );

        const result = await db.transaction(async (tx) => {
            const result = await tx
                .insert(projects)
                .values({ title, description, logoMediaId, linksJson });

            if (result.lastInsertRowid) {
                await setAttachments(
                    tx,
                    Number(result.lastInsertRowid),
                    attachments
                );
                await setTagsForProject(tx, Number(result.lastInsertRowid), tags);
                await setProjectTools(tx, Number(result.lastInsertRowid), tools);
            }

            return result;
        });

        const newId = result.lastInsertRowid;

        if (!newId) throw new Error('Erro ao cadastrar projeto!');

        return result;
    }

    export async function getAll() {
        return db.select().from(projects);
    }

    type GetResult = typeof projects.$inferSelect;
    type GetResultWithTags = typeof projects.$inferSelect & { tags: string[] };

    export async function getMultiple(
        search: string,
        pageNum: number,
        numResultsOnPage: number,
        orderBy: keyof typeof projects._.columns,
        ascMode: boolean,
        fetchTags: true
    ): Promise<GetResultWithTags[]>;
    export async function getMultiple(
        search: string,
        pageNum: number,
        numResultsOnPage: number,
        orderBy: keyof typeof projects._.columns,
        ascMode: boolean,
        fetchTags: false
    ): Promise<GetResult[]>;
    export async function getMultiple(
        search: string = '',
        pageNum: number = 1,
        numResultsOnPage: number = defaultItemsOnPage,
        orderBy: keyof typeof projects._.columns = 'id',
        ascMode: boolean = false,
        fetchTags: boolean = true
    ) {
        let qb = db
            .select(getTableColumns(projects))
            .from(projects)
            .orderBy(ascMode ? asc(projects[orderBy]) : desc(projects[orderBy]))
            .limit(numResultsOnPage)
            .offset((pageNum - 1) * numResultsOnPage)
            .$dynamic();

        if (search) {
            const queryPrjFts = db
                .select({ projId: sql`rowid`.as('proj_id') })
                .from(projectsFts)
                .where(eq(projectsFts, processSearchText(search)));
            const queryPrjTags = db
                .select({ projId: sql`rowid`.as('proj_id') })
                .from(projectsTagsFts)
                .where(eq(projectsTagsFts, processSearchText(search)));

            qb = qb.where(
                sql`${projects.id} IN ${union(queryPrjFts, queryPrjTags)}`
            );
        }

        const results: GetResult[] = await qb;

        if (fetchTags) {
            let resultsWithTags: GetResultWithTags[];
            const ids = results.map((r) => r.id);
            const tagsRows = await getTagsUsedInProjects(ids);

            resultsWithTags = results.map((proj) => ({
                ...proj,
                tags: tagsRows
                    .filter((tr) => tr.projId === proj.id)
                    .map((tr) => tr.tag),
            }));
            return resultsWithTags;
        }

        return results;
    }

    export async function getSingle(id: number) {
        const rows = await db
            .select()
            .from(projects)
            .where(eq(projects.id, id))
            .limit(1);

        if (rows.length < 1) throw new RowNotFound('Projeto não localizado!');

        return rows.shift()!;
    }

    export async function update(id: number, formData: InputDataFormat) {
        const {
            title,
            description,
            logoMediaId,
            linksJson,
            attachments,
            tags,
            tools,
        } = formData;

        const existsPrj = await db
            .select()
            .from(projects)
            .where(eq(projects.id, id));

        if (existsPrj.length < 1) throw new Error('Projeto não localizado!');

        if (!title) throw new Error('Título deste projeto não informado!');

        let result = await db.transaction(async (tx) => {
            const result = await tx
                .update(projects)
                .set({
                    title,
                    description,
                    logoMediaId,
                    linksJson,
                })
                .where(eq(projects.id, id));

            await setAttachments(tx, id, attachments);
            await setTagsForProject(tx, id, tags);
            await setProjectTools(tx, id, tools);

            return result;
        });

        return result;
    }

    export async function deleteProject(id: number) {
        const result = await db.delete(projects).where(eq(projects.id, id));

        if (result.rowsAffected < 1) throw new Error('Projeto não localizado!');

        return result;
    }

    ```

1. Por fim, `actions.ts` com:

    ```typescript
    'use server';

    import { redirect } from 'next/navigation';
    import { IncompleteDataError } from '../database/errors';
    import { deleteProject, insert, update } from './projects';
    import { verifyAdminSession } from '../dal';
    import { AttachmentData } from './projectAttachments';
    import { ToolInfo } from '../tools/actions';

    export type FormState =
        | {
            errors?: {
                title?: string[];
                description?: string[];
                linksJson?: string[];
                attachments?: string[];
            };
            message?: string;

            data?: {
                title?: string;
                description?: string;
                linksJson?: string;
                logoMediaId?: number;
                tags?: string[];
                attachments?: AttachmentData[];
                tools?: ToolInfo[];
            };
        }
        | undefined;

    export async function sendProject(
        formState: FormState,
        formData: FormData
    ): Promise<FormState> {
        await verifyAdminSession();

        const id = Number.parseInt(formData.get('id')?.toString() ?? '');
        const title = formData.get('title')?.toString();
        const description = formData.get('description')?.toString();
        const logoMediaId = Number.parseInt(
            formData.get('logoMediaId')?.toString() ?? ''
        );
        const linksJson = formData.get('linksJson')?.toString() ?? '[]';
        const attachJson = formData.getAll('attachments[]');
        const toolsJson = formData.getAll('tools[]');

        let tags: string[] | undefined;
        let attachments: AttachmentData[] | undefined;
        let tools: ToolInfo[] | undefined;
        let gotId: bigint | undefined;

        try {
            tags = JSON.parse(formData.get('tags')?.toString() ?? '[]');
            attachments = attachJson.map((a) => JSON.parse(a.toString())) as {
                mediaId: number;
                isGallery: boolean;
            }[];
            tools = toolsJson.map((t) => JSON.parse(t.toString())) as ToolInfo[];

            if (!title)
                throw new IncompleteDataError('title', 'Título não especificado!');

            if (!id) {
                const result = await insert({
                    title,
                    description,
                    logoMediaId,
                    linksJson,
                    attachments,
                    tags: tags!,
                    tools: tools.filter((t) => t.id).map((t) => t.id!),
                });
                gotId = result.lastInsertRowid;
            } else
                await update(id, {
                    title,
                    description,
                    logoMediaId,
                    linksJson,
                    attachments,
                    tags: tags!,
                    tools: tools.filter((t) => t.id).map((t) => t.id!),
                });
        } catch (err) {
            if (err instanceof IncompleteDataError)
                return {
                    errors: { [err.field]: [err.message] },
                    data: {
                        title,
                        description,
                        logoMediaId,
                        linksJson,
                        attachments,
                        tags,
                        tools,
                    },
                };
            else return { message: String(err) };
        }

        if (gotId) redirect(`/admin/panel/projects/${gotId}/edit`);
        else return { message: 'Projeto editado com sucesso!' };
    }

    export async function removeProject(id: number) {
        await verifyAdminSession();

        await deleteProject(id);

        redirect('/admin/panel/projects');
    }

    ```