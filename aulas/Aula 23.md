# Aula 23

## Cadastro de projetos

### Visualizador de projetos

1. Criar em `components` o diretório `projects`, e, nele, o componente `ProjectViewer.tsx` com:

    ```tsx
    import { media, projects, tools } from '@/data/drizzle/schema';
    import { AttachmentData } from '@/lib/projects/projectAttachments';
    import Gallery from '../data/Gallery';

    interface ProjectViewerProps {
        project: typeof projects.$inferSelect;
        attachments: AttachmentData[];
        medias: (typeof media.$inferSelect)[];
        tags: string[];
        tools: (typeof tools.$inferSelect)[];
    }

    export default function ProjectViewer(props: ProjectViewerProps) {
        const { project, attachments, medias, tags, tools } = props;

        const galleryItems = attachments.filter((att) => att.isGallery);
        const otherAttachmentsItems = attachments.filter((att) => !att.isGallery);
        const links = JSON.parse(project.linksJson) as {
            label: string;
            url: string;
        }[];

        return (
            <div>
                <div className="text-center my-4">
                    <img
                        src={
                            project.logoMediaId
                                ? `/api/media/${project.logoMediaId}`
                                : '/nopic.png'
                        }
                        alt={project.title}
                        title={project.title}
                        className="max-h-[200px] mx-auto"
                    />
                </div>
                <span className="block text-center uppercase text-4xl">
                    {project.title}
                </span>
                <p className="whitespace-pre-line mt-4 text-justify">
                    {project.description}
                </p>

                {galleryItems.length > 0 && (
                    <>
                        <h2 className="mt-4">Galeria</h2>
                        <Gallery
                            rows={galleryItems}
                            imageGetter={(r) => `/api/media/${r.mediaId}`}
                            linkGetter={(r) => `/api/media/${r.mediaId}`}
                            overlayElementsGetters={[
                                (r) =>
                                    medias.find((m) => m.id === r.mediaId)?.title ??
                                    '',
                            ]}
                            whiteBackground
                        />
                    </>
                )}

                {links.length > 0 && (
                    <>
                        <h2 className="mt-4">Links</h2>
                        <ol className="list-decimal pl-4">
                            {links.map((link, lidx) => (
                                <li key={lidx}>
                                    <span className="font-bold">{link.label}:</span>
                                    <a href={link.url} className="link">
                                        {link.url}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </>
                )}

                {tools.length > 0 && (
                    <>
                        <h2 className="mt-4">Ferramentas usadas</h2>
                        <div className="flex flex-row flex-wrap gap-2">
                            {tools.map((tool, tidx) => (
                                <a
                                    key={tidx}
                                    className="block relative w-[80px] h-[80px] bg-white rounded-md"
                                    href={`/tools/${tool.id}`}
                                >
                                    <img
                                        src={
                                            tool.logoMediaId
                                                ? `/api/media/${tool.logoMediaId}`
                                                : '/nopic.png'
                                        }
                                        alt={tool.title}
                                        title={tool.title}
                                        className="absolute top-0 bottom-0 left-0 right-0 m-auto p-1"
                                    />
                                </a>
                            ))}
                        </div>
                    </>
                )}

                {otherAttachmentsItems.length > 0 && (
                    <>
                        <h2 className="mt-4">Anexos</h2>
                        <ol className="list-decimal pl-4">
                            {otherAttachmentsItems.map((att, aidx) => (
                                <li key={aidx}>
                                    <a
                                        key={aidx}
                                        className="link"
                                        href={`/api/media/${att.mediaId}`}
                                    >
                                        {medias.find((m) => m.id === att.mediaId)
                                            ?.title ?? `Anexo ${aidx + 1}`}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </>
                )}

                {tags.length > 0 && (
                    <>
                        <h2 className="mt-4">Tags</h2>
                        {tags.map((t, ti) => (
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

### Páginas de administração

1. Criar em `app/admin/panel` o diretório `projects`;
1. Criar a home `page.tsx` nele:

    ```tsx
    import BasicSearchField from '@/components/data/BasicSearchField';
    import DataGrid from '@/components/data/DataGrid';
    import { projects } from '@/data/drizzle/schema';
    import { defaultItemsOnPage } from '@/lib/database/helpers';
    import { getAllCount, getMultiple } from '@/lib/projects/projects';
    import Link from 'next/link';
    import {
        rowsToUiTable,
        truncate,
        uiValueTransforms,
        utcToLocalString,
    } from '@/lib/helpers';
    import OrderByLinks from '@/components/data/OrderByLinks';
    import dayjs from 'dayjs';
    import utc from 'dayjs/plugin/utc';
    import Paginator from '@/components/data/Paginator';

    dayjs.extend(utc);

    type AllowedColumns = keyof typeof projects.$inferSelect;
    type AllowedColumnsAndTags = AllowedColumns | 'tags';

    const fieldsUiMap: Map<AllowedColumnsAndTags, string> = new Map([
        ['id' as AllowedColumns, 'ID'],
        ['title' as AllowedColumns, 'Título'],
        ['logoMediaId' as AllowedColumns, 'Logo'],
        ['tags' as AllowedColumnsAndTags, 'Tags'],
    ]);

    const orderByMap: Map<string, AllowedColumns> = new Map([
        ['id', 'id' as AllowedColumns],
        ['title', 'title' as AllowedColumns],
    ]);

    export const metadata = { title: 'Projetos' };
    const thisRoute = '/admin/panel/projects';

    export default async function AdminProjectsHome(props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }) {
        const params = await props.searchParams;
        const q = params.q?.toString() ?? '';
        const orderBy = orderByMap.has(params.order_by?.toString() ?? '')
            ? orderByMap.get(params.order_by?.toString() || '')!
            : (projects.id.name as AllowedColumns);
        const pageNum = Number.parseInt(params.page?.toString() ?? '1');
        const ascMode = Boolean(Number.parseInt(params.asc?.toString() ?? '0'));

        const count = await getAllCount(q);
        const rows = await getMultiple(
            q,
            pageNum,
            defaultItemsOnPage,
            orderBy,
            ascMode,
            true
        );

        const transformer = uiValueTransforms<
            Exclude<AllowedColumnsAndTags, 'description' | 'linksJson'>
        >({
            id: String,
            title: (v) => truncate(v, 100),
            logoMediaId: (id) => (
                <img src={`/api/media/${id}`} className="max-h-[64px]" />
            ),
            tags: (arr) => (Array.isArray(arr) ? arr.join(', ') : ''),
        });
        const rowsProcessed = rowsToUiTable(rows, fieldsUiMap, transformer);

        return (
            <>
                <h2>Projetos</h2>
                <BasicSearchField basePath={thisRoute} currentValue={q} />

                <OrderByLinks
                    fieldsUiMap={fieldsUiMap}
                    orderByMap={orderByMap}
                    queryParams={params}
                    route={thisRoute}
                />

                <div className="text-left my-2">
                    <Link
                        className="btn"
                        href={`${thisRoute}/create`}
                        prefetch={false}
                    >
                        Criar
                    </Link>
                </div>
                <DataGrid
                    tableUnfixed
                    data={rowsProcessed}
                    rudButtonsParameterName="ID"
                    detailsUrl={`${thisRoute}/{param}`}
                    editUrl={`${thisRoute}/{param}/edit`}
                    deleteUrl={`${thisRoute}/{param}/delete`}
                    useHeader={true}
                />

                <Paginator
                    basePath={thisRoute}
                    baseQueryString={params}
                    pageNumber={pageNum}
                    numberResultsOnPage={defaultItemsOnPage}
                    totalItems={count}
                />
            </>
        );
    }

    ```

1. Em seguida, criar o diretório `create` e dentro dele a página `page.tsx`:

    ```tsx
    import AdminProjectEditForm from '@/components/admin/projects/EditForm';

    export const metadata = { title: 'Criar projeto' };

    export default async function AdminProjectCreate() {
        return (
            <>
                <h2>Criar projeto</h2>
                <AdminProjectEditForm />
            </>
        );
    }

    ```

1. Depois, ainda em `projects`, criar o diretório `[projId]`;
1. Nele, criar a página `page.tsx` com:

    ```tsx
    import ProjectViewer from '@/components/projects/ProjectViewer';
    import { RowNotFound } from '@/lib/database/errors';
    import { getFromIds } from '@/lib/media/media';
    import { getAttachmentsFromProject } from '@/lib/projects/projectAttachments';
    import { getSingle } from '@/lib/projects/projects';
    import { getTagsUsedInProject } from '@/lib/projects/tags';
    import { getProjectTools } from '@/lib/projects/tools';
    import { notFound } from 'next/navigation';

    export const metadata = { title: 'Ver projeto' };

    export default async function AdminProjectView(props: {
        params: Promise<{ projId: number }>;
    }) {
        const params = await props.params;

        try {
            const project = await getSingle(params.projId);
            const attachments = await getAttachmentsFromProject(params.projId);
            const medias = await getFromIds(attachments.map((att) => att.mediaId));
            const tags = await getTagsUsedInProject(params.projId);
            const tools = await getProjectTools(params.projId);

            return (
                <>
                    <h2>Visualizar projeto</h2>
                    <ProjectViewer
                        attachments={attachments}
                        medias={medias}
                        project={project}
                        tags={tags}
                        tools={tools}
                    />
                </>
            );
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else throw err;
        }
    }

    ```

1. Criar os diretórios `edit` e `delete`;

1. Em `edit`, a página `page.tsx`:

    ```tsx
    import AdminProjectEditForm from '@/components/admin/projects/EditForm';
    import { RowNotFound } from '@/lib/database/errors';
    import { getAttachmentsFromProject } from '@/lib/projects/projectAttachments';
    import { getSingle } from '@/lib/projects/projects';
    import { getTagsUsedInProject } from '@/lib/projects/tags';
    import { getProjectTools } from '@/lib/projects/tools';
    import { notFound } from 'next/navigation';

    export const metadata = { title: 'Editar projeto' };

    export default async function AdminProjectEdit(props: {
        params: Promise<{ projId: number }>;
    }) {
        const params = await props.params;

        try {
            const project = await getSingle(params.projId);
            const attachments = await getAttachmentsFromProject(params.projId);
            const tags = await getTagsUsedInProject(params.projId);
            const tools = await getProjectTools(params.projId);

            return (
                <>
                    <h2>Editar projeto</h2>
                    <AdminProjectEditForm
                        existent={project}
                        attachments={attachments}
                        tags={tags}
                        tools={tools.map((t) => ({ title: t.title, id: t.id }))}
                    />
                </>
            );
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else throw err;
        }
    }
    ```

1. Em `delete`, a página `page.tsx`:

    ```tsx
    import DeleteEntityForm from '@/components/data/DeleteEntityForm';
    import { RowNotFound } from '@/lib/database/errors';
    import { removeProject } from '@/lib/projects/actions';
    import { getSingle } from '@/lib/projects/projects';
    import { notFound } from 'next/navigation';

    export const metadata = { title: 'Excluir projeto' };

    export default async function AdminProjectsDelete(props: {
        params: Promise<{ projId: number }>;
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
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else throw err;
        }
    }

    ```