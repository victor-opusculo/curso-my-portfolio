'use client';

import ClientDataGrid from "@/components/data/client/ClientDataGrid";
import ClientPaginator from "@/components/data/client/ClientPaginator";
import ClientSearchField from "@/components/data/client/ClientSearchField";
import { tools } from "@/data/drizzle/schema";
import { rowsToUiTable, uiValueTransforms } from "@/lib/helpers";
import { getMultipleTools } from "@/lib/tools/actions";
import { useEffect, useState } from "react";

interface AdminToolsClientSelectProps {
    setIdAndTitle: (id: number, title: string) => void;
}

type AllowedColumns = keyof typeof tools.$inferSelect;

const fieldsUiMap: Map<AllowedColumns|'logo', string> = new Map([
    ['id' satisfies AllowedColumns, "ID"],
    ['title' satisfies AllowedColumns, "Título"],
    ['logo' satisfies AllowedColumns | 'logo', "Logo"],
]);

const transformer = uiValueTransforms<Exclude<AllowedColumns, 'description'|'logoMediaId'> |'logo'>({
    id: String,
    title: String,
    logo: id => (
        <img src={`/api/media/${id}`} width={128} className="max-h-[64px]" />
    )
});

const addLogoColumn = (rows: (typeof tools.$inferSelect)[]) => {
    return rows.map(r => ({ ...r, logo: r.logoMediaId }));
}

export default function AdminToolsClientSelect(props: AdminToolsClientSelectProps)
{
    const [ searchInfos, setSearchInfos ] = useState({ query: '', pageNum: 1, numResultsOnPage: 10 });
    const [ data, setData ] = useState({ rows: [] as any[], count: 0 });

    useEffect(() =>
    {
        getMultipleTools(
            searchInfos.query,
            searchInfos.pageNum,
            searchInfos.numResultsOnPage
        )
        .then(dat => 
            setData({
                rows: rowsToUiTable(
                    addLogoColumn(dat.rows),
                    fieldsUiMap,
                    transformer
                ),
                count: dat.count
            })
        )
        .catch(console.error);
    }, [searchInfos] );

    return (
        <div className="my-2">
            <ClientSearchField
                action={query => setSearchInfos(inf => ({ ...inf, query }))}
            />
            <ClientDataGrid
                data={data.rows}
                actionParameterName={[ "ID", "Título" ]}
                action={(id, title) => props.setIdAndTitle(Number(id), title)}
                tableUnfixed
                useHeader
            />
            <ClientPaginator
                numberResultsOnPage={searchInfos.numResultsOnPage}
                pageNumber={searchInfos.pageNum}
                totalItems={data.count}
                setPage={pageNum => setSearchInfos(inf => ({ ...inf, pageNum }))}
            />
        </div>
    )
}