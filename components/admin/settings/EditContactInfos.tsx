'use client';

import { saveContactInfos } from "@/lib/settings/actions";
import { useActionState, useState } from "react";

export default function EditContactInfos(props: {
    email: string;
    telephone: string;
}) {
    const [ state, action ] = useActionState(saveContactInfos, { data: {
        email: props.email,
        telephone: props.telephone
    } });
    const [ data, setData ] = useState(state.data ?? props);

    return (
        <form className="m-4" action={action}>
            <label className="block my-2">
                E-mail:
                <input
                    type="email"
                    name="email"
                    required
                    className="txtinput w-full"
                    value={data.email ?? ''}
                    onChange={e =>
                        setData(cd => ({ ...cd, email: e.target.value }))
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
                    value={data.telephone ?? ''}
                    onChange={e =>
                        setData(cd => ({ ...cd, telephone: e.target.value }))
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