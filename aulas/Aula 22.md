# Aula 22

## Cadastro de projetos

### Componentes de cliente

1. Criar em `components/admin` o diretório `projects`;
1. Nele, criar o `AttachmentsEditor.tsx` com:

    ```tsx
    'use client';

    import { AttachmentData } from '@/lib/projects/projectAttachments';
    import { useState } from 'react';
    import AdminMediaClientSelect from '../media/ClientSelect';

    export default function AttachmentsEditor(props: {
        value: AttachmentData[];
        setValue: (v: AttachmentData[]) => void;
    }) {
        const [search, setSearch] = useState({
            enabled: false,
            attachindex: null as number | null,
        });

        const setId = (id: number) => {
            setSearch({ enabled: false, attachindex: null });
            props.setValue(
                props.value.with(search.attachindex!, {
                    ...props.value[search.attachindex!],
                    mediaId: id,
                })
            );
        };

        return (
            <>
                <ol className="list-decimal ml-2 pl-4">
                    {props.value.map((attach, idx) => (
                        <li key={idx} className="mt-1">
                            <span className="flex flex-row gap-2 items-center">
                                <input
                                    type="number"
                                    className="txtinput"
                                    required
                                    min={1}
                                    step={1}
                                    placeholder="ID de mídia"
                                    value={attach.mediaId || ''}
                                    onChange={(e) =>
                                        props.setValue(
                                            props.value.with(idx, {
                                                ...props.value[idx],
                                                mediaId: Number.parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        )
                                    }
                                />
                                <label>
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={attach.isGallery}
                                        onChange={(e) =>
                                            props.setValue(
                                                props.value.with(idx, {
                                                    ...props.value[idx],
                                                    isGallery: e.target.checked,
                                                })
                                            )
                                        }
                                    />
                                    Exibir na galeria
                                </label>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        setSearch((cs) =>
                                            cs.enabled && cs.attachindex === idx
                                                ? {
                                                    enabled: false,
                                                    attachindex: null,
                                                }
                                                : {
                                                    enabled: true,
                                                    attachindex: idx,
                                                }
                                        )
                                    }
                                >
                                    Procurar
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        props.setValue(
                                            props.value.filter((_, i) => idx !== i)
                                        )
                                    }
                                >
                                    &times;
                                </button>
                            </span>
                        </li>
                    ))}
                </ol>
                <button
                    type="button"
                    className="btn mt-2"
                    onClick={() =>
                        props.setValue([
                            ...props.value,
                            { mediaId: 0, isGallery: false },
                        ])
                    }
                >
                    + Anexo
                </button>

                {search.enabled && typeof search.attachindex === 'number' && (
                    <fieldset className="fieldset">
                        <legend>Procurar anexo</legend>
                        <AdminMediaClientSelect setId={setId} />
                    </fieldset>
                )}
            </>
        );
    }

    ```

1. Criar o `LinksEditor.tsx` com:

    ```tsx
    'use client';

    interface Link {
        label: string;
        url: string;
    }

    export default function LinksEditor(props: {
        value: Link[];
        setValue: (v: Link[]) => void;
    }) {
        return (
            <>
                <ol className="list-decimal ml-2 pl-4">
                    {props.value.map((link, idx) => (
                        <li key={idx} className="mt-1">
                            <span className="flex flex-row gap-2">
                                <input
                                    type="text"
                                    required
                                    className="txtinput shrink"
                                    placeholder="Nome do link"
                                    value={link.label}
                                    onChange={(e) =>
                                        props.setValue(
                                            props.value.with(idx, {
                                                ...props.value[idx],
                                                label: e.target.value,
                                            })
                                        )
                                    }
                                />
                                <input
                                    type="url"
                                    required
                                    className="txtinput grow"
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) =>
                                        props.setValue(
                                            props.value.with(idx, {
                                                ...props.value[idx],
                                                url: e.target.value,
                                            })
                                        )
                                    }
                                />
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        props.setValue(
                                            props.value.filter((_, i) => idx !== i)
                                        )
                                    }
                                >
                                    &times;
                                </button>
                            </span>
                        </li>
                    ))}
                </ol>
                <button
                    type="button"
                    className="btn mt-2"
                    onClick={() =>
                        props.setValue([...props.value, { label: '', url: '' }])
                    }
                >
                    + Link
                </button>
            </>
        );
    }

    ```

1. Criar o `ToolsEditor.tsx` com:

    ```tsx
    'use client';

    import { useState } from 'react';
    import AdminToolsClientSelect from '../tools/ClientSelect';

    type ToolInfo = { title: string; id: number | null };

    export default function ToolsEditor(props: {
        value: ToolInfo[];
        setValue: (v: ToolInfo[]) => void;
    }) {
        const [search, setSearch] = useState({
            enabled: false,
            toolIndex: null as null | number,
        });

        const setIdAndTitle = (id: number, title: string) => {
            setSearch({ enabled: false, toolIndex: null });
            props.setValue(
                props.value.with(search.toolIndex!, { id: Number(id), title })
            );
        };

        return (
            <div className="mt-4">
                <ol className="list-decimal pl-4">
                    {props.value.map((tool, idx) => (
                        <li key={idx} className="my-1">
                            <span className="flex flex-row gap-2">
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() =>
                                        setSearch((cs) =>
                                            cs.enabled && cs.toolIndex === idx
                                                ? {
                                                    enabled: false,
                                                    toolIndex: null,
                                                }
                                                : { enabled: true, toolIndex: idx }
                                        )
                                    }
                                >
                                    {tool.title}
                                </button>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() =>
                                        props.setValue(
                                            props.value.filter(
                                                (_, vidx) => idx !== vidx
                                            )
                                        )
                                    }
                                >
                                    &times;
                                </button>
                            </span>
                        </li>
                    ))}
                </ol>

                {search.enabled && typeof search.toolIndex === 'number' && (
                    <fieldset className="fieldset">
                        <legend>Procurar ferramenta</legend>
                        <AdminToolsClientSelect setIdAndTitle={setIdAndTitle} />
                    </fieldset>
                )}

                <button
                    type="button"
                    className="btn"
                    onClick={() =>
                        props.setValue([
                            ...props.value,
                            { id: null, title: ' -- Selecione -- ' },
                        ])
                    }
                >
                    + Ferramenta
                </button>
            </div>
        );
    }

    ```

