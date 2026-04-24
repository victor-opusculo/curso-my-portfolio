# Aula 13

## Visualização, edição, e exclusão de mídias

1. Dentro de `app/admin/panel/media`, criar o diretório `[mediaId]`, e, dentro, a página `page.tsx` com:

    ```tsx
    import { getSingle } from '@/lib/media/media';

    export const metadata = { title: 'Ver mídia' };

    export default async function AdminMediaView(props: {
        params: Promise<{ mediaId: number }>;
    }) {
        const params = await props.params;
        const media = await getSingle(params.mediaId);

        return (
            <>
                <h2>Ver mídia</h2>

                <div className="w-full text-center">
                    <img
                        src={`/api/media/${params.mediaId}`}
                        className="w-auto max-h-[500px] mx-auto"
                        alt={media.title}
                    />
                </div>

                <div className="mt-4">
                    <span className="block">ID nº {media.id}</span>
                    <span className="block">Extensão: {media.fileExtension}</span>
                    <span className="block">Tipo MIME: {media.mimeType}</span>
                    <span className="block">
                        Acesso direto:{' '}
                        <a
                            className="link"
                            href={`/api/media/${media.id}`}
                        >{`/api/media/${media.id}`}</a>
                    </span>
                    <span className="block font-bold mt-2">{media.title}</span>
                </div>
            </>
        );
    }

    ```
1. Depois, dentro de `[mediaId]`, criar o diretório `edit` com a página `page.tsx`:

    ```tsx
    import AdminMediaEditForm from '@/components/admin/media/EditForm';
    import { getSingle } from '@/lib/media/media';
    import { maxSizeAllowed } from '@/lib/media/media';

    export const metadata = { title: 'Editar mídia' };

    export default async function AdminMediaEdit(props: {
        params: Promise<{ mediaId: number }>;
    }) {
        const params = await props.params;
        const media = await getSingleMedia(params.mediaId);

        return (
            <>
                <h2>Editar mídia</h2>
                <AdminMediaEditForm
                    existent={{ id: media.id, title: media.title }}
                    maxSize={maxSizeAllowed}
                />
            </>
        );
    }
    ```
1. Ainda dentro de `[mediaId]`, criar o diretório `delete` com a página `page.tsx`:

    ```tsx
    import DeleteEntityForm from '@/components/data/DeleteEntityForm';
    import { getSingleMedia, removeMedia } from '@/lib/media/actions';

    export const metadata = { title: 'Excluir mídia' };

    export default async function AdminMediaDelete(props: {
        params: Promise<{ mediaId: number }>;
    }) {
        const params = await props.params;
        const media = await getSingleMedia(params.mediaId);

        return (
            <>
                <h2>Excluir mídia</h2>

                <DeleteEntityForm
                    serverAction={async () => {
                        'use server';
                        return removeMedia(media.id);
                    }}
                >
                    <div className="w-full text-center">
                        <img
                            src={`/api/media/${params.mediaId}`}
                            className="w-auto max-h-[500px] mx-auto"
                            alt={media.title}
                        />
                    </div>

                    <div className="mt-4">
                        <p className="text-center font-bold my-2">
                            Tem certeza de que deseja excluir esta mídia?
                        </p>

                        <span className="block">ID nº {media.id}</span>
                        <span className="block">
                            Extensão {media.fileExtension}
                        </span>
                        <span className="block">Tipo MIME {media.mimeType}</span>
                        <span className="block font-bold mt-2">{media.title}</span>
                    </div>
                </DeleteEntityForm>
            </>
        );
    }
    ```

## Api para visualização e download

1. Dentro de `app`, criar o diretório `api` e dentro `media`/`[id]` com o endpoint `route.ts`:

    ```ts
    import { RowNotFound } from '@/lib/database/errors';
    import { getStream } from '@/lib/media/media';
    import { NextResponse } from 'next/server';

    export async function GET(
        request: Request,
        { params }: { params: Promise<{ id: string }> }
    ) {
        const id = Number.parseInt((await params).id);

        try {
            const { stream, extension, mime } = await getStream(id);

            //@ts-ignore
            const response = new NextResponse(stream);
            response.headers.append('Content-Type', mime);
            response.headers.append(
                'Content-Disposition',
                `filename="midia${extension}"`
            );

            return response;
        } catch (err) {
            return NextResponse.json(
                {
                    error:
                        err instanceof RowNotFound
                            ? 'Mídia não localizada!'
                            : 'Erro ao carregar mídia',
                },
                { status: 404 }
            );
        }
    }

    ```