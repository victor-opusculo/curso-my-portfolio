# Aula 29

## Páginas públicas de projetos

1. Em `app`, criar o diretório `projects`;
1. Nele, criar a home `page.tsx` com:

    ```tsx
    import BasicSearchField from '@/components/data/BasicSearchField';
    import Gallery from '@/components/data/Gallery';
    import Paginator from '@/components/data/Paginator';
    import { getAllCount, getMultiple } from '@/lib/projects/projects';

    export const metadata = { title: 'Projetos' };

    const projectsOnPage = 10;

    export default async function GuestProjectsHome(props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }) {
        const params = await props.searchParams;
        const q = params.q?.toString() ?? '';
        const pageNum = Number(params.page?.toString() ?? '1');

        const count = await getAllCount(q);
        const projects = await getMultiple(
            q,
            pageNum,
            projectsOnPage,
            'title',
            true,
            false
        );

        return (
            <div className="m-4">
                <h2>Projetos</h2>
                <BasicSearchField basePath="/projects" currentValue={q} />

                <Gallery
                    rows={projects}
                    imageGetter={(r) =>
                        r.logoMediaId ? `/api/media/${r.logoMediaId}` : '/nopic.png'
                    }
                    linkGetter={(r) => `/projects/${r.id}`}
                    overlayElementsGetters={[(r) => r.title]}
                />

                <Paginator
                    basePath="/projects"
                    baseQueryString={params}
                    numberResultsOnPage={projectsOnPage}
                    pageNumber={pageNum}
                    totalItems={count}
                />
            </div>
        );
    }

    ```

1. Criar o subdiretório `[projId]`, e, nele, a página `page.tsx` com:

    ```tsx
    import ProjectViewer from '@/components/projects/ProjectViewer';
    import { isAdminSession } from '@/lib/dal';
    import { RowNotFound } from '@/lib/database/errors';
    import { getFromIds } from '@/lib/media/media';
    import { getAttachmentsFromProject } from '@/lib/projects/projectAttachments';
    import { getSingle } from '@/lib/projects/projects';
    import { getTagsUsedInProject } from '@/lib/projects/tags';
    import { getProjectTools } from '@/lib/projects/tools';
    import { Metadata } from 'next';
    import { notFound } from 'next/navigation';
    import { cache } from 'react';

    interface Props {
        params: Promise<{ projId: number }>;
    }

    const getProject = cache(getSingle);

    export async function generateMetadata(props: Props): Promise<Metadata> {
        const project = await getProject((await props.params).projId);
        return { title: project.title };
    }

    export default async function GuestProjectView(props: Props) {
        const params = await props.params;

        try {
            const project = await getProject(params.projId);
            const attachments = await getAttachmentsFromProject(params.projId);
            const medias = await getFromIds(attachments.map((att) => att.mediaId));
            const tags = await getTagsUsedInProject(params.projId);
            const tools = await getProjectTools(params.projId);

            return (
                <div className="m-4">
                    <ProjectViewer
                        attachments={attachments}
                        medias={medias}
                        project={project}
                        tags={tags}
                        tools={tools}
                    />
                </div>
            );
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else
                throw (await isAdminSession()) ? err : new Error('Um erro ocorreu');
        }
    }

    ```