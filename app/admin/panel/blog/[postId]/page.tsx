import PostViewer from "@/components/blog/PostViewer";
import { getSingle } from "@/lib/blog/blog";
import { getTagsUsedInPost } from "@/lib/blog/tags";
import { RowNotFound } from "@/lib/database/errors";
import { notFound } from "next/navigation";

export const metadata = { title: 'Ver post' };

export default async function AdminBlogView(props: {
    params: Promise<{ postId: number}>;
}) {
    const params = await props.params;

    try {
        let post = await getSingle(params.postId);
        let tags = await getTagsUsedInPost(params.postId);

        return (
            <>
                <h2>Ver post de blog</h2>

                <hr />

                <PostViewer post={post} tags={tags} />
            </>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}