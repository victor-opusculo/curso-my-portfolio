'use client';

import ClientDataGrid from "@/components/data/client/ClientDataGrid";
import ClientPaginator from "@/components/data/client/ClientPaginator";
import ClientSearchField from "@/components/data/client/ClientSearchField";

import { media } from "@/data/drizzle/schema";
import { rowsToUiTable, uiValueTransforms } from "@/lib/helpers";
import { getMultipleClient, sendMedia, sendMediaClient } from "@/lib/media/actions";
import { useEffect, useState } from "react";

interface AdminMediaClientSelectProps {
    setId: (id: number) => void;
}

type AllowedColumns = keyof typeof media.$inferSelect;

const fieldsUiMap: Map<AllowedColumns | 'prev', string> = new Map([
    ['id' satisfies AllowedColumns, 'ID'],
    ['title' satisfies AllowedColumns, 'Título'],
    ['mimeType' satisfies AllowedColumns, 'Tipo MIME'],
    ['fileExtension' satisfies AllowedColumns, 'Extensão de arquivo'],
    ['prev' satisfies AllowedColumns | 'prev', 'Prévia']
]);

const transformer = uiValueTransforms<AllowedColumns | 'prev'>({
    id: String,
    title: String,
    fileExtension: String,
    mimeType: String,
    prev: id => (
        <img src={`/api/media/${id}`} width={128} className="max-h-[64px]" />
    )
});

const addPreviewColumn = (rows: (typeof media.$inferSelect)[]) => {
    return rows.map(r => ({ ...r, prev: r.id }));
};

export default function AdminMediaClientSelect(
    props: AdminMediaClientSelectProps
) {
    const [ searchInfos, setSearchInfos ] = useState({
        query: '',
        pageNum: 1,
        numResultsOnPage: 10
    });

    const [ data, setData ] = useState({ rows: [] as any[], count: 0 });

    const [ fileToUpload, setFileToUpload ] = useState<File|null>(null);

    const upload = () => {
        if (fileToUpload) {
            const fd = new FormData();
            fd.set('title', fileToUpload?.name ?? 'Nova mídia');
            fd.set('file', fileToUpload);

            sendMediaClient(fd)
                .then(res => {
                    if (res?.message)
                        alert(res.message);

                    setSearchInfos(inf => ({
                        ...inf,
                        query: '',
                        pageNum: 1
                    }));
                })
                .catch(console.error);
        }
    };

    useEffect(() => {
        getMultipleClient(
            searchInfos.query,
            searchInfos.pageNum,
            searchInfos.numResultsOnPage
        )
        .then(dat => setData({ 
            rows: rowsToUiTable(
                addPreviewColumn(dat.rows),
                fieldsUiMap,
                transformer
            ),
            count: dat.count 
        }))
        .catch(console.error);
    }, [ searchInfos ]);

    return (
        <div className="my-2">
            <ClientSearchField
                action={query => setSearchInfos(inf => ({ ...inf, query }))}
            />
            <div className="my-2">
                Upload:
                <input 
                    type="file"
                    className="btn"
                    onChange={e => setFileToUpload(e.target.files?.item(0) ?? null)}
                />
                <button type="button" className="btn ml-2" onClick={upload}>
                    Enviar
                </button>
            </div>

            <ClientDataGrid
                data={data.rows}
                actionParameterName="ID"
                action={props.setId}
                tableUnfixed
                useHeader
            />

            <ClientPaginator
                numberResultsOnPage={searchInfos.numResultsOnPage}
                pageNumber={searchInfos.pageNum}
                totalItems={data.count}
                setPage={pageNum =>
                    setSearchInfos(inf => ({ ...inf, pageNum }))
                }
            />
        </div>
    );
}