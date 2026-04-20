import DeleteEntityForm from "@/components/data/DeleteEntityForm";
import { RowNotFound } from "@/lib/database/errors";
import { removeProject } from "@/lib/projects/actions";
import { getSingle } from "@/lib/projects/projects";
import { notFound } from "next/navigation";

export const metadata = { title: 'Excluir projeto' };

export default async function AdminProjectsDelete(props: {
    params: Promise<{ projId: number } >;
}) {
    const params = await props.params;

    try {
        const project = await getSingle(params.projId);

        return (
            <>
                <h2>Excluir projeto</h2>

                <DeleteEntityForm
                    serverAction={async () => {
                        'use server';
                        return removeProject(project.id);
                    }}
                >
                    <p className="text-center font-bold my-2">
                        Tem certeza de que deseja excluir este projeto?
                    </p>

                    <p className="font-bold">{project.title}</p>
                    <p>{project.description}</p>
                </DeleteEntityForm>
            </>
        );
    }
    catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}