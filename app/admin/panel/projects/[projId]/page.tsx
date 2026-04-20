import ProjectViewer from "@/components/projects/ProjectViewer";
import { RowNotFound } from "@/lib/database/errors";
import { getFromIds } from "@/lib/media/media";
import { getAttachmentsFromProject } from "@/lib/projects/projectAttachments";
import { getSingle } from "@/lib/projects/projects";
import { getTagsUsedInProject } from "@/lib/projects/tags";
import { getProjectTools } from "@/lib/projects/tools";
import { notFound } from "next/navigation";

export const metadata = { title: 'Ver projeto' };

export default async function AdminProjectView(props: {
    params: Promise<{ projId: number }>;
}) {
    const params = await props.params;

    try {
        const project = await getSingle(params.projId);
        const attachments = await getAttachmentsFromProject(params.projId);
        const medias = await getFromIds(attachments.map(att => att.mediaId));
        const tags = await getTagsUsedInProject(params.projId);
        const tools = await getProjectTools(params.projId);

        return (
            <>
                <h2>Visualizar projeto</h2>
                <ProjectViewer
                    attachments={attachments}
                    medias={medias}
                    project={project}
                    tags={tags}
                    tools={tools}
                />
            </>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}