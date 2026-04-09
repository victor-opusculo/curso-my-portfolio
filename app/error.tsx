'use client';

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void; }) {

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="block mx-auto max-w-[500px] p-8 border-(--foreground) rounded-md text-(--foreground) bg-(--background) text-center">
            <h2 className="font-bold text-xl text-center my-4">
                Ops! Algo aconteceu!
            </h2>
            <button className="btn" onClick={() => reset()}>
                Tentar novamente
            </button>
        </div>
    );

}