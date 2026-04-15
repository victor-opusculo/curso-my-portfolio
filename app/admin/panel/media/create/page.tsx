import AdminMediaEditForm from "@/components/admin/media/EditForm";
import { maxSizeAllowed } from "@/lib/media/media";

export const metadata = { title: 'Criar mídia' };

export default async function AdminCreateMedia() {
    return (
        <>
            <h2>Nova mídia</h2>
            <AdminMediaEditForm maxSize={maxSizeAllowed} />
        </>
    );
}