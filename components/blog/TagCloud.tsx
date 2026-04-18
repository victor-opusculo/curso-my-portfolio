import { getAllTagsUsed } from "@/lib/blog/tags";

export default async function TagCloud() {

    const tags = await getAllTagsUsed();

    return (
        <div className="flex flex-row flex-wrap gap-2">
            {tags.map((tag, tidx) => (
                <a key={tidx} className="link" href={`/tag/${tag}`}>
                    {tag}
                </a>
            ))}
        </div>
    );
}