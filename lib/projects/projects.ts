import { sql, eq, count, getTableColumns, asc, desc } from "drizzle-orm";
import db from "../database/conn";
import { defaultItemsOnPage, processSearchText } from "../database/helpers";
import { projects, projectsFts, projectsTagsFts } from "@/data/drizzle/schema";
import { IncompleteDataError, RowNotFound } from "../database/errors";
import { union } from "drizzle-orm/sqlite-core";
import { setAttachments, AttachmentData } from "./projectAttachments";
import { getTagsUsedInProjects, setTagsForProject } from "./tags";
import { setProjectTools } from "./tools";

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
        tools
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
            await setAttachments(tx, Number(result.lastInsertRowid), attachments);
            await setTagsForProject(tx, Number(result.lastInsertRowid), tags);
            await setProjectTools(tx, Number(result.lastInsertRowid), tools);
        }

        return result;
    });

    const newId = result.lastInsertRowid;

    if (!newId) throw new Error('Erro ao cadastrar o projeto!');

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
) : Promise<GetResult[]|GetResultWithTags[]> {

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
        const ids = results.map(r => r.id);
        const tagsRows = await getTagsUsedInProjects(ids);

        resultsWithTags = results.map(proj => ({
            ...proj,
            tags: tagsRows
                .filter(tr => tr.projId === proj.id)
                .map(tr => tr.tag)
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

    if (rows.length < 1)
        throw new RowNotFound('Projeto não localizado!');

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
        tools
    } = formData;

    const existsPrj = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id));

    if (existsPrj.length < 1) throw new RowNotFound('Projeto não localizado!');

    if (!title)
        throw new IncompleteDataError('title', 'Título deste projeto não informado!');

    let result = await db.transaction(async (tx) => {
        const result = await tx
            .update(projects)
            .set({ title, description, logoMediaId, linksJson })
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