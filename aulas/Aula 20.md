# Aula 20

## Cadastro de ferramentas

### Páginas de criação, visualização, edição e exclusão

1. Criar em`app/admin/panel/tools` o diretório `create` com a página `page.tsx`:

    ```Tsx
    import AdminToolEditForm from '@/components/admin/tools/EditForm';

    export const metadata = { title: 'Criar ferramenta' };

    export default async function AdminToolsCreate() {
        return (
            <>
                <h2>Criar ferramenta</h2>
                <AdminToolEditForm />
            </>
        );
    }

    ```

1. Criar em `app/admin/panel/tools` o diretório `[toolId]`;
1. Nele, a página `page.tsx` com:

    ```tsx
    import { RowNotFound } from '@/lib/database/errors';
    import { getSingle } from '@/lib/tools/tools';
    import { notFound } from 'next/navigation';

    export const metadata = { title: 'Ver ferramenta' };

    export default async function AdminToolView(props: {
        params: Promise<{ toolId: number }>;
    }) {
        const params = await props.params;

        try {
            const tool = await getSingle(params.toolId);

            return (
                <>
                    <h2>Ver ferramenta</h2>
                    <div className="text-center my-2">
                        <img
                            src={`/api/media/${tool.logoMediaId}`}
                            className="max-h-[500px]"
                            alt={tool.title}
                            title={tool.title}
                        />
                    </div>

                    <div>
                        <span className="block font-bold text-lg">
                            {tool.title}
                        </span>
                        <span className="block">ID nº {tool.id}</span>

                        <div className="whitespace-pre-line w-full mt-4">
                            {tool.description}
                        </div>
                    </div>
                </>
            );
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else throw err;
        }
    }

    ```

1. No mesmo diretório, criar os subdiretórios `edit` e `delete`;
1. Em `edit`, a página `page.tsx`:

    ```tsx
    import AdminToolEditForm from '@/components/admin/tools/EditForm';
    import { RowNotFound } from '@/lib/database/errors';
    import { getSingle } from '@/lib/tools/tools';
    import { notFound } from 'next/navigation';

    export const metadata = { title: 'Editar ferramenta' };

    export default async function AdminToolEdit(props: {
        params: Promise<{ toolId: number }>;
    }) {
        const params = await props.params;
        try {
            const tool = await getSingle(params.toolId);
            return (
                <>
                    <h2>Editar ferramenta</h2>
                    <AdminToolEditForm existent={tool} />
                </>
            );
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else throw err;
        }
    }


    ```

1. Em `delete`, a página `page.tsx`:

    ```tsx
    import DeleteEntityForm from '@/components/data/DeleteEntityForm';
    import { RowNotFound } from '@/lib/database/errors';
    import { removeTool } from '@/lib/tools/actions';
    import { getSingle } from '@/lib/tools/tools';
    import { notFound } from 'next/navigation';

    export const metadata = { title: 'Excluir ferramenta' };

    export default async function AdminToolDelete(props: {
        params: Promise<{ toolId: number }>;
    }) {
        const params = await props.params;
        try {
            const tool = await getSingle(params.toolId);

            return (
                <>
                    <h2>Excluir ferramenta</h2>
                    <DeleteEntityForm
                        serverAction={async () => {
                            'use server';
                            return removeTool(tool.id);
                        }}
                    >
                        <p className="text-center font-bold my-2">
                            Tem certeza de que deseja excluir esta ferramenta?
                        </p>

                        <div className="w-full my-2">
                            <img
                                src={`/api/media/${tool.logoMediaId}`}
                                className="max-h-[500px]"
                            />
                        </div>
                        <p>Título: {tool.title}</p>
                    </DeleteEntityForm>
                </>
            );
        } catch (err) {
            if (err instanceof RowNotFound) notFound();
            else throw err;
        }
    }

    ```