1. Por fim, o `EditForm.tsx` com:

    ```tsx
    'use client';

    import { projects } from '@/data/drizzle/schema';
    import { FormState, sendProject } from '@/lib/projects/actions';
    import { useActionState, useState } from 'react';
    import AdminMediaClientSelect from '../media/ClientSelect';
    import LinksEditor from './LinksEditor';
    import TagsEditor from '../TagsEditor';
    import { AttachmentData } from '@/lib/projects/projectAttachments';
    import AttachmentsEditor from './AttachmentsEditor';
    import { ToolInfo } from '@/lib/tools/actions';
    import ToolsEditor from './ToolsEditor';

    interface AdminProjectEditFormProps {
        existent?: typeof projects.$inferSelect;
        tags?: string[];
        attachments?: AttachmentData[];
        tools?: ToolInfo[];
    }

    export default function AdminProjectEditForm(props: AdminProjectEditFormProps) {
        
        const [state, action, pending] = useActionState<FormState>(
            // @ts-ignore
            sendProject,
            props.existent
                ? {
                    data: {
                        ...props.existent,
                        tags: props.tags ?? [],
                        attachments: props.attachments ?? [],
                        tools: props.tools ?? [],
                    },
                }
                : undefined
        );
        const [searchLogo, setSearchLogo] = useState(false);
        const [data, setData] = useState(state?.data);

        return (
            <form action={action}>
                <input type="hidden" name="id" value={props.existent?.id ?? ''} />

                <label>
                    Título:
                    <input
                        type="text"
                        name="title"
                        required
                        className="txtinput w-full"
                        maxLength={300}
                        value={data?.title ?? ''}
                        onChange={(e) =>
                            setData((cd) => ({ ...cd, title: e.target.value }))
                        }
                    />
                </label>
                {state?.errors?.title && (
                    <p className="text-red-600">{state.errors.title}</p>
                )}

                <label>
                    Descrição:
                    <textarea
                        name="description"
                        className="txtinput w-full"
                        rows={5}
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

                <label htmlFor="projMediaLogoId">Logotipo: </label>
                <input
                    id="projMediaLogoId"
                    type="number"
                    name="logoMediaId"
                    className="txtinput"
                    step={1}
                    min={1}
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
                    onClick={() => setSearchLogo((s) => !s)}
                >
                    Procurar
                </button>
                {Boolean(data?.logoMediaId) && (
                    <img
                        src={`/api/media/${data?.logoMediaId}`}
                        className="max-h-[64px]"
                    />
                )}
                {searchLogo && (
                    <fieldset className="fieldset">
                        <legend>Procurar logotipo</legend>
                        <AdminMediaClientSelect
                            setId={(id) =>
                                setData((cd) => ({ ...cd, logoMediaId: id }))
                            }
                        />
                    </fieldset>
                )}

                <div className="mt-2">
                    <input
                        type="hidden"
                        name="linksJson"
                        value={data?.linksJson ?? '[]'}
                    />
                    Links:
                    <LinksEditor
                        value={JSON.parse(data?.linksJson ?? '[]')}
                        setValue={(links) =>
                            setData((cd) => ({
                                ...cd,
                                linksJson: JSON.stringify(links),
                            }))
                        }
                    />
                </div>

                <div className="mt-2">
                    {data?.tools?.map((tool, idx) => (
                        <input
                            key={idx}
                            type="hidden"
                            name="tools[]"
                            value={JSON.stringify(tool)}
                        />
                    ))}
                    Ferramentas usadas:
                    <ToolsEditor
                        value={data?.tools ?? []}
                        setValue={(tools) => setData((cd) => ({ ...cd, tools }))}
                    />
                </div>

                <div className="mt-2">
                    <input
                        type="hidden"
                        name="tags"
                        value={JSON.stringify(data?.tags ?? [])}
                    />
                    Tags:
                    <TagsEditor
                        value={new Set(data?.tags)}
                        setValue={(newSet) =>
                            setData((cd) => ({ ...cd, tags: Array.from(newSet) }))
                        }
                    />
                </div>

                <div className="mt-2">
                    {data?.attachments?.map((att, idx) => (
                        <input
                            key={idx}
                            type="hidden"
                            name="attachments[]"
                            value={JSON.stringify(att)}
                        />
                    ))}
                    Anexos:
                    <AttachmentsEditor
                        value={data?.attachments ?? []}
                        setValue={(att) =>
                            setData((cd) => ({ ...cd, attachments: att }))
                        }
                    />
                </div>

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
    