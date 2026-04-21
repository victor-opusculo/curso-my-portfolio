import Image from "next/image";
import PostViewer from "@/components/blog/PostViewer";
import { getHomepageBlogPost } from "@/lib/settings/homepage";

export default async function Home() {

  const homePageBlogPost = await getHomepageBlogPost();

  return (
    <div className="mx-4 my-4">
      {(homePageBlogPost && (
        <PostViewer post={homePageBlogPost} hideTimestamps tags={[]} />
      )) || <h1 className="font-2xl text-center">Bem-vindo!</h1>}
    </div>
  );
}
