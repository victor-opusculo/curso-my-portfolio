import { blogPosts, blogPostsTags, projects, projectsTags } from "@/data/drizzle/schema";
import db from "../database/conn";
import { defaultItemsOnPage } from "../database/helpers";
import { eq, sql, count, SelectedFields, and } from "drizzle-orm";

export type TagSearchTypes = 'project'|'blog_post';
export type TagSearchRow = { type: TagSearchTypes, id: number, title: string };

export async function tagSearch(
    tag: string,
    pageNum: number,
    numResultsOnPage: number = defaultItemsOnPage
) : Promise<{ rows: TagSearchRow[]; count: number }> {
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
            title: projects.title
        })
        .from(projectsTags)
        .innerJoin(projects, eq(projectsTags.projId, projects.id))
        .where(eq(projectsTags.tag, tag))
        .groupBy(projects.id);

    const countPosts = db
        .select({ count: count(blogPosts.id) })
        .from(blogPostsTags)
        .innerJoin(blogPosts, eq(blogPostsTags.postId, blogPosts.id))
        .where(and(eq(blogPostsTags.tag, tag), eq(blogPosts.isVisible, 1) ))
        .groupBy(blogPosts.id);

    const rowsPosts = db
        .select({
            type: sql<TagSearchTypes>`'blog_post'`,
            id: blogPosts.id,
            title: blogPosts.title
        })
        .from(blogPostsTags)
        .innerJoin(blogPosts, eq(blogPostsTags.postId, blogPosts.id))
        .where(and(eq(blogPostsTags.tag, tag), eq(blogPosts.isVisible, 1) ))
        .groupBy(blogPosts.id);

    const rows = await rowsProjects
        .union(rowsPosts)
        .limit(numResultsOnPage)
        .offset((pageNum - 1) * numResultsOnPage);

    const countRows = await countProjects.union(countPosts);
    const countNum = countRows.shift()?.count ?? 0;

    return { rows, count: countNum }
}