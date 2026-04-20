import AdminProjectEditForm from "@/components/admin/projects/EditForm";

export const metadata = { title: 'Criar projeto' };

export default async function AdminProjectCreate() {
    return (
        <>
            <h2>Criar projeto</h2>
            <AdminProjectEditForm />
        </>
    );
}