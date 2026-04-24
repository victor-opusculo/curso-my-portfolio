# Aula 18

## Cadastro de ferramentas

### Server actions e acesso ao banco de dados

1. Em `lib`, criar o diretório `tools`;
1. Em `tools`, criar o arquivo `tools.ts` com:

    ```typescript
    import { sql, eq, count, getTableColumns, asc, desc } from 'drizzle-orm';
    import db from '../database/conn';
    import { defaultItemsOnPage, processSearchText } from '../database/helpers';
    import {
        projects,
        projectsTools,
        tools,
        toolsFts,
    } from '@/data/drizzle/schema';
    import { IncompleteDataError, RowNotFound } from '../database/errors';

    export type InputDataFormat = typeof tools.$inferInsert;

    export async function getAllCount(search: string = '') {
        let qb = db
            .select({ count: count(tools.id) })
            .from(tools)
            .innerJoin(toolsFts, eq(sql`${toolsFts}.rowid`, tools.id))
            .$dynamic();

        if (search)
            qb = qb.where(sql`${toolsFts} MATCH ${processSearchText(search)}`);

        const rows = await qb;
        return rows.shift()?.count ?? 0;
    }

    export async function insert(formData: InputDataFormat) {
        const { title, description, logoMediaId } = formData;

        if (!title)
            throw new IncompleteDataError(
                'title',
                'Título desta ferramenta não informado!'
            );

        const result = await db
            .insert(tools)
            .values({ title, description, logoMediaId });
        const newId = result.lastInsertRowid;

        if (!newId) throw new Error('Erro ao cadastrar ferramenta!');

        return result;
    }

    export async function getAll() {
        return db.select().from(tools);
    }

    export async function getMultiple(
        search: string = '',
        pageNum: number = 1,
        numResultsOnPage: number = defaultItemsOnPage,
        orderBy: keyof typeof tools._.columns = 'id',
        ascMode: boolean = false
    ) {
        let results: (typeof tools.$inferSelect)[];

        let qb = db
            .select(getTableColumns(tools))
            .from(tools)
            .innerJoin(toolsFts, eq(sql`${toolsFts}.rowid`, tools.id))
            .orderBy(ascMode ? asc(tools[orderBy]) : desc(tools[orderBy]))
            .limit(numResultsOnPage)
            .offset((pageNum - 1) * numResultsOnPage)
            .$dynamic();

        if (search)
            qb = qb.where(sql`${toolsFts} MATCH ${processSearchText(search)}`);

        results = await qb;

        return results;
    }

    export async function getSingle(id: number) {
        const rows = await db.select().from(tools).where(eq(tools.id, id)).limit(1);

        if (rows.length < 1) throw new RowNotFound('Ferramenta não localizada!');

        return rows.shift()!;
    }

    export async function update(id: number, formData: InputDataFormat) {
        const { title, description, logoMediaId } = formData;

        const existsTool = await db.select().from(tools).where(eq(tools.id, id));

        if (existsTool.length < 1) throw new RowNotFound('Ferramenta não localizada!');

        if (!title) throw new Error('Título desta ferramenta não informado!');

        let result = await db
            .update(tools)
            .set({
                title,
                description,
                logoMediaId,
            })
            .where(eq(tools.id, id));

        return result;
    }

    export async function deleteTool(id: number) {
        const result = await db.delete(tools).where(eq(tools.id, id));

        if (result.rowsAffected < 1) throw new Error('Ferramenta não localizada!');

        return result;
    }

    export async function getProjectsUsedTool(toolId: number) {
        return db
            .select(getTableColumns(projects))
            .from(projectsTools)
            .innerJoin(projects, eq(projects.id, projectsTools.projId))
            .where(eq(projectsTools.toolId, toolId));
    }

    ```

1. No mesmo diretório, criar o arquivo de server actions `actions.ts` com:

    ```typescript
    'use server';

    import { redirect } from 'next/navigation';
    import { IncompleteDataError } from '../database/errors';
    import { deleteTool, getAllCount, getMultiple, insert, update } from './tools';
    import { verifyAdminSession } from '../dal';
    import { defaultItemsOnPage } from '../database/helpers';
    import { tools } from '@/data/drizzle/schema';

    export type FormState =
        | {
            errors?: {
                title?: string[];
                description?: string[];
            };
            message?: string;

            data?: {
                title?: string;
                description?: string;
                logoMediaId?: number;
            };
        }
        | undefined;

    export type ToolInfo = { title: string; id: number | null };

    export async function sendTool(
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

        let gotId: bigint | undefined;
        try {
            if (!title)
                throw new IncompleteDataError('title', 'Título não especificado!');

            if (!id) {
                const result = await insert({ title, description, logoMediaId });
                gotId = result.lastInsertRowid;
            } else await update(id, { title, description, logoMediaId });
        } catch (err) {
            if (err instanceof IncompleteDataError)
                return {
                    errors: { [err.field]: [err.message] },
                    data: { title, description, logoMediaId },
                };
            else return { message: String(err) };
        }

        redirect(`/admin/panel/tools/${gotId ?? id}/edit`);
    }

    export async function removeTool(id: number) {
        await verifyAdminSession();

        await deleteTool(id);

        redirect('/admin/panel/tools');
    }

    export async function getMultipleTools(
        search: string = '',
        pageNum: number = 1,
        numResultsOnPage: number = defaultItemsOnPage,
        orderBy: keyof typeof tools.$inferSelect = 'id',
        ascMode: boolean = false
    ) {
        await verifyAdminSession();

        const count = await getAllCount(search);
        const rows = await getMultiple(
            search,
            pageNum,
            numResultsOnPage,
            orderBy,
            ascMode
        );

        return { rows, count };
    }

    ```
    