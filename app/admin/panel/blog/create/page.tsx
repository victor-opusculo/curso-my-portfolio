import AdminBlogEditForm from "@/components/admin/blog/EditForm";

export const metadata = { title: 'Novo post' };

export default function AdminBlogCreate() {
    return (
        <>
            <h2>Criar post no blog</h2>

            <AdminBlogEditForm />
        </>
    );
}