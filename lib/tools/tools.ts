
import { sql, eq, count, getTableColumns, asc, desc } from "drizzle-orm";
import db from "../database/conn";
import { defaultItemsOnPage, processSearchText } from "../database/helpers";
import { projects, projectsTools, tools, toolsFts } from "@/data/drizzle/schema";
import { IncompleteDataError, RowNotFound } from "../database/errors";

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

    if (!newId) throw new Error('Erro ao cadastrar a ferramenta!');

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
    
    if (!title)
        throw new IncompleteDataError('title', 'Título desta ferramenta não informado!');

    let result = await db
        .update(tools)
        .set({
            title,
            description,
            logoMediaId
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