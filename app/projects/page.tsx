import BasicSearchField from "@/components/data/BasicSearchField";
import Gallery from "@/components/data/Gallery";
import Paginator from "@/components/data/Paginator";
import { getAllCount, getMultiple } from "@/lib/projects/projects";

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
                imageGetter={r =>
                    r.logoMediaId ? `/api/media/${r.logoMediaId}` : '/nopic.png'
                }
                linkGetter={r => `/projects/${r.id}`}
                overlayElementsGetters={[ r => r.title ]}
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