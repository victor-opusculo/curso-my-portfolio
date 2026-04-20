
import { media, projects, tools } from "@/data/drizzle/schema";
import { AttachmentData } from "@/lib/projects/projectAttachments";
import Gallery from "../data/Gallery";
import { link } from "fs";

interface ProjectViewerProps {
    project: typeof projects.$inferSelect;
    attachments: AttachmentData[];
    medias: (typeof media.$inferSelect)[];
    tags: string[];
    tools: (typeof tools.$inferSelect)[];
}

export default async function ProjectViewer(props: ProjectViewerProps) {
    const { project, attachments, medias, tags, tools } = props;

    const galleryItems = attachments.filter(att => att.isGallery);
    const otherAttachmentsItems = attachments.filter(att => !att.isGallery);
    const links = JSON.parse(project.linksJson) as {
        label: string;
        url: string;
    }[];

    return (
        <div>
            <div className="text-center my-4">
                <img
                    src={
                        project.logoMediaId
                            ? `/api/media/${project.logoMediaId}`
                            : '/nopic.png'   
                    }
                    alt={project.title}
                    title={project.title}
                    className="max-h-[200px] mx-auto"
                />
            </div>
            <span className="block text-center uppercase text-4xl">
                {project.title}
            </span>
            <p className="whitespace-pre-line mt-4 text-justify">
                {project.description}
            </p>

            {galleryItems.length > 0 && (
                <>
                    <h2 className="mt-4">Galeria</h2>
                    <Gallery
                        rows={galleryItems}
                        imageGetter={r => `/api/media/${r.mediaId}`}
                        linkGetter={r => `/api/media/${r.mediaId}`}
                        overlayElementsGetters={[
                            r => medias.find(m => m.id === r.mediaId)?.title ?? ''
                        ]}
                        whiteBackground
                    />
                </>
            )}

            {links.length > 0 && (
                <>
                    <h2 className="mt-4">Links</h2>
                    <ol className="list-decimal pl-4">
                        {links.map( (link, lidx) => (
                            <li key={lidx}>
                                <span className="font-bold">{link.label}</span>
                                <a href={link.url} className="link">
                                    {link.url}
                                </a>
                            </li>
                        ))}
                    </ol>
                </>
            )}

            {tools.length > 0 && (
                <>
                    <h2 className="mt-4">Ferramentas usadas</h2>
                    <div className="flex flex-row flex-wrap gap-2">
                        {tools.map( (tool, tidx) => (
                            <a
                                key={tidx}
                                className="block relative w-[80px] h-[80px] bg-white rounded-md"
                                href={`/tools/${tool.id}`}
                            >
                                <img
                                    src={
                                        tool.logoMediaId
                                            ? `/api/media/${tool.logoMediaId}`
                                            : '/nopic.png'
                                    }
                                    alt={tool.title}
                                    title={tool.title}
                                    className="absolute top-0 bottom-0 left-0 right-0 m-auto p-1"
                                />
                            </a>
                        ))}
                    </div>
                </>
            )}

            {otherAttachmentsItems.length > 0 && (
                <>
                    <h2 className="mt-4">Anexos</h2>
                    <ol className="list-decimal pl-4">
                        {otherAttachmentsItems.map((att, aidx) => (
                            <li key={aidx}>
                                <a 
                                    className="link"
                                    href={`/api/media/${att.mediaId}`}
                                >
                                    {medias.find(m => m.id === att.mediaId)?.title ?? `Anexo ${aidx + 1}`}
                                </a>
                            </li>
                        ))}
                    </ol>
                </>
            )}

            {tags.length > 0 && (
                <>
                    <h2 className="mt-4">Tags</h2>
                    {tags.map((t, ti) => (
                        <a key={ti} href={`/tag/${t}`} className="link mr-2">
                            {t}
                        </a>
                    ))}
                </>
            )}

        </div>
    );
}