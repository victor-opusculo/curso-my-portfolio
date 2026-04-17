'use server';

import { redirect } from "next/navigation";
import { IncompleteDataError } from "../database/errors";
import { getAllCount, getMultiple, insert, remove, update } from "./blog";
import { verifyAdminSession } from "../dal";
import { defaultItemsOnPage } from "../database/helpers";
import { blogPosts } from "@/data/drizzle/schema";
import { setTagsForPost } from "./tags";

export type FormState =
    | {
        errors?: {
            title?: string[];
            content?: string[];
        };
        message?: string;

        data?: {
            title?: string;
            content?: string;
            enableHtml?: number;
            isVisible?: number;

            tags?: string[]
        };
    }
    | undefined;

export async function getAllPostCount(
    search: string = '',
    visibleOnly: boolean = false
) {
    await verifyAdminSession();
    return getAllCount(search, visibleOnly);
}

export async function getMultiplePosts(
    search: string = '',
    pageNum: number = 1,
    numResultsOnPage: number = defaultItemsOnPage,
    orderBy: keyof typeof blogPosts._.columns = 'id',
    ascMode: boolean = false,
    visibleOnly: boolean = false
) {
    await verifyAdminSession();

    const count = await getAllPostCount(search, visibleOnly);
    const rows = await getMultiple(
        search,
        pageNum,
        numResultsOnPage,
        orderBy,
        ascMode,
        visibleOnly,
        false
    );

    return { count, rows };
}

export async function sendPost(
    formState: FormState,
    formData: FormData
) : Promise<FormState> {
    await verifyAdminSession();

    const id = Number(formData.get('id')?.valueOf());
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();
    const enableHtml = Number(formData.get('enableHtml')?.valueOf() ?? false);
    const isVisible = Number(formData.get('isVisible')?.valueOf() ?? false);

    let tags: string[] | undefined;

    let gotId: bigint | undefined;

    try {
        tags = JSON.parse(formData.get('tags')?.toString() ?? '[]');

        if (!Array.isArray(tags) || !tags.every(v => typeof v === 'string'))
            throw new IncompleteDataError('tags', 'Tags em formato inválido');

        if (!title)
            throw new IncompleteDataError('title', 'Título não especificado');

        if (!content)
            throw new IncompleteDataError(
                'content',
                'Conteúdo do post não especificado'
            );

        if (!id)
            gotId = (await insert({ title, content, enableHtml, isVisible })).lastInsertRowid;
        else {
            await update(id, { title, content, enableHtml, isVisible });
            gotId = BigInt(id);
        }

        if (gotId)
            await setTagsForPost(Number(gotId), tags);
    } catch (err) {
        if (err instanceof IncompleteDataError)
            return {
                errors: { [err.field]: [err.message] },
                data: {
                    title,
                    content,
                    enableHtml,
                    isVisible,
                    tags: tags ?? []
                },
            };
        else
            return {
                message: String(err),
                data: {
                    title,
                    content,
                    enableHtml,
                    isVisible,
                    tags: tags ?? []
                }
            };
    }

    if (gotId)
        redirect(`/admin/panel/blog/${gotId}/edit`);
    else redirect(`admin/panel/blog/`);
}

export async function deletePost(id: number) {
    await verifyAdminSession();

    await remove(id);

    redirect('/admin/panel/blog');
}