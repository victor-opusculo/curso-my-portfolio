'use server';

import { redirect } from "next/navigation";
import {
    insert,
    MediaUploadError,
    getSingle,
    update,
    deleteMedia,
    getMultiple,
    getAllCount
} from './media';
import { verifyAdminSession } from "../dal";
import { defaultItemsOnPage } from "../database/helpers";
import { media } from "@/data/drizzle/schema";

export type FormState = 
    | {
        errors?: {
            title?: string[];
            file?: string[];
        };

        message?: string;

        data?: {
            title: string
        }
    }
    | undefined;

export async function sendMedia(
    formState: FormState,
    formData: FormData
) : Promise<FormState> {
    
    await verifyAdminSession();

    const id = formData.get('id')?.toString();
    const title = formData.get('title')?.toString();

    try {
        if (!id) await insert(formData);
        else await update(formData);
    } catch (err) {
        if (err instanceof MediaUploadError)
            return {
                errors: {
                    file: err.field === 'file' ? [ err.message ] : undefined,
                    title: err.field === 'title' ? [ err.message ] : undefined
                },
                data: { title: title ?? '' }
            };
        else
            return { message: String(err) };
    }

    redirect('/admin/panel/media');
}

export async function sendMediaClient(formData: FormData) : Promise<FormState> {

    await verifyAdminSession();

    try {
        await insert(formData);
    } catch (err) {
        if (err instanceof MediaUploadError) return { message: err.message };
        else return { message: String(err) };
    }

    return {};
}

export async function getMultipleClient(
    search: string = '',
    pageNum: number = 1,
    numResultsOnPage: number = defaultItemsOnPage,
    orderBy: keyof typeof media.$inferSelect = 'id',
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

export async function removeMedia(id: number) {
    await verifyAdminSession();

    await deleteMedia(id);

    redirect('/admin/panel/media');
}

export async function getSingleMedia(id: number) {
    await verifyAdminSession();

    return getSingle(id);
}