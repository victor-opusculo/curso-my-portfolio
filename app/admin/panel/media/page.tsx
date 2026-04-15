import BasicSearchField from "@/components/data/BasicSearchField";
import DataGrid from "@/components/data/DataGrid";
import OrderByLinks from "@/components/data/OrderByLinks";
import Paginator from "@/components/data/Paginator";
import { media } from "@/data/drizzle/schema";
import { defaultItemsOnPage } from "@/lib/database/helpers";
import { rowsToUiTable, uiValueTransforms } from "@/lib/helpers";
import { getAllCount, getMultiple } from "@/lib/media/media";
import Link from "next/link";

type AllowedColumns = keyof typeof media.$inferSelect;

const fieldsUiMap: Map<AllowedColumns, string> = new Map([
    ['id' satisfies AllowedColumns, 'ID'],
    ['title' satisfies AllowedColumns, 'Título'],
    ['mimeType' satisfies AllowedColumns, 'Tipo MIME'],
    ['fileExtension' satisfies AllowedColumns, 'Extensão de arquivo'],
]);

const orderByMap: Map<string, AllowedColumns> = new Map([
    ['id', 'id' satisfies AllowedColumns],
    ['title', 'title' satisfies AllowedColumns],
    ['mime', 'mimeType' satisfies AllowedColumns],
]);

export const metadata = { title: 'Mídias' };
const thisRoute = '/admin/panel/media';

export default async function AdminMediaHome(props: {
    searchParams: Promise<{ [key: string]: string|string[]|undefined }>;
}) {
    const params = await props.searchParams;
    const q = params.q?.toString() ?? '';
    const orderBy = orderByMap.has(params.order_by?.toString() ?? '')
        ? orderByMap.get(params.order_by?.toString() || '')!
        : (media.id.name as AllowedColumns);
    const pageNum = Number.parseInt(params.page?.toString() ?? '1');
    const ascMode = Boolean(Number.parseInt(params.asc?.toString() ?? '0'));

    const count = await getAllCount(q);
    const rows = await getMultiple(
        q,
        pageNum,
        defaultItemsOnPage,
        orderBy,
        ascMode
    );

    const transformer = uiValueTransforms<AllowedColumns>({
        id: String,
        title: String,
        mimeType: String,
        fileExtension: String
    });

    const rowsProcessed = rowsToUiTable(rows, fieldsUiMap, transformer);

    return (
        <>
            <h2>Mídias</h2>
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
                useHeader
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