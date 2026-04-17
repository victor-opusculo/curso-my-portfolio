'use client';

import Spinner from "@/components/data/Spinner";
import { FormState, sendPost } from "@/lib/blog/actions";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { useActionState, useState } from "react";
import 'dayjs/locale/pt-br';
import TagsEditor from "../TagsEditor";

dayjs.extend(utc);

interface FormProperties {
    existent?: {
        id: number,
        title: string,
        content: string,
        enableHtml: number,
        isVisible: number,
        publishedAtUtc: string | null,
        updatedAtUtc: string | null
    };
    tags?: string[];
}

export default function AdminBlogEditForm(props: FormProperties) {
    const [ state, action, pending ] = useActionState<FormState>(
        //@ts-ignore
        sendPost,
        props.existent
            ? { data: { ...props.existent, tags: props.tags ?? [] } }
            : undefined
    );

    const [ data, setData ] = useState(state?.data);

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
                    onChange={e =>
                        setData(cd => ({ ...cd, title: e.target.value }))
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
                    onChange={e =>
                        setData(cd => ({ ...cd, content: e.target.value }))
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
                    onChange={e =>
                        setData(cd => ({
                            ...cd,
                            isVisible: Number(e.target.checked)
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
                    checked={Boolean(data?.enableHtml ?? true)}
                    onChange={e =>
                        setData(cd => ({
                            ...cd,
                            enableHtml: Number(e.target.checked)
                        }))
                    }
                />{' '}
                Habilitar HTML
            </label>

            <div className="mt-2">
                Tags:
                <TagsEditor
                    value={new Set(data?.tags)}
                    setValue={newSet => setData(cd => ({ ...cd, tags: Array.from(newSet) }))}
                />
                <input
                    type="hidden"
                    name="tags"
                    value={JSON.stringify(data?.tags ?? [])}
                />

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
            </div>
        </form>
    );
}