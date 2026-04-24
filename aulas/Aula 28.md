# Aula 28

## Página pública de ferramentas

1. Em `app`, criar o diretório `tools`;
1. Nele, criar a homepage `page.tsx` com:

    ```tsx
    import BasicSearchField from '@/components/data/BasicSearchField';
    import Gallery from '@/components/data/Gallery';
    import Paginator from '@/components/data/Paginator';
    import { defaultItemsOnPage } from '@/lib/database/helpers';
    import { getAllCount, getMultiple } from '@/lib/tools/tools';

    export const metadata = { title: 'Ferramentas' };
    export const dynamic = 'force-dynamic';
    const thisRoute = '/tools';

    export default async function GuestToolsHome(props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }) {
        const params = await props.searchParams;
        const q = params.q?.toString() ?? '';
        const pageNum = Number(params.page?.toString() ?? '1');

        const tools = await getMultiple(
            q,
            pageNum,
            defaultItemsOnPage,
            'title',
            true
        );
        const count = await getAllCount(q);

        return (
            <div className="m-4">
                <h2>Ferramentas</h2>

                <BasicSearchField basePath={thisRoute} currentValue={q} />

                <Gallery
                    rows={tools}
                    overlayElementsGetters={[(t) => t.title]}
                    imageGetter={(t) =>
                        t.logoMediaId ? `/api/media/${t.logoMediaId}` : '/nopic.png'
                    }
                    linkGetter={(t) => `/tools/${t.id}`}
                    whiteBackground
                />
                <Paginator
                    basePath={thisRoute}
                    baseQueryString={params}
                    numberResultsOnPage={defaultItemsOnPage}
                    pageNumber={pageNum}
                    totalItems={count}
                />
            </div>
        );
    }

    ```

1. No mesmo diretório, criar o subdiretório `[toolId]` com a página `page.tsx`:

    ```tsx
    import { isAdminSession } from '@/lib/dal';
    import { RowNotFound } from '@/lib/database/errors';
    import { getProjectsUsedTool, getSingle } from '@/lib/tools/tools';
    import { Metadata } from 'next';
    import { notFound } from 'next/navigation';
    import { cache } from 'react';

    interface Props {
        params: Promise<{ toolId: number }>;
    }

    const getTool = cache(getSingle);

    export async function generateMetadata(props: Props): Promise<Metadata> {
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

    ```