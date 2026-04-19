import db from "../database/conn";
import { projectsAttachs } from "@/data/drizzle/schema";
import { eq } from "drizzle-orm";

type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type AttachmentData = { mediaId: number; isGallery: boolean };

export async function setAttachments(
    tx: TransactionType,
    projectId: number,
    list: AttachmentData[]
) {
    await tx
        .delete(projectsAttachs)
        .where(eq(projectsAttachs.projId, projectId));

    const newValues = list.map(item => ({ projId: projectId, mediaId: item.mediaId, isGallery: Number(item.isGallery) }));

    if (newValues.length > 0)
        await tx
            .insert(projectsAttachs)
            .values(newValues);
}

export async function getAttachmentsFromProject(
    projId: number
) : Promise<AttachmentData[]> {
    const rows = await db.select()
    .from(projectsAttachs)
    .where(eq(projectsAttachs.projId, projId));

    return rows.map(row => ({
        mediaId: row.mediaId,
        isGallery: Boolean(row.isGallery)
    }));
}