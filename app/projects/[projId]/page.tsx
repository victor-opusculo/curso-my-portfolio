import ProjectViewer from "@/components/projects/ProjectViewer";
import { isAdminSession } from "@/lib/dal";
import { RowNotFound } from "@/lib/database/errors";
import { getFromIds } from "@/lib/media/media";
import { getAttachmentsFromProject } from "@/lib/projects/projectAttachments";
import { getSingle } from "@/lib/projects/projects";
import { getTagsUsedInProject } from "@/lib/projects/tags";
import { getProjectTools } from "@/lib/projects/tools";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface Props {
    params: Promise<{ projId: number }>;
}

const getProject = cache(getSingle);

export async function generateMetadata(props: Props) : Promise<Metadata> {
    const project = await getProject((await props.params).projId);
    return { title: project.title };
}

export default async function GuestProjectView(props: Props) {
    const params = await props.params;

    try {
        const project = await getProject(params.projId);
        const attachments = await getAttachmentsFromProject(params.projId);
        const medias = await getFromIds(attachments.map(att => att.mediaId));
        const tags = await getTagsUsedInProject(params.projId);
        const tools = await getProjectTools(params.projId);

        return (
            <div className="m-4">
                <ProjectViewer
                    attachments={attachments}
                    medias={medias}
                    project={project}
                    tags={tags}
                    tools={tools}
                />
            </div>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else
            throw (await isAdminSession()) ? err : new Error('Um erro ocorreu');
    }
}