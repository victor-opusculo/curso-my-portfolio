import BasicSearchField from "@/components/data/BasicSearchField";
import Gallery from "@/components/data/Gallery";
import Paginator from "@/components/data/Paginator";
import { defaultItemsOnPage } from "@/lib/database/helpers";
import { getAllCount, getMultiple } from "@/lib/tools/tools";

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
                overlayElementsGetters={[ t => t.title ]}
                imageGetter={t =>
                    t.logoMediaId ? `/api/media/${t.logoMediaId}` : '/nopic.png'
                }
                linkGetter={t => `/tools/${t.id}`}
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