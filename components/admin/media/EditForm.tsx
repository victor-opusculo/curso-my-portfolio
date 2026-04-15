'use client';

import Spinner from "@/components/data/Spinner";
import { sendMedia, FormState } from "@/lib/media/actions";
import { ChangeEvent, useActionState, useState } from "react";

interface FormProperties {
    existent?: { id: number; title: string };
    maxSize: number;
}

export default function AdminMediaEditForm(props: FormProperties) {
    const [ data, setData ] = useState<{
        id: number | undefined;
        title: string;
        file?: File;
    }>(
        props.existent ?? {
            id: undefined as number|undefined,
            title: '',
            file: undefined as File|undefined
        }
    );

    const [state, action, pending] = useActionState<FormState>(
        //@ts-ignore
        sendMedia,
        undefined
    );

    const changeFile = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (file) setData(cd => ({ ...cd, file }));
    };

    const submit = (e: any) => {
        if (data.file) {
            if (data.file.size > props.maxSize) {
                alert(
                    `Tamanho máximo de ${props.maxSize / 1024 / 1024} Mib excedido!`
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
                    onChange={e =>
                        setData(cd => ({ ...cd, title: e.target.value }))
                    }
                />
            </label>
            {state?.errors?.title && (
                <p className="text-red-600">{state.errors.title}</p>
            )}
            <label className="block">
                {props.existent?.id ? 'Altear arquivo (opcional)' : 'Arquivo'}:
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
    )
}