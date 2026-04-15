import { existsSync, createReadStream } from "fs";
import fs from "node:fs/promises";
import path from "node:path";
import db from "../database/conn";
import * as filetype from 'file-type';
import { media, mediaFts } from "@/data/drizzle/schema";
import { defaultItemsOnPage, processSearchText } from "../database/helpers";
import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { RowNotFound } from "../database/errors";

export const maxSizeAllowed = 20 * 1024 * 1024; // 20 Mib
export const genericMimeType = 'application/octet-stream';
const targetFolder = 'data/uploads/media';

export class MediaUploadError extends Error {
    constructor(
        public field: string,
        public message: string,
    ) {
        super(`${field}: ${message}`);
    }
}

export async function getAllCount(search: string = '') {
    let qb = db
        .select({ count: count() })
        .from(media)
        .innerJoin(mediaFts, eq(sql`${mediaFts}.rowid`, media.id))
        .$dynamic();

    if (search)
        qb = qb.where(sql`${mediaFts} MATCH ${processSearchText(search)}`);

    const rows = await qb;
    return rows.shift()?.count ?? 0;
}

export async function insert(formData: FormData) {
    const title = formData.get('title')?.toString();

    if (!title)
        throw new MediaUploadError(
            'title',
            'Título desta mídia não informada'
        );

    const file = formData.get('file') as File;

    if (file.size > maxSizeAllowed)
        throw new MediaUploadError(
            'file',
            `Tamanho de arquivo acima do permitido! Máximo de ${maxSizeAllowed / 1024 / 1024} Mib`
        );

    const fileName = file.name;
    const fileExt = path.extname(fileName);
    const arrBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrBuffer);
    const fType = await filetype.fileTypeFromBuffer(buffer);

    const result = await db
        .insert(media)
        .values({
            title,
            fileExtension: fileExt,
            mimeType: fType?.mime ?? genericMimeType
        });

    const newId = result.lastInsertRowid;

    if (!newId)
        throw new Error('Erro ao cadastrar mídia!');

    await fs.writeFile(path.join(targetFolder, newId.toString()), buffer);

    return result;
}

export async function getAll() {
    return db.select().from(media);
}

export async function getMultiple(
    search: string = '',
    pageNum: number = 1,
    numResultsOnPage: number = defaultItemsOnPage,
    orderBy: keyof typeof media._.columns = 'id',
    ascMode: boolean = false
) {
    let results: (typeof media.$inferSelect)[];

    let qb = db
        .select(getTableColumns(media))
        .from(media)
        .innerJoin(mediaFts, eq(sql`${mediaFts}.rowid`, media.id))
        .orderBy(ascMode ? asc(media[orderBy]) : desc(media[orderBy]))
        .limit(numResultsOnPage)
        .offset((pageNum - 1) * numResultsOnPage)
        .$dynamic();

    if (search)
        qb = qb.where(sql`${mediaFts} MATCH ${processSearchText(search)}`);

    results = await qb;

    return results;
}

export async function getSingle(id: number) {
    const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);

    if (rows.length < 1) throw new RowNotFound('Mídia não localizada!');

    return rows.shift()!;
}

export async function getSinglePathWithMime(id: number) {
    const data = await getSingle(id);

    return {
        path: path.join(targetFolder, data.id.toString()),
        mime: data.mimeType,
        extension: data.fileExtension
    };
}

export async function update(formData: FormData) {

    const id = Number.parseInt(formData.get('id')?.toString() ?? '0');
    const title = formData.get('title')?.toString();

    const existsMedia = await db.select().from(media).where(eq(media.id, id));

    if (existsMedia.length < 1) throw new Error('Mídia não localizada!');

    if (!title) throw new Error('Título desta mídia não informado!');

    const file = formData.get('file') as File;
    let result;

    if (file && file.size > 0) {
        if (file.size > maxSizeAllowed)
            throw new Error(
                `Tamanho de arquivo acima do permitido! Máximo de ${maxSizeAllowed / 1024 / 1024} Mib.`
            )

        const fileName = file.name;
        const fileExt = path.extname(fileName);
        const arrBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrBuffer);
        const fType = await filetype.fileTypeFromBuffer(buffer);

        result = await db
            .update(media)
            .set({
                title,
                fileExtension: fileExt,
                mimeType: fType?.mime ?? genericMimeType
            })
            .where(eq(media.id, id));

        const fullPath = path.join(targetFolder, id.toString());

        if (result.rowsAffected > 0) {
            if (existsSync(fullPath)) 
                await fs.unlink(fullPath);
        }
        else throw new Error('Mídia não localizada!');

        await fs.writeFile(fullPath, buffer);
    } else {
        result = await db
            .update(media)
            .set({
                title
            })
            .where(eq(media.id, id));
    }

    return result;
}

export async function deleteMedia(id: number) {
    const result = await db.delete(media).where(eq(media.id, id));

    const fullPath = path.join(targetFolder, id.toString());
    if (existsSync(fullPath)) await fs.unlink(fullPath);

    if (result.rowsAffected < 1) throw new Error('Mídia não localizada!');

    return result;
}

export async function getFromIds(ids: number[]) {
    return db.select().from(media).where(inArray(media.id, ids));
}

export async function getStream(id: number) {
    const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
    const mediaDr = rows.shift();

    if (!mediaDr)
        throw new RowNotFound('media');

    const filePath = path.join(targetFolder, mediaDr.id.toString());

    return {
        stream: createReadStream(filePath),
        extension: mediaDr.fileExtension,
        mime: mediaDr.mimeType
    };
}