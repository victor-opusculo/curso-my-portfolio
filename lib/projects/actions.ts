'use server';

import { redirect } from "next/navigation";
import { IncompleteDataError } from "../database/errors";
import { deleteProject, insert, update } from "./projects";
import { verifyAdminSession } from "../dal";
import { AttachmentData } from "./projectAttachments";
import { ToolInfo } from "../tools/actions";

export type FormState = 
    | {
        errors?: {
            title?: string[];
            description?: string[];
            linksJson?: string[];
            attachments?: string[];
        },
        message?: string;

        data?: {
            title?: string;
            description?: string;
            linksJson?: string;
            logoMediaId?: number;
            tags?: string[];
            attachments?: AttachmentData[];
            tools?: ToolInfo[];
        };
    }
    | undefined;

export async function sendProject(
    formState: FormState,
    formData: FormData
): Promise<FormState> {
    await verifyAdminSession();

    const id = Number.parseInt(formData.get('id')?.toString() ?? '');
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const logoMediaId = Number.parseInt(
        formData.get('logoMediaId')?.toString() ?? ''
    );
    const linksJson = formData.get('linksJson')?.toString() ?? '[]';
    const attachJson = formData.getAll('attachments[]');
    const toolsJson = formData.getAll('tools[]');

    let tags: string[]|undefined;
    let attachments: AttachmentData[] | undefined;
    let tools: ToolInfo[] | undefined;
    let gotId: bigint | undefined;

    try {
        tags = JSON.parse(formData.get('tags')?.toString() ?? '[]');
        attachments = attachJson.map(a => JSON.parse(a.toString())) as { mediaId: number; isGallery: boolean }[];
        tools = toolsJson.map(t => JSON.parse(t.toString())) as ToolInfo[];

        if (!title)
            throw new IncompleteDataError('title', 'Título não especificado!');

        if (!id) {
            const result = await insert({
                title,
                description,
                logoMediaId,
                linksJson,
                attachments,
                tags: tags!,
                tools: tools.filter(t => t.id).map(t => t.id!),
            });

            gotId = result.lastInsertRowid;
        } else {
            await update(id, {
                title,
                description,
                logoMediaId,
                linksJson,
                attachments,
                tags: tags!,
                tools: tools.filter(t => t.id).map(t => t.id!),
            });
        }
    } catch (err) {
        if (err instanceof IncompleteDataError)
            return {
                errors: { [err.field]: [err.message] },
                data: {
                    title,
                    description,
                    logoMediaId,
                    linksJson,
                    attachments,
                    tags,
                    tools,
                },
            };
        else
            return { message: String(err) };
    }

    if (gotId)
        redirect(`/admin/panel/projects/${gotId}/edit`);
    else
        return { message: 'Projeto editado com sucesso!' };
}

export async function removeProject(id: number) {
    await verifyAdminSession();

    await deleteProject(id);

    redirect('/admin/panel/projects');
}