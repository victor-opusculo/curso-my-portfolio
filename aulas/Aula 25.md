# Aula 25

## Página de configurações no painel de administrador

### Formulários de cliente

1. Em `components/admin`, criar o diretório `settings`;
1. Nele, criar `EditAdminName.tsx` com:

    ```tsx
    'use client';

    import { saveAdminUsername } from '@/lib/settings/actions';
    import { useActionState, useState } from 'react';

    export default function EditAdminName(props: { currentName: string }) {
        // @ts-ignore
        const [state, action] = useActionState(saveAdminUsername, undefined);
        const [data, setData] = useState({ current: props.currentName });

        return (
            <form action={action}>
                <label className="block my-1">
                    Novo usuário:{' '}
                    <input
                        type="text"
                        name="newUsername"
                        required
                        className="txtinput"
                        value={data.current}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, current: e.target.value }))
                        }
                    />
                </label>
                {state?.errors?.newUsername && (
                    <p className="text-red-600">{state.errors.newUsername}</p>
                )}

                <label className="block my-1">
                    Senha atual:{' '}
                    <input
                        type="password"
                        name="password"
                        required
                        className="txtinput"
                    />
                </label>
                {state?.errors?.currentPassword && (
                    <p className="text-red-600">{state.errors.currentPassword}</p>
                )}

                <div className="text-center my-4">
                    <button type="submit" className="btn">
                        Alterar
                    </button>
                </div>
                {state?.message && <p>{state.message}</p>}
            </form>
        );
    }

    ```

1. Criar `EditAdminPassword.tsx` com:

    ```tsx
    'use client';

    import { saveAdminPassword } from '@/lib/settings/actions';
    import { useActionState } from 'react';

    export default function EditAdminPassword() {
        // @ts-ignore
        const [state, action] = useActionState(saveAdminPassword, undefined);

        return (
            <form action={action}>
                <label className="block my-1">
                    Senha atual:{' '}
                    <input
                        type="password"
                        name="oldPassword"
                        required
                        className="txtinput"
                    />
                </label>
                {state?.errors?.currentPassword && (
                    <p className="text-red-600">{state.errors.currentPassword}</p>
                )}

                <label className="block my-1">
                    Senha nova:{' '}
                    <input
                        type="password"
                        name="newPassword"
                        required
                        className="txtinput"
                    />
                </label>
                <label className="block my-1">
                    Confirme a senha nova:{' '}
                    <input
                        type="password"
                        name="newPassword2"
                        required
                        className="txtinput"
                    />
                </label>
                {state?.errors?.newPassword && (
                    <p className="text-red-600">{state.errors.newPassword}</p>
                )}

                <div className="text-center my-4">
                    <button type="submit" className="btn">
                        Alterar
                    </button>
                </div>
                {state?.message && <p>{state.message}</p>}
            </form>
        );
    }

    ```

1. Criar `EditContactInfos.tsx` com:

    ```tsx
    'use client';

    import { saveContactInfos } from '@/lib/settings/actions';
    import { useActionState, useState } from 'react';

    export default function EditContactInfos(props: {
        email: string;
        telephone: string;
    }) {
        const [state, action, pending] = useActionState(saveContactInfos, {
            data: { email: props.email, telephone: props.telephone },
        });
        const [data, setData] = useState(state.data ?? props);

        return (
            <form className="m-4" action={action}>
                <label className="block my-2">
                    E-mail:
                    <input
                        type="email"
                        name="email"
                        required
                        className="txtinput w-full"
                        value={data?.email ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, email: e.target.value }))
                        }
                    />
                </label>
                {state.errors?.email && (
                    <p className="text-red-600">{state.errors.email}</p>
                )}

                <label className="block my-2">
                    Telefone WhatsApp:
                    <input
                        type="text"
                        name="telephone"
                        required
                        className="txtinput w-full"
                        value={data?.telephone ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, telephone: e.target.value }))
                        }
                    />
                </label>
                {state.errors?.telephone && (
                    <p className="text-red-600">{state.errors.telephone}</p>
                )}

                <div className="mt-4">
                    <button type="submit" className="btn">
                        Salvar
                    </button>
                </div>
                {state.message && <p>{state.message}</p>}
            </form>
        );
    }

    ```

1. Criar `EditHomePageBlogPost.tsx` com:

    ```tsx
    'use client';

    import ClientDataGrid from '@/components/data/client/ClientDataGrid';
    import ClientPaginator from '@/components/data/client/ClientPaginator';
    import ClientSearchField from '@/components/data/client/ClientSearchField';
    import { type blogPosts } from '@/data/drizzle/schema';
    import { getMultiplePosts } from '@/lib/blog/actions';
    import { defaultItemsOnPage } from '@/lib/database/helpers';
    import {
        rowsToUiTable,
        uiValueTransforms,
        utcToLocalString,
    } from '@/lib/helpers';
    import { saveHomePageInfos } from '@/lib/settings/actions';
    import { useActionState, useEffect, useState } from 'react';

    type AllowedColumns = keyof typeof blogPosts.$inferSelect;

    const fieldsUiMap: Map<AllowedColumns, string> = new Map([
        ['id' as AllowedColumns, 'ID'],
        ['title' as AllowedColumns, 'Título'],
        ['isVisible' as AllowedColumns, 'Visível?'],
        ['publishedAtUtc' as AllowedColumns, 'Publicado'],
    ]);

    const transformer = uiValueTransforms<
        Exclude<AllowedColumns, 'updatedAtUtc' | 'content' | 'enableHtml'>
    >({
        id: String,
        title: String,
        isVisible: (v) => (v && Boolean(v) ? 'Sim' : 'Não'),
        publishedAtUtc: utcToLocalString,
    });

    export default function EditHomePageBlogPost(props: { currentId?: number }) {
        // @ts-ignore
        const [state, action, pending] = useActionState(saveHomePageInfos, {
            blogPostId: props.currentId,
        });

        const [id, setId] = useState(state.data?.blogPostId ?? props.currentId);
        const [searchEnabled, setSearchEnabled] = useState(false);
        const [searchInfos, setSearchInfos] = useState({
            query: '',
            pageNumber: 1,
            numResultsOnPage: defaultItemsOnPage,
        });
        const [searchData, setSearchData] = useState({
            rows: [] as any[],
            count: 0,
        });

        useEffect(() => {
            getMultiplePosts(searchInfos.query, searchInfos.pageNumber, searchInfos.numResultsOnPage)
                .then((data) =>
                    setSearchData({
                        rows: rowsToUiTable(data.rows, fieldsUiMap, transformer),
                        count: data.count,
                    })
                )
                .catch(console.error);
        }, [searchEnabled, searchInfos]);

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
                        onChange={(e) => setId(Number.parseInt(e.target.value))}
                    />
                    {state.errors?.blogPostId && (
                        <p className="text-red-600">{state.errors.blogPostId}</p>
                    )}

                    <button
                        type="button"
                        className="btn ml-2"
                        onClick={() => setSearchEnabled((s) => !s)}
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
                            currentValue={searchInfos.query}
                            action={(q) =>
                                setSearchInfos((ci) => ({ ...ci, query: q }))
                            }
                        />
                        <ClientDataGrid
                            data={searchData.rows}
                            action={(id) => {
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
                            setPage={(pn) =>
                                setSearchInfos((ci) => ({ ...ci, pageNumber: pn }))
                            }
                        />
                    </div>
                )}
            </div>
        );
    }

    ```