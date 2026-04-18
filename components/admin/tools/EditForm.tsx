'use client';

import { useActionState, useState } from "react";
import AdminMediaClientSelect from "../media/ClientSelect";
import { FormState, sendTool } from "@/lib/tools/actions";

interface AdminToolEditFormProps {
    existent?: {
        id: number;
        title: string;
        description: string|null;
        logoMediaId: number|null;
    };
}

export default function AdminToolEditForm(props: AdminToolEditFormProps) {
    const [state, action] = useActionState<FormState>(
        //@ts-ignore
        sendTool,
        props.existent ? { data: props.existent } : undefined
    );

    const [ searchEnabled, setSearchEnabled ] = useState(false);
    const [ data, setData ] = useState(
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
                    onChange={e =>
                        setData(cd => ({ ...cd, title: e.target.value }))
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
                    onChange={e => setData(cd => ({ ...cd, description: e.target.value }))}
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
                onChange={e => setData(cd => ({...cd, logoMediaId: Number.parseInt(e.target.value)}))}
            />
            <button
                type="button"
                className="btn ml-2"
                onClick={() => setSearchEnabled(s => !s)}
            >
                Procurar
            </button>

            {searchEnabled && (
                <AdminMediaClientSelect
                    setId={id => (
                        setData(cd => ({ ...cd, logoMediaId: id })),
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