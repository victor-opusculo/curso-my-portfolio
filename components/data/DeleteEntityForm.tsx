"use client";

import { useRouter } from "next/navigation";

export default function DeleteEntityForm(props: { children: any, serverAction: () => void })
{
    const router = useRouter();

    return (
        <form action={props.serverAction}>
            {props.children}

            <div className="my-4">
                <button type="submit" className="btn mr-2">Sim, excluir</button>
                <button type="button" className="btn" onClick={() => router.back()}>Não excluir</button>
            </div>
        </form>
    );
}