import AdminToolEditForm from "@/components/admin/tools/EditForm";
import { RowNotFound } from "@/lib/database/errors";
import { getSingle } from "@/lib/tools/tools";
import { notFound } from "next/navigation";

export const metadata = { title: 'Editar ferramenta' };

export default async function AdminToolEdit(props: {
    params: Promise<{ toolId: number }>;
}) {
    const params = await props.params;

    try {
        const tool = await getSingle(params.toolId);

        return (
            <>
                <h2>Editar ferramenta</h2>
                <AdminToolEditForm existent={tool} />
            </>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}