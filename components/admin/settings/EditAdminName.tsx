'use client';

import { saveAdminUsername } from "@/lib/settings/actions";
import { useActionState, useState } from "react";

export default function EditAdminName(props: { currentName: string }) {

    //@ts-ignore
    const [ state, action ] = useActionState(saveAdminUsername, undefined);
    const [ data, setData ] = useState({ current: props.currentName });

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
                    onChange={e =>
                        setData(cd => ({ ...cd, current: e.target.value }))
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