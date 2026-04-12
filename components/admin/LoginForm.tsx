'use client';

import { FormState, login } from "@/lib/admin/actions";
import { useActionState } from "react";

export default function LoginForm() {
    const [ state, action, pending ] = useActionState<FormState>(
        //@ts-ignore
        login,
        undefined
    );

    return (
        <form action={action} className="p-2">
            <label className="flex flex-row my-2 items-center">
                <span className="shrink mr-2">Usuário: </span>
                <input type="text" className="grow txtinput" name="username" />
            </label>
            {state?.errors?.username && (
                <p className="text-red-500">{state.errors.username}</p>
            )}

            <label className="flex flex-row my-2 items-center">
                <span className="shrink mr-2">Senha: </span>
                <input type="password" className="grow txtinput" name="password" />
            </label>
            {state?.errors?.password && (
                <p className="text-red-500">{state.errors.password}</p>
            )}

            <div className="text-center my-4">
                <button type="submit" className="btn">
                    Entrar
                </button>
            </div>
        </form>
    );
}