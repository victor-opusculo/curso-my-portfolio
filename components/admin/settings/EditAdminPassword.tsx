'use client';

import { saveAdminPassword } from "@/lib/settings/actions";
import { useActionState } from "react";

export default function EditAdminPassword() {

    //@ts-ignore
    const [ state, action ] = useActionState(saveAdminPassword, undefined);

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