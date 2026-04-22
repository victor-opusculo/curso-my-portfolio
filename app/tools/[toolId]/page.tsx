import { isAdminSession } from "@/lib/dal";
import { RowNotFound } from "@/lib/database/errors";
import { getProjectsUsedTool, getSingle } from "@/lib/tools/tools"; 
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface Props {
    params: Promise<{ toolId: number }>;
}

const getTool = cache(getSingle);

export async function generateMetadata(props: Props) : Promise<Metadata> {
    const tool = await getTool((await props.params).toolId);
    return { title: tool.title };
}

export default async function GuestToolsView(props: Props) {
    const params = await props.params;

    try {
        const tool = await getTool(params.toolId);
        const projects = await getProjectsUsedTool(params.toolId);

        return (
            <div className="m-4">
                <h2>Ferramenta</h2>
                <div className="text-center">
                    <img
                        src={
                            tool.logoMediaId
                                ? `/api/media/${tool.logoMediaId}`
                                : '/nopic.png'
                        }
                        alt={tool.title}
                        className="max-h-[500px] mx-auto"
                    />
                </div>

                <h2 className="uppercase text-center text-xl my-4">
                    {tool.title}
                </h2>

                <p>{tool.description}</p>

                <h2 className="mt-4">Projetos em que foi usada</h2>
                <div className="flex flex-row flex-wrap gap-2">
                    {projects.map((proj, pidx) => (
                        <a 
                            key={pidx}
                            className="block relative w-[80px] h-[80px] bg-white rounded-md"
                            href={`/projects/${proj.id}`}
                        >
                            <img
                                src={
                                    proj.logoMediaId 
                                        ? `/api/media/${proj.logoMediaId}`
                                        : '/nopic.png'   
                                }
                                alt={proj.title}
                                title={proj.title}
                                className="absolute top-0 bottom-0 left-0 right-0 m-auto p-1"
                            />
                        </a>
                    ))}
                </div>
            </div>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else
            throw (await isAdminSession())
                ? err
                : new Error('Um erro aconteceu!');
    }
}