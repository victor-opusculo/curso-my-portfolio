'use server';

import { redirect } from "next/navigation";
import { IncompleteDataError } from "../database/errors";
import { deleteTool, getAllCount, getMultiple, insert, update } from "./tools";
import { verifyAdminSession } from "../dal";
import { defaultItemsOnPage } from "../database/helpers";
import { tools } from "@/data/drizzle/schema";

export type FormState = 
    | {
        errors?: {
            title?: string[];
            description?: string[];
        };
        message?: string;

        data?: {
            title?: string;
            description?: string;
            logoMediaId?: number;
        }
    }
    | undefined;

export type ToolInfo = { title: string; id: number | null };

export async function sendTool(
    formState: FormState,
    formData: FormData
) : Promise<FormState> {

    await verifyAdminSession();

    const id = Number.parseInt(formData.get('id')?.toString() ?? '');
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const logoMediaId = Number.parseInt(
        formData.get('logoMediaId')?.toString() ?? ''
    );

    let gotId: bigint | undefined;
    try {
        if (!title)
            throw new IncompleteDataError('title', 'Título não especificado!');

        if (!id) {
            const result = await insert({ title, description, logoMediaId });
            gotId = result.lastInsertRowid;
        } else await update(id, { title, description, logoMediaId });
    } catch (err) {
        if (err instanceof IncompleteDataError)
            return {
                errors: { [err.field]: [ err.message ] },
                data: { title, description, logoMediaId }
            };
        else
            return { message: String(err) };
    }

    redirect(`/admin/panel/tools/${gotId ?? id}/edit`);
}

export async function removeTool(id: number) {
    await verifyAdminSession();

    await deleteTool(id);

    redirect('/admin/panel/tools');
}

export async function getMultipleTools(
    search: string = '',
    pageNum: number = 1,
    numResultsOnPage: number = defaultItemsOnPage,
    orderBy: keyof typeof tools.$inferSelect = 'id',
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