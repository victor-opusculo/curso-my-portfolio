# Aula 16

## Cadastro de posts de blog

### Correção nas funções de acesso aos dados

1. Em `lib/blog/tags.ts`, alterar a função `setTagsForPost` com:

	```ts
	if (tags.length < 1)
	{
		await db.delete(blogPostsTags).where(eq(blogPostsTags.postId, id));
		return;
	}
	```


### Páginas de administrador e formulários

1. Criar em `app/admin/panel` o diretório `blog`;
1. Dentro, a homepage `page.tsx`:

    ```tsx
    import BasicSearchField from '@/components/data/BasicSearchField';
    import DataGrid from '@/components/data/DataGrid';
    import { blogPosts } from '@/data/drizzle/schema';
    import { defaultItemsOnPage } from '@/lib/database/helpers';
    import { getAllCount, getMultiple } from '@/lib/blog/blog';
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

    type AllowedColumns = keyof typeof blogPosts.$inferSelect;
    type AllowedColumnsAndTags = AllowedColumns | 'tags';

    export const metadata = { title: 'Blog' };

    const fieldsUiMap: Map<AllowedColumnsAndTags, string> = new Map([
        ['id' as AllowedColumns, 'ID'],
        ['title' as AllowedColumns, 'Título'],
        ['isVisible' as AllowedColumns, 'Visível?'],
        ['publishedAtUtc' as AllowedColumns, 'Publicado'],
        ['tags' as AllowedColumns, 'Tags'],
    ]);

    const orderByMap: Map<string, AllowedColumns> = new Map([
        ['id', 'id' as AllowedColumns],
        ['title', 'title' as AllowedColumns],
        ['visible', 'isVisible' as AllowedColumns],
        ['published', 'publishedAtUtc' as AllowedColumns],
    ]);

    const thisRoute = '/admin/panel/blog';

    export default async function AdminBlogHome(props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }) {
        const params = await props.searchParams;
        const q = params.q?.toString() ?? '';
        const orderBy = orderByMap.has(params.order_by?.toString() ?? '')
            ? orderByMap.get(params.order_by?.toString() || '')!
            : (blogPosts.id.name as AllowedColumns);
        const pageNum = Number.parseInt(params.page?.toString() ?? '1');
        const ascMode = Boolean(Number.parseInt(params.asc?.toString() ?? '0'));

        const count = await getAllCount(q, false);
        const rows = await getMultiple(
            q,
            pageNum,
            defaultItemsOnPage,
            orderBy,
            ascMode,
            false,
            true
        );

        const transformer = uiValueTransforms<
            Exclude<
                AllowedColumnsAndTags,
                'updatedAtUtc' | 'content' | 'enableHtml'
            >
        >({
            id: String,
            title: (v) => truncate(v, 100),
            isVisible: (v) => (v && Boolean(v) ? 'Sim' : 'Não'),
            publishedAtUtc: utcToLocalString,
            tags: (arr) => (Array.isArray(arr) ? arr.join(', ') : ''),
        });
        const rowsProcessed = rowsToUiTable(rows, fieldsUiMap, transformer);

        return (
            <>
                <h2>Posts no Blog</h2>
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

1. Em `components/admin`, criar o componente `TagsEditor.tsx`:

    ```tsx
    'use client';

    import { KeyboardEvent, useState } from 'react';

    export default function TagsEditor(props: {
        value: Set<string>;
        setValue: (newVal: Set<string>) => void;
    }) {
        const [add, setAdd] = useState('');

        const removeTag = (tag: string) => (_: any) => {
            const newSet = props.value.difference(new Set([tag]));
            props.setValue(newSet);
        };

        const addTag = () => {
            if (add) {
                props.setValue(new Set([...props.value, add]));
                setAdd('');
            }
        };

        const addKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === ',' || e.key === '.' || e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                addTag();
            }
        };

        return (
            <div className="bg-neutral-300 dark:bg-neutral-700 my-2 p-2 rounded-xl">
                <div className="flex flex-row flex-wrap gap-2">
                    {[...props.value].map((tag, idx) => (
                        <span key={idx} className="taglabel">
                            {tag}{' '}
                            <button
                                type="button"
                                className="ml-4 cursor-pointer"
                                onClick={removeTag(tag)}
                            >
                                &times;
                            </button>{' '}
                        </span>
                    ))}
                </div>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="Nova tag"
                        maxLength={100}
                        className="txtinput"
                        value={add}
                        onChange={(e) => setAdd(e.target.value)}
                        onKeyDown={addKeyDown}
                    />
                    <button
                        type="button"
                        className="btn font-bold ml-2"
                        onClick={addTag}
                    >
                        +
                    </button>
                </div>
            </div>
        );
    }

    ```

1. Em `components/admin`, criar o diretório `blog` com o componente `EditForm.tsx`:

    ```tsx
    'use client';

    import Spinner from '@/components/data/Spinner';
    import { FormState, sendPost } from '@/lib/blog/actions';
    import dayjs from 'dayjs';
    import utc from 'dayjs/plugin/utc';
    import { useActionState, useState } from 'react';
    import 'dayjs/locale/pt-br';
    import TagsEditor from '../TagsEditor';

    dayjs.extend(utc);

    interface FormProperties {
        existent?: {
            id: number;
            title: string;
            content: string;
            enableHtml: number;
            isVisible: number;
            publishedAtUtc: string | null;
            updatedAtUtc: string | null;
        };
        tags?: string[];
    }

    export default function AdminBlogEditForm(props: FormProperties) {
        
        const [state, action, pending] = useActionState<FormState>(
            // @ts-ignore
            sendPost,
            props.existent
                ? { data: { ...props.existent, tags: props.tags ?? [] } }
                : undefined
        );
        const [data, setData] = useState(state?.data);

        return (
            <form action={action}>
                <input type="hidden" name="id" value={props.existent?.id ?? ''} />

                <div className="my-2">
                    {props.existent?.publishedAtUtc && (
                        <p>
                            Publicado em:{' '}
                            {dayjs
                                .utc(props.existent.publishedAtUtc)
                                .local()
                                .locale('pt-br')
                                .format('DD/MM/YYYY HH:mm')}
                        </p>
                    )}
                    {props.existent?.updatedAtUtc && (
                        <p>
                            Atualizado em:{' '}
                            {dayjs
                                .utc(props.existent.updatedAtUtc)
                                .local()
                                .locale('pt-br')
                                .format('DD/MM/YYYY HH:mm')}
                        </p>
                    )}
                </div>

                <label className="my-2">
                    Título:{' '}
                    <input
                        type="text"
                        maxLength={300}
                        required
                        className="txtinput w-full"
                        name="title"
                        value={data?.title ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, title: e.target.value }))
                        }
                    />
                </label>
                {state?.errors?.title && (
                    <p className="text-red-600">{state.errors.title}</p>
                )}

                <label className="my-2 block">
                    Postagem:
                    <textarea
                        rows={10}
                        required
                        className="txtinput w-full"
                        name="content"
                        value={data?.content ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, content: e.target.value }))
                        }
                    ></textarea>
                </label>
                {state?.errors?.content && (
                    <p className="text-red-600">{state.errors.content}</p>
                )}

                <label className="my-2">
                    <input
                        type="checkbox"
                        value={1}
                        name="isVisible"
                        checked={Boolean(data?.isVisible ?? true)}
                        onChange={(e) =>
                            setData((cd) => ({
                                ...cd,
                                isVisible: Number(e.target.checked),
                            }))
                        }
                    />{' '}
                    Visível
                </label>
                <label className="my-2 ml-4">
                    <input
                        type="checkbox"
                        value={1}
                        name="enableHtml"
                        checked={Boolean(data?.enableHtml)}
                        onChange={(e) =>
                            setData((cd) => ({
                                ...cd,
                                enableHtml: Number(e.target.checked),
                            }))
                        }
                    />{' '}
                    Habilitar HTML
                </label>

                <div className="mt-2">
                    Tags:
                    <TagsEditor
                        value={new Set(data?.tags)}
                        setValue={(newSet) =>
                            setData((cd) => ({ ...cd, tags: Array.from(newSet) }))
                        }
                    />
                    <input
                        type="hidden"
                        name="tags"
                        value={JSON.stringify(data?.tags ?? [])}
                    />
                </div>

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

1. Em `app/admin/panel/blog`, criar o diretório `create` com a página `page.tsx`:

    ```tsx
    import AdminBlogEditForm from '@/components/admin/blog/EditForm';

    export const metadata = { title: 'Novo post' };

    export default function AdminBlogCreate() {
        return (
            <>
                <h2>Criar post no blog</h2>

                <AdminBlogEditForm />
            </>
        );
    }

    ```