import { projects, projectsTools, tools } from '@/data/drizzle/schema';
import db from '../database/conn';
import { eq, getTableColumns } from 'drizzle-orm';

type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function setProjectTools(
    tx: TransactionType,
    projId: number,
    toolsIds: number[]
) {
    const values = toolsIds.map(tid => ({ projId, toolId: tid }));

    await tx.delete(projectsTools).where(eq(projectsTools.projId, projId));

    if (values.length > 0)
        await tx.insert(projectsTools).values(values);
}

export async function getProjectTools(projId: number) {
    return db
        .select(getTableColumns(tools))
        .from(projectsTools)
        .innerJoin(tools, eq(tools.id, projectsTools.projId))
        .where(eq(projectsTools.projId, projId));
}