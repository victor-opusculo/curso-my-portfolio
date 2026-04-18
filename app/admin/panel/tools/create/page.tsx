import AdminToolEditForm from "@/components/admin/tools/EditForm";

export const metadata = { title: 'Criar ferramenta' };

export default async function AdminToolsCreate() {
    return (
        <>
            <h2>Criar ferramenta</h2>
            <AdminToolEditForm />
        </>
    )
}