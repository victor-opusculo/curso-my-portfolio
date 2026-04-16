import AdminMediaEditForm from "@/components/admin/media/EditForm";
import { getSingle } from "@/lib/media/media";
import { maxSizeAllowed } from "@/lib/media/media";

export const metadata = { title: 'Editar mídia' };

export default async function AdminMediaEdit(props: {
    params: Promise<{ mediaId: number }>
}) {
    const params = await props.params;
    const media = await getSingle(params.mediaId);

    return (
        <>
            <h2>Editar mídia</h2>
            <AdminMediaEditForm
                existent={{ id: media.id, title: media.title }}
                maxSize={maxSizeAllowed}
            />
        </>
    );
}