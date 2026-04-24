# Aula 12

## Cadastro de mídias no painel de administrador

1. Em `app/admin/panel`, criar o diretório `media` e, dentro dele, a página `page.tsx`:

    ```tsx
    import BasicSearchField from '@/components/data/BasicSearchField';
    import DataGrid from '@/components/data/DataGrid';
    import OrderByLinks from '@/components/data/OrderByLinks';
    import Paginator from '@/components/data/Paginator';
    import { media } from '@/data/drizzle/schema';
    import { defaultItemsOnPage } from '@/lib/database/helpers';
    import { rowsToUiTable, uiValueTransforms } from '@/lib/helpers';
    import { getAllCount, getMultiple } from '@/lib/media/media';
    import Link from 'next/link';

    type AllowedColumns = keyof typeof media.$inferSelect;

    const fieldsUiMap: Map<AllowedColumns, string> = new Map([
        ['id' as AllowedColumns, 'ID'],
        ['title' as AllowedColumns, 'Título'],
        ['mimeType' as AllowedColumns, 'Tipo MIME'],
        ['fileExtension' as AllowedColumns, 'Extensão de arquivo'],
    ]);

    const orderByMap: Map<string, AllowedColumns> = new Map([
        ['id', 'id' as AllowedColumns],
        ['title', 'title' as AllowedColumns],
        ['mime', 'mimeType' as AllowedColumns],
    ]);

    export const metadata = { title: 'Mídias' };
    const thisRoute = '/admin/panel/media';

    export default async function AdminMediaHome(props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
            fileExtension: String,
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

1. Criar, em `components/admin`, o diretório `media` e, dentro, o componente `EditForm.tsx` com:

    ```tsx
    'use client';

    import Spinner from '@/components/data/Spinner';
    import { sendMedia, FormState } from '@/lib/media/actions';
    import { ChangeEvent, useActionState, useState } from 'react';

    interface FormProperties {
        existent?: { id: number; title: string };
        maxSize: number;
    }

    export default function AdminMediaEditForm(props: FormProperties) {
        const [data, setData] = useState<{
            id: number | undefined;
            title: string;
            file?: File;
        }>(
            props.existent ?? {
                id: undefined as number | undefined,
                title: '',
                file: undefined as File | undefined,
            }
        );

        
        const [state, action, pending] = useActionState<FormState>(
            // @ts-ignore
            sendMedia,
            undefined
        );

        const changeFile = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
            const file = e.target.files?.item(0);
            if (file) setData((cd) => ({ ...cd, file }));
        };

        const submit = (e: any) => {
            if (data.file) {
                if (data.file.size > props.maxSize) {
                    alert(
                        `Tamanho máximo de ${props.maxSize / 1024 / 1024} MiB excedido!`
                    );
                    e.preventDefault();
                }
            }
        };

        return (
            <form onSubmit={submit} action={action}>
                <label className="block">
                    ID:
                    {props.existent?.id ?? '(Novo)'}
                    <input
                        type="hidden"
                        name="id"
                        value={props.existent?.id ?? ''}
                    />
                </label>
                <label className="block">
                    Título:
                    <input
                        type="text"
                        required
                        maxLength={300}
                        className="w-full txtinput"
                        name="title"
                        value={state?.data?.title ?? data.title ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, title: e.target.value }))
                        }
                    />
                </label>
                {state?.errors?.title && (
                    <p className="text-red-600">{state.errors.title}</p>
                )}
                <label className="block">
                    {props.existent?.id ? 'Alterar aquivo (opcional)' : 'Arquivo'}:
                    <input
                        type="file"
                        required={props.existent?.id ? false : true}
                        className="w-full btn txtinput"
                        name="file"
                        onChange={changeFile}
                    />
                </label>
                {state?.errors?.file && (
                    <p className="text-red-600">{state.errors.file}</p>
                )}

                <div className="text-center mt-2">
                    <button className="btn" type="submit" disabled={pending}>
                        Enviar
                        {pending && (
                            <Spinner className="inline-block w-[20px] h-[20px] ml-2 fill-(--background)" />
                        )}
                    </button>
                </div>

                {state?.message && (
                    <p className="text-green-600">{state.message}</p>
                )}
            </form>
        );
    }

    ```

1. Em `app/admin/panel/media`, criar o diretório `create`, com a página `page.tsx`:

    ```tsx
    import AdminMediaEditForm from '@/components/admin/media/EditForm';
    import { maxSizeAllowed } from '@/lib/media/media';

    export const metadata = { title: 'Criar mídia' };

    export default async function AdminCreateMedia() {
        return (
            <>
                <h2>Nova mídia</h2>
                <AdminMediaEditForm maxSize={maxSizeAllowed} />
            </>
        );
    }
    ```

1. Na raíz do projeto, editar o arquivo `next.config.ts` e adicionar a propriedade `experimental` abaixo:

    ```ts
    const nextConfig: NextConfig = {
        experimental: {
            proxyClientMaxBodySize: '25mb',
            serverActions: {
            bodySizeLimit: '25mb',
            },
        },
    };
    ```
