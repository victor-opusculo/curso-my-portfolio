# Aula 19

## Cadastro de ferramentas

### Páginas de administração e formulários de edição e seleção

1. Em `app/admin/panel`, criar o diretório `tools`;
1. Dentro, criar a home `page.tsx` com:

    ```tsx
    import BasicSearchField from '@/components/data/BasicSearchField';
    import DataGrid from '@/components/data/DataGrid';
    import { tools } from '@/data/drizzle/schema';
    import { defaultItemsOnPage } from '@/lib/database/helpers';
    import { getAllCount, getMultiple } from '@/lib/tools/tools';
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

    type AllowedColumns = keyof typeof tools.$inferSelect;

    const fieldsUiMap: Map<AllowedColumns, string> = new Map([
        ['id' as AllowedColumns, 'ID'],
        ['title' as AllowedColumns, 'Título'],
        ['description' as AllowedColumns, 'Descrição'],
    ]);

    const orderByMap: Map<string, AllowedColumns> = new Map([
        ['id', 'id' as AllowedColumns],
        ['title', 'title' as AllowedColumns],
        ['description', 'description' as AllowedColumns],
    ]);

    export const metadata = { title: 'Ferramentas' };
    const thisRoute = '/admin/panel/tools';

    export default async function AdminToolsHome(props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }) {
        const params = await props.searchParams;
        const q = params.q?.toString() ?? '';
        const orderBy = orderByMap.has(params.order_by?.toString() ?? '')
            ? orderByMap.get(params.order_by?.toString() || '')!
            : (tools.id.name as AllowedColumns);
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

        const transformer = uiValueTransforms<
            Exclude<AllowedColumns, 'logoMediaId'>
        >({
            id: String,
            title: (v) => truncate(v, 100),
            description: (v) => truncate(v, 100),
        });
        const rowsProcessed = rowsToUiTable(rows, fieldsUiMap, transformer);

        return (
            <>
                <h2>Ferramentas</h2>
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

1. Em `components/admin/media`, criar o componente `ClientSelect.tsx`:

    ```tsx
    'use client';

    import ClientDataGrid from '@/components/data/client/ClientDataGrid';
    import ClientPaginator from '@/components/data/client/ClientPaginator';
    import ClientSearchField from '@/components/data/client/ClientSearchField';
    import { media } from '@/data/drizzle/schema';
    import { rowsToUiTable, uiValueTransforms } from '@/lib/helpers';
    import {
        getMultipleMedia,
        sendMedia,
        sendMediaClient,
    } from '@/lib/media/actions';
    import { useEffect, useState } from 'react';

    interface AdminMediaClientSelectProps {
        setId: (id: number) => void;
    }

    type AllowedColumns = keyof typeof media.$inferSelect;

    const fieldsUiMap: Map<AllowedColumns | 'prev', string> = new Map([
        ['id' as AllowedColumns, 'ID'],
        ['title' as AllowedColumns, 'Título'],
        ['mimeType' as AllowedColumns, 'Tipo MIME'],
        ['fileExtension' as AllowedColumns, 'Extensão de arquivo'],
        ['prev' as AllowedColumns | 'prev', 'Prévia'],
    ]);

    const transformer = uiValueTransforms<AllowedColumns | 'prev'>({
        id: String,
        title: String,
        fileExtension: String,
        mimeType: String,
        prev: (id) => (
            <img src={`/api/media/${id}`} width={128} className="max-h-[64px]" />
        ),
    });

    const addPreviewColumn = (rows: (typeof media.$inferSelect)[]) => {
        return rows.map((r) => ({ ...r, prev: r.id }));
    };

    export default function AdminMediaClientSelect(
        props: AdminMediaClientSelectProps
    ) {
        const [searchInfos, setSearchInfos] = useState({
            query: '',
            pageNum: 1,
            numResultsOnPage: 10,
        });
        const [data, setData] = useState({ rows: [] as any[], count: 0 });

        const [fileToUpload, setFileToUpload] = useState<File | null>(null);

        const upload = () => {
            if (fileToUpload) {
                const fd = new FormData();
                fd.set('title', fileToUpload?.name ?? 'Nova Midia');
                fd.set('file', fileToUpload);

                sendMediaClient(fd)
                    .then((res) => {
                        if (res?.message) alert(res.message);

                        setSearchInfos((inf) => ({
                            ...inf,
                            query: '',
                            pageNum: 1,
                        }));
                    })
                    .catch(console.error);
            }
        };

        useEffect(() => {
            getMultipleMedia(
                searchInfos.query,
                searchInfos.pageNum,
                searchInfos.numResultsOnPage
            )
                .then((dat) =>
                    setData({
                        rows: rowsToUiTable(
                            addPreviewColumn(dat.rows),
                            fieldsUiMap,
                            transformer
                        ),
                        count: dat.count,
                    })
                )
                .catch(console.error);
        }, [searchInfos]);

        return (
            <div className="my-2">
                <ClientSearchField
                    action={(query) => setSearchInfos((inf) => ({ ...inf, query }))}
                    currentValue={searchInfos.query}
                />
                <div className="my-2">
                    Upload:
                    <input
                        type="file"
                        className="btn"
                        onChange={(e) =>
                            setFileToUpload(e.target.files?.item(0) ?? null)
                        }
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
                    setPage={(pageNum) =>
                        setSearchInfos((inf) => ({ ...inf, pageNum }))
                    }
                />
            </div>
        );
    }

    ```

1. Em `components/admin`, criar o diretório `tools`;
1. Nele, criar o `EditForm.tsx`:

    ```tsx
    'use client';

    import { useActionState, useState } from 'react';
    import AdminMediaClientSelect from '../media/ClientSelect';
    import { FormState, sendTool } from '@/lib/tools/actions';

    interface AdminToolEditFormProps {
        existent?: {
            id: number;
            title: string;
            description: string | null;
            logoMediaId: number | null;
        };
    }

    export default function AdminToolEditForm(props: AdminToolEditFormProps) {
        
        const [state, action] = useActionState<FormState>(
            // @ts-ignore
            sendTool,
            props.existent ? { data: props.existent } : undefined
        );

        const [searchEnabled, setSearchEnabled] = useState(false);
        const [data, setData] = useState(
            (props.existent ?? {}) as Partial<AdminToolEditFormProps['existent']>
        );

        return (
            <form action={action}>
                <input type="hidden" name="id" value={props.existent?.id ?? ''} />

                <label className="block my-2">
                    Título:
                    <input
                        type="text"
                        name="title"
                        required
                        className="txtinput w-full block"
                        value={data?.title ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, title: e.target.value }))
                        }
                    />
                </label>
                {state?.errors?.title && (
                    <p className="text-red-600">{state.errors.title}</p>
                )}

                <label className="block my-2">
                    Descrição:
                    <textarea
                        name="description"
                        className="txtinput block w-full"
                        rows={8}
                        value={data?.description ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({
                                ...cd,
                                description: e.target.value,
                            }))
                        }
                    ></textarea>
                </label>
                {state?.errors?.description && (
                    <p className="text-red-600">{state.errors.description}</p>
                )}

                <label htmlFor="logoMediaId">Imagem de logotipo:</label>
                <input
                    id="logoMediaId"
                    type="number"
                    className="txtinput"
                    step={1}
                    min={1}
                    name="logoMediaId"
                    value={data?.logoMediaId ?? ''}
                    onChange={(e) =>
                        setData((cd) => ({
                            ...cd,
                            logoMediaId: Number.parseInt(e.target.value),
                        }))
                    }
                />
                <button
                    type="button"
                    className="btn ml-2"
                    onClick={() => setSearchEnabled((s) => !s)}
                >
                    Procurar
                </button>

                {searchEnabled && (
                    <AdminMediaClientSelect
                        setId={(id) => (
                            setData((cd) => ({ ...cd, logoMediaId: id })),
                            setSearchEnabled(false)
                        )}
                    />
                )}

                <div className="mt-4 text-center">
                    <button type="submit" className="btn">
                        Salvar
                    </button>
                </div>
                {state?.message && <p>{state.message}</p>}
            </form>
        );
    }

    ```

1. No mesmo nível de diretório, criar o componente `ClientSelect.tsx`:

    ```tsx
    'use client';

    import ClientDataGrid from '@/components/data/client/ClientDataGrid';
    import ClientPaginator from '@/components/data/client/ClientPaginator';
    import ClientSearchField from '@/components/data/client/ClientSearchField';
    import { tools } from '@/data/drizzle/schema';
    import { rowsToUiTable, uiValueTransforms } from '@/lib/helpers';
    import { getMultipleTools } from '@/lib/tools/actions';
    import { useEffect, useState } from 'react';

    interface AdminToolsClientSelectProps {
        setIdAndTitle: (id: number, title: string) => void;
    }

    type AllowedColumns = keyof typeof tools.$inferSelect;

    const fieldsUiMap: Map<AllowedColumns | 'logo', string> = new Map([
        ['id' satisfies AllowedColumns, 'ID'],
        ['title' satisfies AllowedColumns, 'Título'],
        ['logo' satisfies AllowedColumns | 'logo', 'Logo'],
    ]);

    const transformer = uiValueTransforms<
        Exclude<AllowedColumns, 'description' | 'logoMediaId'> | 'logo'
    >({
        id: String,
        title: String,
        logo: (id) => (
            <img src={`/api/media/${id}`} width={128} className="max-h-[64px]" />
        ),
    });

    const addLogoColumn = (rows: (typeof tools.$inferSelect)[]) => {
        return rows.map((r) => ({ ...r, logo: r.logoMediaId }));
    };

    export default function AdminToolsClientSelect(
        props: AdminToolsClientSelectProps
    ) {
        const [searchInfos, setSearchInfos] = useState({
            query: '',
            pageNum: 1,
            numResultsOnPage: 10,
        });
        const [data, setData] = useState({ rows: [] as any[], count: 0 });

        useEffect(() => {
            getMultipleTools(
                searchInfos.query,
                searchInfos.pageNum,
                searchInfos.numResultsOnPage
            )
                .then((dat) =>
                    setData({
                        rows: rowsToUiTable(
                            addLogoColumn(dat.rows),
                            fieldsUiMap,
                            transformer
                        ),
                        count: dat.count,
                    })
                )
                .catch(console.error);
        }, [searchInfos]);

        return (
            <div className="my-2">
                <ClientSearchField
                    action={(query) => setSearchInfos((inf) => ({ ...inf, query }))}
                    currentValue={searchInfos.query}
                />
                <ClientDataGrid
                    data={data.rows}
                    actionParameterName={['ID', 'Título']}
                    action={(id, title) => props.setIdAndTitle(Number(id), title)}
                    tableUnfixed
                    useHeader
                />
                <ClientPaginator
                    numberResultsOnPage={searchInfos.numResultsOnPage}
                    pageNumber={searchInfos.pageNum}
                    totalItems={data.count}
                    setPage={(pageNum) =>
                        setSearchInfos((inf) => ({ ...inf, pageNum }))
                    }
                />
            </div>
        );
    }

    ```