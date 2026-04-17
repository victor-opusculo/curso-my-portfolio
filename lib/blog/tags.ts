import { blogPostsTags, projectsTags } from "@/data/drizzle/schema";
import db from "../database/conn";
import { union } from "drizzle-orm/sqlite-core";
import { eq, inArray } from "drizzle-orm";

export async function getAllTagsUsed() {
    const allTags = await union(
        db.select({ tag: blogPostsTags.tag }).from(blogPostsTags),
        db.select({ tag: projectsTags.tag }).from(projectsTags)
    );

    return allTags.map(tobj => tobj.tag);
}

export async function getTagsUsedInPosts(ids: number[]) {
    const rows = await db
        .select({ postId: blogPostsTags.postId, tag: blogPostsTags.tag })
        .from(blogPostsTags)
        .where(inArray(blogPostsTags.postId, ids));

    return rows;
}

export async function setTagsForPost(id: number, tags: string[]) {
    if (tags.length < 1)
    {
        await db.delete(blogPostsTags).where(eq(blogPostsTags.postId, id));
        return;
    }

    const newRows: (typeof blogPostsTags.$inferSelect)[] = tags.map(t => ({
        postId: id,
        tag: t
    }));

    await db.transaction(
        async (tx) => {
            await tx.delete(blogPostsTags).where(eq(blogPostsTags.postId, id));
            await tx.insert(blogPostsTags).values(newRows);
        },
        { behavior: 'deferred' }
    );
}