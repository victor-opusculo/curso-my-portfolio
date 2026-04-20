import AdminProjectEditForm from "@/components/admin/projects/EditForm";
import { RowNotFound } from "@/lib/database/errors";
import { getAttachmentsFromProject } from "@/lib/projects/projectAttachments";
import { getSingle } from "@/lib/projects/projects";
import { getTagsUsedInProject } from "@/lib/projects/tags";
import { getProjectTools } from "@/lib/projects/tools";
import { notFound } from "next/navigation";

export const metadata = { title: 'Editar projeto' };

export default async function AdminProjectEdit(props: {
    params: Promise<{ projId: number }>;
}) {
    const params = await props.params;

    try {
        const project = await getSingle(params.projId);
        const attachments = await getAttachmentsFromProject(params.projId);
        const tags = await getTagsUsedInProject(params.projId)
        const tools = await getProjectTools(params.projId);

        return (
            <>
                <h2>Editar projeto</h2>
                <AdminProjectEditForm
                    existent={project}
                    attachments={attachments}
                    tags={tags}
                    tools={tools.map(t => ({ title: t.title, id: t.id }))}
                />
            </>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}