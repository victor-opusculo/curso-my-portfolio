import { blogPosts } from "@/data/drizzle/schema";
import { utcToLocalString } from "@/lib/helpers";

export default function PostViewer(props: {
    post: typeof blogPosts.$inferSelect;
    hideTimestamps?: boolean;
    tags: string[];
}) {
    const post = props.post;

    return (
        <div>
            <h3 className="text-center font-bold text-2xl my-2">
                {post.title}
            </h3>

            {!Boolean(props.hideTimestamps) && (
                <p className="italic text-right text-sm my-2">
                    Publicado em: {utcToLocalString(post.publishedAtUtc)}
                </p>
            )}

            {!Boolean(props.hideTimestamps) && (
                <p className="italic text-right text-sm my-2">
                    Atualizado em: {utcToLocalString(post.updatedAtUtc)}
                </p>
            )}

            {Boolean(post.enableHtml) && (
                <article
                    className="whitespace-pre-line w-full block"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            )}

            {!Boolean(post.enableHtml) && (
                <article className="whitespace-pre-line w-full block">
                    {post.content}
                </article>
            )}

            {props.tags?.length > 0 && (
                <>
                    <h2 className="mt-8">Tags</h2>
                    {props.tags.map((t, ti) => (
                        <a key={ti} href={`/tag/${t}`} className="link mr-2">
                            {t}
                        </a>
                    ))}
                </>
            )}
        </div>
    );
}