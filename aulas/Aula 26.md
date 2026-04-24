# Aula 26

## Página de configurações no painel de administrador

### Página no painel

1. Em `app/admin/panel`, criar o diretório `settings` com a página `page.tsx`:

    ```tsx
    import EditAdminName from '@/components/admin/settings/EditAdminName';
    import EditAdminPassword from '@/components/admin/settings/EditAdminPassword';
    import EditContactInfos from '@/components/admin/settings/EditContactInfos';
    import EditHomePageBlogPost from '@/components/admin/settings/EditHomePageBlogPost';
    import { getAdminName } from '@/lib/settings/admin';
    import { getEmail, getTelephone } from '@/lib/settings/contact';
    import { getHomepageBlogPost } from '@/lib/settings/homepage';

    export const metadata = { title: 'Configurações' };

    export default async function AdminSettingsHome() {
        const email = await getEmail();
        const telephone = await getTelephone();
        const homePagePost = await getHomepageBlogPost();
        const adminName = (await getAdminName()).userName ?? '';

        return (
            <>
                <h2>Configurações</h2>

                <fieldset className="fieldset">
                    <legend>Informações de Contato</legend>
                    <EditContactInfos email={email} telephone={telephone} />
                </fieldset>

                <fieldset className="fieldset">
                    <legend>Página inicial</legend>
                    <EditHomePageBlogPost currentId={homePagePost?.id} />
                </fieldset>

                <fieldset className="fieldset">
                    <legend>Alterar senha de administração</legend>
                    <EditAdminPassword />
                </fieldset>

                <fieldset className="fieldset">
                    <legend>Alterar nome de administrador</legend>
                    <EditAdminName currentName={adminName} />
                </fieldset>
            </>
        );
    }

    ```

### Exibir informações no layout

1. Em `app/layout.tsx`, adicionar o import
    ```tsx
    import { getEmail, getTelephone } from '@/lib/settings/contact';
    ```
1. No mesmo arquivo, chamar as funções para as constantes, substituindo os valores existentes:

    ```tsx
    const email = await getEmail();
    const telephone = await getTelephone();
    ```

1. No rodapé, alterar o link de e-mail para:

    ```tsx
    <a
        href={`mailto:${email}`}
        className="hover:underline"
    >
        {email}
    </a>
    ```

1. Na homepage de `app` (`page.tsx`), adicionar o import:
    ```tsx
    import PostViewer from '@/components/blog/PostViewer';
    import { getHomepageBlogPost } from '@/lib/settings/homepage';
    ```

1. E alterar a função para:

    ```tsx
    export default async function Home() {
        const homePageBlogPost = await getHomepageBlogPost();

        return (
            <div className="mx-4 my-4">
                {(homePageBlogPost && (
                    <PostViewer post={homePageBlogPost} hideTimestamps tags={[]} />
                )) || <h1 className="font-2xl text-center">Bem-vindo!</h1>}
            </div>
        );
    }
    ```

