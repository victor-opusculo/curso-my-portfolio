# Aula 6

## Páginas NotFound e de Erro

1. Dentro do diretório `app`, criar o arquivo `not-found.tsx` com:
    ```tsx
    import Link from 'next/link';

    export default function NotFound() {
        return (
            <div className="block mx-auto max-w-[500px] p-8 border-(--foreground) rounded-md text-(--foreground) bg-(--background) text-center">
                <h2 className="font-bold text-xl text-center my-4">
                    Página não encontrada!
                </h2>
                <p>Erro 404: Recurso solicitado não encontrado!</p>
                <div className="mt-4 text-center">
                    <Link className="btn" href="/">
                        Voltar à Home
                    </Link>
                </div>
            </div>
        );
    }
    ```

1. Ainda dentro de `app`, criar o arquivo `error.tsx` com:

    ```tsx
    'use client';

    import { useEffect } from 'react';

    export default function Error({
        error,
        reset,
    }: {
        error: Error & { digest?: string };
        reset: () => void;
    }) {
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

    ```
    