import { RowNotFound } from "@/lib/database/errors";
import { getSingle } from "@/lib/tools/tools";
import { notFound } from "next/navigation";

export const metadata = { title: 'Ver ferramenta' };

export default async function AdminToolView(props: {
    params: Promise<{ toolId: number }>;
}) {
    const params = await props.params;

    try {
        const tool = await getSingle(params.toolId);

        return (
            <>
                <h2>Ver ferramenta</h2>
                <div className="text-center  my-2">
                    <img
                        src={`/api/media/${tool.logoMediaId}`}
                        className="max-h-[500px]"
                        alt={tool.title}
                        title={tool.title}
                    />
                </div>

                <div>
                    <span className="block font-bold text-lg">
                        {tool.title}
                    </span>
                    <span className="block">ID nº {tool.id}</span>

                    <div className="whitespace-pre-line w-full mt-4">
                        {tool.description}
                    </div>
                </div>

            </>
        );
    } catch (err) {
        if (err instanceof RowNotFound) notFound();
        else throw err;
    }
}