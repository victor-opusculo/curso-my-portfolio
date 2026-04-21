'use client';

import ClientDataGrid from "@/components/data/client/ClientDataGrid";
import ClientPaginator from "@/components/data/client/ClientPaginator";
import ClientSearchField from "@/components/data/client/ClientSearchField";
import { type blogPosts } from '@/data/drizzle/schema';
import { getMultiplePosts } from "@/lib/blog/actions";
import { defaultItemsOnPage } from "@/lib/database/helpers";
import { rowsToUiTable, uiValueTransforms, utcToLocalString } from "@/lib/helpers";
import { saveHomePageInfos } from "@/lib/settings/actions";
import { useActionState, useEffect, useState } from "react";

type AllowedColumns = keyof typeof blogPosts.$inferSelect;

const fieldsUiMap: Map<AllowedColumns, string> = new Map([
    ['id' satisfies AllowedColumns, 'ID'],
    ['title' satisfies AllowedColumns, 'Título'],
    ['isVisible' satisfies AllowedColumns, 'Visível'],
    ['publishedAtUtc' satisfies AllowedColumns, 'Publicado'],
]);

const transformer = uiValueTransforms<
    Exclude<AllowedColumns, 'updatedAtUtc' | 'content' | 'enableHtml'>
>({
    id: String,
    title: String,
    isVisible: v => (v && Boolean(v) ? 'Sim' : 'Não'),
    publishedAtUtc: utcToLocalString
});

export default function EditHomePageBlogPost(props: { currentId?: number }) {
    //@ts-ignore
    const [ state, action ] = useActionState(saveHomePageInfos, {
        blogPostId: props.currentId
    });

    const [ id, setId ] = useState(state.data?.blogPostId ?? props.currentId);
    const [ searchEnabled, setSearchEnabled ] = useState(false);
    const [ searchInfos, setSearchInfos ] = useState({
        query: '',
        pageNumber: 1,
        numResultsOnPage: defaultItemsOnPage
    });

    const [ searchData, setSearchData ] = useState({
        rows: [] as any[],
        count: 0
    });

    useEffect(() => {
        getMultiplePosts(searchInfos.query, searchInfos.pageNumber, searchInfos.numResultsOnPage)
        .then(data =>
            setSearchData({
                rows: rowsToUiTable(data.rows, fieldsUiMap, transformer),
                count: data.count
            })
        )
        .catch(console.error);
    }, [ searchEnabled, searchInfos ] );

    return (
        <div className="m-4">
            <form action={action}>
                <label htmlFor="homepageBlogPostId" className="my-2 mr-2">
                    Post para exibição na página inicial:{' '}
                </label>
                <input 
                    id="homepageBlogPostId"
                    type="number"
                    className="txtinput"
                    min={1}
                    step={1}
                    name="blogPostId"
                    value={id ?? ''}
                    onChange={e => setId(Number.parseInt(e.target.value))}
                />
                {state.errors?.blogPostId && (
                    <p className="text-red-600">{state.errors.blogPostId}</p>
                )}

                <button
                    type="button"
                    className="btn ml-2"
                    onClick={() => setSearchEnabled(s => !s)}
                >
                    Procurar
                </button>

                <div className="my-4">
                    <button type="submit" className="btn">
                        Salvar
                    </button>
                </div>
                {state.message && <p>{state.message}</p>}
            </form>

            {Boolean(searchEnabled) && (
                <div className="my-2 py-2 border-b border-t border-b-(--foreground) border-t-(--foreground)">
                    <ClientSearchField
                        action={q => setSearchInfos(ci => ({...ci, query: q}))}
                    />
                    <ClientDataGrid
                        data={searchData.rows}
                        action={id => {
                            setId(id);
                            setSearchEnabled(false);
                        }}
                        actionParameterName="ID"
                        tableUnfixed
                        useHeader
                    />
                    <ClientPaginator
                        numberResultsOnPage={searchInfos.numResultsOnPage}
                        pageNumber={searchInfos.pageNumber}
                        totalItems={searchData.count}
                        setPage={pn =>
                            setSearchInfos(ci => ({ ...ci, pageNumber: pn }))
                        }
                    />
                </div>
            )}
        </div>
    );
}