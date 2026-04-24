# Aula 17

## Cadastro de posts de blog

### Função para extrar tags de um único post

1. Em `lib/blog/tags.ts`, adicionar a função:

    ```ts
    export async function getTagsUsedInPost(id: number) {
        const rows = await db
            .select({ tag: blogPostsTags.tag })
            .from(blogPostsTags)
            .where(eq(blogPostsTags.postId, id));
        return rows.map((tobj) => tobj.tag);
    }
    ```

### Páginas de visualização, edição e exclusão

1. Criar dentro de `components` o diretório `blog`;
1. Dentro, o componente `PostViewer.tsx`:

    ```tsx
    import { blogPosts } from '@/data/drizzle/schema';
    import { utcToLocalString } from '@/lib/helpers';

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

    ```

1. E também o `TagCloud.tsx`:

    ```Tsx
    import { getAllTagsUsed } from '@/lib/blog/tags';

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
    ```

1. Agora, em `app/admin/panel/blog`, criar o diretório `[postId]`;
1. Em `[postId]`, criar a página `page.tsx`:

    ```tsx
    import PostViewer from '@/components/blog/PostViewer';
    import { getSingle } from '@/lib/blog/blog';
    import { getTagsUsedInPost } from '@/lib/blog/tags';
    import { RowNotFound } from '@/lib/database/errors';
    import { notFound } from 'next/navigation';

    export const metadata = { title: 'Ver post' };

    export default async function AdminBlogView(props: {
        params: Promise<{ postId: number }>;
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

    ```

1. No mesmo diretório, criar `edit` e `delete`;
1. Em `edit`, a página `page.tsx`:

    ```tsx
    import AdminBlogEditForm from '@/components/admin/blog/EditForm';
    import { getSingle } from '@/lib/blog/blog';
    import { getTagsUsedInPost } from '@/lib/blog/tags';

    export const metadata = { title: 'Editar post' };

    export default async function AdminBlogEdit(props: {
        params: Promise<{ postId: number }>;
    }) {
        const params = await props.params;
        const post = await getSingle(params.postId);
        const tags = await getTagsUsedInPost(post.id);

        return (
            <>
                <h2>Editar post de blog</h2>
                <AdminBlogEditForm existent={post} tags={tags} />
            </>
        );
    }

    ```

1. Em `delete`, a página `page.tsx`:

    ```tsx
    import DeleteEntityForm from '@/components/data/DeleteEntityForm';
    import { deletePost } from '@/lib/blog/actions';
    import { getSingle } from '@/lib/blog/blog';
    import { RowNotFound } from '@/lib/database/errors';
    import { utcToLocalString } from '@/lib/helpers';
    import { notFound } from 'next/navigation';

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
                        serverAction={async () => {
                            'use server';
                            return deletePost(post.id);
                        }}
                    >
                        <p className="text-center font-bold my-2">
                            Tem certeza de que deseja excluir este post?
                        </p>

                        <p>Título: {post.title}</p>
                        <p>Visível: {post.isVisible ? 'Sim' : 'Não'}</p>
                        <p>
                            HTML: {post.enableHtml ? 'Habilitado' : 'Desabilitado'}
                        </p>
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

    ```