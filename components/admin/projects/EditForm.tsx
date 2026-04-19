'use client';

import { projects } from "@/data/drizzle/schema";
import { FormState, sendProject } from "@/lib/projects/actions";
import { useActionState, useState } from "react";
import AdminMediaClientSelect from "../media/ClientSelect";
import LinksEditor from "./LinksEditor";
import TagsEditor from "../TagsEditor";
import { AttachmentData } from "@/lib/projects/projectAttachments";
import AttachmentsEditor from "./AttachmentsEditor";
import { ToolInfo } from "@/lib/tools/actions";
import ToolsEditor from "./ToolsEditor";

interface AdminProjectEditFormProps {
    existent?: typeof projects.$inferSelect;
    tags?: string[];
    attachments?: AttachmentData[];
    tools?: ToolInfo[];
}

export default function AdminProjectEditForm(props: AdminProjectEditFormProps) {
    const [ state, action, pending ] = useActionState<FormState>(
        //@ts-ignore
        sendProject,
        props.existent
            ? {
                data: {
                    ...props.existent,
                    tags: props.tags ?? [],
                    attachments: props.attachments ?? [],
                    tools: props.tools ?? []
                }
            }
            : undefined
    );

    const [ searchLogo, setSearchLogo ] = useState(false);
    const [ data, setData ] = useState(state?.data);

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
                    onChange={e =>
                        setData(cd => ({...cd, title: e.target.value }))
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
                    onChange={e =>
                        setData(cd => ({
                            ...cd,
                            description: e.target.value
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
                onChange={e =>
                    setData(cd => ({
                        ...cd,
                        logoMediaId: Number.parseInt(e.target.value)
                    }))
                }
            />
            <button
                type="button"
                className="btn ml-2"
                onClick={() => setSearchLogo(s => !s)}
            >
                Procurar
            </button>
            {Boolean(data?.logoMediaId) && (
                <img
                    src={`/api/media/${data?.logoMediaId}`}
                    className="max-w-[64px]"
                />
            )}

            {searchLogo && (
                <fieldset className="fieldset">
                    <legend>Procurar logotipo</legend>
                    <AdminMediaClientSelect
                        setId={id =>
                            setData(cd => ({ ...cd, logoMediaId: id }))
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
                    setValue={links =>
                        setData(cd => ({
                            ...cd,
                            linksJson: JSON.stringify(links)
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
                    setValue={tools => setData(cd => ({ ...cd, tools }))}
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
                    setValue={newSet => 
                        setData(cd => ({ ...cd, tags: Array.from(newSet) }))
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
                    setValue={att =>
                        setData(cd => ({ ...cd, attachments: att }))
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