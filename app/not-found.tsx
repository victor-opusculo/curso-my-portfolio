import Link from "next/link";

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