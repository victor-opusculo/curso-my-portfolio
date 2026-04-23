import db from "@/lib/database/conn";
import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as schema from '@/data/drizzle/schema';
import * as fileType from 'file-type';
import { genericMimeType } from "@/lib/media/media";
import { insert as insertProject } from "@/lib/projects/projects";
import { insert as insertPost } from "@/lib/blog/blog";
import { setTagsForPost } from "@/lib/blog/tags";
import { LoremIpsum } from 'lorem-ipsum';

const mediaSeedPath = path.join(__dirname, "./seed/media");
const mediaUploadPath = path.join(__dirname, "./uploads/media");

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

const lipsum = () => lorem.generateWords(10);
const lipsumLong = () => lorem.generateParagraphs(10);

const defaultTags = [ "lipsum", "data", "projeto", "postagem", "portfolio" ];
const random = <T>(arr: T[]) => arr[Math.floor(Math.random() * (arr.length - 0.5))];

async function main()
{
    const medias = await fs.readdir(mediaSeedPath, { withFileTypes: true });

    for (const file of await fs.readdir(mediaUploadPath, { withFileTypes: true }))
    {
        if (file.isFile() && file.name !== '.gitkeep')
            await fs.unlink(path.join(mediaUploadPath, file.name));
    }

    const mediasTransformed = medias.filter(f => f.isFile()).map((f, i) => [i + 1, f.name] as const);
    const mediaIds = await db.transaction(async tx => {
        await tx.delete(schema.media);

        const ids: number[] = [];
        for (const [id, file] of mediasTransformed)
        {
            const destinationFile = path.join(mediaUploadPath, id.toString());
            await fs.copyFile(path.join(mediaSeedPath, file), destinationFile);
            const result = await tx.insert(schema.media).values({ 
                id, 
                title: `Mídia ${file}`,
                mimeType: (await fileType.fileTypeFromFile(destinationFile))?.mime ?? genericMimeType,
                fileExtension: path.extname(file) 
            });

            if (result.lastInsertRowid)
                ids.push(Number(result.lastInsertRowid));
        }

        return ids;
    }, 
    { behavior: 'deferred' });

    const toolsIds = await db.transaction(async tx => {
        await tx.delete(schema.tools);

        const ids: number[] = [];
        for (let i = 1; i <= 10; i++)
        {
            const result = await tx.insert(schema.tools).values({
                title: lipsum(),
                description: lipsumLong(),
                logoMediaId: random(mediaIds)
            });

            if (result.lastInsertRowid)
                ids.push(Number(result.lastInsertRowid));
        }

        return ids;
    }, { behavior: 'deferred' });

    await db.delete(schema.projects);

    for (let i = 1; i <= 50; i++) {
        await insertProject({
            title: lipsum(),
            description: lipsumLong(),
            tags: [...new Set([ random(defaultTags), random(defaultTags) ])],
            tools: [...new Set([ random(toolsIds), random(toolsIds) ])],
            linksJson: JSON.stringify([ { label: "Site oficial",  url: "https://example.com" } ]),
            logoMediaId: random(mediaIds),
            attachments: [ {mediaId: random(mediaIds), isGallery: random([ true, false ])} ]
        })
    }

    await db.delete(schema.blogPosts);

    for (let i = 1; i <= 75; i++) {
        const result = await insertPost({
            title:lipsum(),
            content: lipsumLong(),
            enableHtml: 0,
            isVisible: 1
        });

        if (result.lastInsertRowid)
            await setTagsForPost(Number(result.lastInsertRowid), [ ...new Set([ random(defaultTags), random(defaultTags) ]) ] );
    }

}

main();