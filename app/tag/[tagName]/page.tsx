import DataGrid from "@/components/data/DataGrid";
import Paginator from "@/components/data/Paginator";
import { tagSearch, TagSearchRow } from "@/lib/tags/tags";
import { Metadata } from "next";

interface Props {
    params: Promise<{ tagName: string }>;
    searchParams: Promise<{ [key: string ]: string | string[] | undefined }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const tag = (await props.params).tagName;
    return { title: `Tag ${decodeURIComponent(tag)}` };
}

const itemsOnPage = 50;

const getRowInfo = (row: TagSearchRow, info: 'url'|'title'|'type' ) => {
    switch (info) {
        case 'type':
            return row.type === 'project' ? 'Projeto' : 'Post no blog';
        case 'url':
            return row.type === 'project'
                ? `/projects/${row.id}`
                : `/blog/${row.id}`
        case 'title':
        default:
            return row.title;
    }
};

export default async function GuestTagSearch(props: Props) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const pageNum = Number(searchParams.page?.toString() ?? 1);
    const tagName = decodeURIComponent(params.tagName);

    const { rows, count } = await tagSearch(tagName, pageNum, itemsOnPage);

    const transformed = rows.map(row => ({
        Tipo: getRowInfo(row, 'type'),
        Nome: (
            <a href={getRowInfo(row, 'url')} className="link">
                {getRowInfo(row, 'title')}
            </a>
        )
    }));

    return (
        <div className="m-4">
            <h2 className="my-8">Tag: {tagName}</h2>

            <DataGrid data={transformed} />

            <Paginator
                basePath={`/tag/${tagName}`}
                baseQueryString={searchParams}
                pageNumber={pageNum}
                numberResultsOnPage={itemsOnPage}
                totalItems={count}
            />
        </div>
    );

}