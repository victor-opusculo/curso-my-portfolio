import {
    blogPosts,
    blogPostsFts,
    blogPostsTagsFts
} from '@/data/drizzle/schema';
import db from '../database/conn';
import { getTableColumns,
    asc,
    desc,
    eq,
    sql,
    count,
    inArray
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

    if (visibleOnly)
        qb.where(eq(blogPosts.isVisible, 1));

    if (search) {
        const queryBlogFts = db
            .select({ postId: sql`rowid`.as('post_id') })
            .from(blogPostsFts)
            .where(eq(blogPostsFts, processSearchText(search)));
        const queryBlogTags = db
            .select({ postId: sql`rowid`.as('post_id')})
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
) : Promise<GetResultWithTags[]>;
export async function getMultiple(
    search: string,
    pageNum: number,
    numResultsOnPage: number,
    orderBy: keyof typeof blogPosts._.columns,
    ascMode: boolean,
    visibleOnly: boolean,
    fetchTags: false
) : Promise<GetResult[]>;
export async function getMultiple(
    search: string = '',
    pageNum: number = 1,
    numResultsOnPage: number = defaultItemsOnPage,
    orderBy: keyof typeof blogPosts._.columns = 'id',
    ascMode: boolean = false,
    visibleOnly: boolean = false,
    fetchTags: boolean = false
) : Promise<GetResult[] | GetResultWithTags[]> {

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
            .select({ postId: sql`rowid`.as('post_id')})
            .from(blogPostsTagsFts)
            .where(eq(blogPostsTagsFts, processSearchText(search)));

        qb.where(inArray(blogPosts.id, union(queryBlogFts, queryBlogTags)));
    }

    const results: GetResult[] = await qb;

    if (fetchTags) {
        let resultsWithTags: GetResultWithTags[];
        const ids = results.map(r => r.id);
        const tagsRows = await getTagsUsedInPosts(ids);

        resultsWithTags = results.map(post => ({
            ...post,
            tags: tagsRows
                .filter(tr => tr.postId === post.id)
                .map(tr => tr.tag),
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

    if (rows.length < 1) throw new RowNotFound('Post não localizado!');

    return rows.shift()!;
}

export async function insert(data: InputDataFormat) {
    const { title, content, enableHtml, isVisible } = data;

    const result = await db
        .insert(blogPosts)
        .values({ title, content, enableHtml, isVisible });

    if (!result.lastInsertRowid)
        throw new Error('Erro ao cadastrar post!');

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