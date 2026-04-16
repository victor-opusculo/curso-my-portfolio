import { getSingle } from "@/lib/media/media";

export const metadata = { title: 'Ver mídia' };

export default async function AdminMediaView(props: {
    params: Promise<{ mediaId: number }>
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