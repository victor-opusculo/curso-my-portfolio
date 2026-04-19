import { blogPostsTags, projectsTags } from "@/data/drizzle/schema";
import db from "../database/conn";
import { union } from "drizzle-orm/sqlite-core";
import { eq, inArray } from "drizzle-orm";

type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function getAllTagsUsed() {
    const allTags = await union(
        db.select({ tag: blogPostsTags.tag }).from(blogPostsTags),
        db.select({ tag: blogPostsTags.tag }).from(projectsTags)
    );

    return allTags.map(tobj => tobj.tag);
}

export async function getTagsUsedInProject(id: number) {
    const rows = await db
        .select({ tag: projectsTags.tag })
        .from(projectsTags)
        .where(eq(projectsTags.projId, id));
    return rows.map(tobj => tobj.tag);
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
    if (tags.length < 1)
    {
        await tx.delete(projectsTags).where(eq(projectsTags.projId, id));
        return;
    }

    const newRows: (typeof projectsTags.$inferSelect)[] = tags.map(t => ({
        projId: id,
        tag: t
    }));

    await tx.delete(projectsTags).where(eq(projectsTags.projId, id));
    await tx.insert(projectsTags).values(newRows);
}
