import AdminBlogEditForm from "@/components/admin/blog/EditForm";
import { getSingle } from "@/lib/blog/blog";
import { getTagsUsedInPost } from "@/lib/blog/tags";

export const metadata = { title: 'Editar post' };

export default async function AdminBlogEdit(props: {
    params: Promise<{ postId: number }>;
}) {
    const params = await props.params;
    const post = await getSingle(params.postId);
    const tags = await getTagsUsedInPost(params.postId);

    return (
        <>
            <h2>Editar post de blog</h2>

            <AdminBlogEditForm existent={post} tags={tags} />
        </>
    );
}