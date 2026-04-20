import { settings } from "@/data/drizzle/schema";
import db from "../database/conn";
import { eq, sql } from "drizzle-orm";
import { getSingle } from "../blog/blog";

const settingKeyHomepageId = 'homepage_blog_post_id';

export async function getHomepageBlogPost() {
    const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, settingKeyHomepageId));

    const id = Number(rows.shift()?.value ?? NaN);

    if (id) return getSingle(id);
    else return null;
}

export async function setHomepageBlogPost(id: number) {
    const result = await db
        .insert(settings)
        .values({ key: settingKeyHomepageId, value: id.toString() })
        .onConflictDoUpdate({
            target: settings.key,
            set: { value: sql.raw(`excluded.${settings.value.name}`) }
        });


    return result;
}

export async function upsertInfos(infos: { blogPostId: number }) {
    const result = await db
        .insert(settings)
        .values({
            key: settingKeyHomepageId,
            value: infos.blogPostId.toString()
        })
        .onConflictDoUpdate({
            target: settings.key,
            set: { value: sql.raw(`excluded.${settings.value.name}`) }
        });
    
    return result;
}