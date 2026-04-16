import DeleteEntityForm from "@/components/data/DeleteEntityForm";
import { getSingle } from "@/lib/media/media";
import { removeMedia } from "@/lib/media/actions";

export const metadata = { title: 'Excluir mídia' };

export default async function AdminMediaDelete(props: {
    params: Promise<{ mediaId: number }>
}) {
    const params = await props.params;
    const media = await getSingle(params.mediaId);

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
                    <span className="block">Extensão: {media.fileExtension}</span>
                    <span className="block">Tipo MIME: {media.mimeType}</span>
                    <span className="block font-bold mt-2">{media.title}</span>
                </div>
            </DeleteEntityForm>
        </>
    );
}