import PostViewer from "@/components/blog/PostViewer";
import HistoryBackButton from "@/components/data/HistoryBackButton";
import { getSingle } from "@/lib/blog/blog";
import { getTagsUsedInPost } from "@/lib/blog/tags";
import { isAdminSession } from "@/lib/dal";
import { RowNotFound } from "@/lib/database/errors";
import { Param } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

const getPost = cache(getSingle);
const getTags = cache(getTagsUsedInPost);

interface Props {
    params: Promise<{ postId: number }>;
}

export async function generateMetadata(props: Props) : Promise<Metadata> {
    const params = await props.params;
    const post = await getPost(params.postId);

    return { title: post.title };
}

export default async function GuestBlogView(props: Props) {
    const params = await props.params;

    try {
        let post = await getPost(params.postId);
        let tags = await getTags(params.postId);

        if (!Boolean(post.isVisible)) notFound();

        return (
            <div className="mx-8 my-4">
                <PostViewer post={post} tags={tags} />

                <div className="my-4">
                    <HistoryBackButton />
                </div>
            </div>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else
            throw (await isAdminSession())
                ? err
                : new Error('Um erro aconteceu!');
    }
}