import TagCloud from "@/components/blog/TagCloud";
import BasicSearchField from "@/components/data/BasicSearchField";
import Paginator from "@/components/data/Paginator";
import { getAllCount, getMultiple } from "@/lib/blog/blog";
import { truncate, utcToLocalString } from "@/lib/helpers";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = 'force-dynamic';
const thisRoute = '/blog';

export const metadata: Metadata = {
    title: 'Blog'
};

export default async function GuestBlogHome(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const postsOnPage = 30;

    const params = await props.searchParams;

    const q = params.q?.toString() ?? '';
    const pageNum = Number.parseInt(params.page?.toString() ?? '1');

    const count = await getAllCount(q, true);
    const posts = await getMultiple(
        q,
        pageNum,
        postsOnPage,
        'publishedAtUtc',
        false,
        true,
        true
    );

    return (
        <div className="mx-8 my-4">
            <h2>Blog</h2>

            <BasicSearchField basePath={thisRoute} currentValue={q} />
            <div className="md:flex md:flex-row md:gap-8">
                <div className="md:grow">
                    {posts.length > 0 ? (
                        posts.map((post, idx) => (
                            <article
                                className="w-full block mb-4 border-b border-b-neutral-300 dark:border-b-neutral-700"
                                key={idx}
                            >
                                <h3 className="font-bold text-lg my-2">
                                    <Link href={`/blog/${post.id}`}>
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="font-sm text-right italic">
                                    {utcToLocalString(post.publishedAtUtc)}
                                </p>
                                <div className="whitespace-pre-line">
                                    {truncate(post.content, 280)}
                                </div>

                                <div className="text-right">
                                    <Link
                                        href={`/blog/${post.id}`}
                                        className="link font-bold"
                                    >
                                        Ler mais
                                    </Link>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p className="text-center text-lg">
                            Ainda não há posts!
                        </p>
                    )}
                </div>
                <aside className="md:shrink">
                    <h3>Nuvem de tags</h3>
                    <TagCloud />
                </aside>
            </div>

            <Paginator
                basePath={thisRoute}
                baseQueryString={params}
                numberResultsOnPage={postsOnPage}
                pageNumber={pageNum}
                totalItems={count}
            />

        </div>
    );

}