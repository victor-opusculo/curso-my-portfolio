import DeleteEntityForm from "@/components/data/DeleteEntityForm";
import { deletePost } from "@/lib/blog/actions";
import { getSingle } from "@/lib/blog/blog";
import { RowNotFound } from "@/lib/database/errors";
import { utcToLocalString } from "@/lib/helpers"; 
import { notFound } from "next/navigation";

export const metadata = { title: 'Excluir post' };

export default async function AdminBlogDelete(props: {
    params: Promise<{ postId: number }>;
}) {
    const params = await props.params;

    try {
        let post = await getSingle(params.postId);

        return (
            <>
                <h2>Excluir post de blog</h2>

                <DeleteEntityForm
                    serverAction={async() => {
                        'use server';
                        return deletePost(post.id);
                    }}
                >
                    <p className="text-center font-bold my-2">
                        Tem certeza de que deseja excluir este post?
                    </p>

                    <p>Título: {post.title}</p>
                    <p>Visível: {post.isVisible ? 'Sim' : 'Não'}</p>
                    <p>HTML: {post.enableHtml ? 'Habilitado' : 'Desabilitado'}</p>
                    <p>Publicado em: {utcToLocalString(post.publishedAtUtc)}</p>
                    <p>Atualizado em: {utcToLocalString(post.updatedAtUtc)}</p>
                </DeleteEntityForm>
            </>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}