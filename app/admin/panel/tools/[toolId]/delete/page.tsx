import DeleteEntityForm from "@/components/data/DeleteEntityForm";
import { RowNotFound } from "@/lib/database/errors";
import { removeTool } from "@/lib/tools/actions";
import { getSingle } from "@/lib/tools/tools";
import { notFound } from "next/navigation";

export const metadata = { title: 'Excluir ferramenta' };

export default async function AdminToolDelete(props: {
    params: Promise<{ toolId: number }>;
}) {
    const params = await props.params;

    try {
        const tool = await getSingle(params.toolId);

        return (
            <>
                <h2>Excluir ferramenta</h2>
                <DeleteEntityForm
                    serverAction={async() => {
                        'use server';
                        return removeTool(tool.id);
                    }}
                >
                    <p className="text-center font-bold my-2">
                        Tem certeza de que deseja excluir esta ferramenta?
                    </p>

                    <div className="w-full my-2">
                        <img
                            src={`/api/media/${tool.logoMediaId}`}
                            className="max-h-[500px]"
                        />
                    </div>
                    <p>Título: {tool.title}</p>
                </DeleteEntityForm>
            </>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}