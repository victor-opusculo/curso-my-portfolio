import BasicSearchField from "@/components/data/BasicSearchField";
import DataGrid from "@/components/data/DataGrid";
import { projects } from "@/data/drizzle/schema";
import { defaultItemsOnPage } from "@/lib/database/helpers";
import { getAllCount, getMultiple } from "@/lib/projects/projects";
import Link from "next/link";
import {
    rowsToUiTable,
    truncate,
    uiValueTransforms,
} from '@/lib/helpers';
import OrderByLinks from "@/components/data/OrderByLinks";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import Paginator from "@/components/data/Paginator";

dayjs.extend(utc);

type AllowedColumns = keyof typeof projects.$inferSelect;
type AllowedColumnsAndTags = AllowedColumns | 'tags';

const fieldsUiMap: Map<AllowedColumnsAndTags, string> = new Map([
    ['id' satisfies AllowedColumnsAndTags, 'ID'],
    ['title' satisfies AllowedColumnsAndTags, 'Título'],
    ['logoMediaId' satisfies AllowedColumnsAndTags, 'Logo'],
    ['tags' satisfies AllowedColumnsAndTags, 'Tags'],
]);

const orderByMap: Map<string, AllowedColumns> = new Map([
    ['id', 'id' satisfies AllowedColumns],
    ['title', 'title' satisfies AllowedColumns],
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

    const transformer = uiValueTransforms<Exclude<AllowedColumnsAndTags, 'description' | 'linksJson'>>({
        id: String,
        title: v => truncate(v, 100),
        logoMediaId: id => (
            <img src={`/api/media/${id}`} className="max-h-[64px]" />
        ),
        tags: arr => (Array.isArray(arr) ? arr.join(', ') : '')
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