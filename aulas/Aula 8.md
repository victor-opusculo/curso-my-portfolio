# Aula 8

## Segredo de criptografia

1. No arquivo `.env` na raiz do projeto, adicionar a variável `ADMIN_SESSION_SECRET`. Gere um valor para ele usando o comando:

    ```sh
    openssl rand -base64 32      # Windows: Requer Git for Windows (https://git-scm.com/install/windows)
    ```

    > **Nota:** O segredo pode, teoricamente, ser qualquer valor de texto. Mas por maior segurança, recomendo gerar um valor aleatório.

    Exemplo:

    ```env
    ADMIN_SESSION_SECRET=VzOMF3feRJKDGgHbBNx8FBEI81iPixpA1xNYTutbRpw=
    ```

## Painel de administrador

1. Dentro de `app`, criar o diretório `admin`;
1. Dentro de `admin`, criar dois diretórios: `login` e `panel`;
1. Em `admin`, criar página `page.tsx` com:

    ```tsx
    import { redirect } from 'next/navigation';

    export default async function AdminPage() {
        redirect('/admin/login');
    }
    ```

1. Em `components`, criar o diretório `admin` e, dentro dele, os arquivos `LoginForm.tsx` e `LogoutButton.tsx` com:

    `LoginForm.tsx`:
    ```tsx
    'use client';

    import { FormState, login } from '@/lib/admin/actions';
    import { useActionState } from 'react';

    export default function LoginForm() {
        const [state, action, pending] = useActionState<FormState>(
        // @ts-ignore
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
                    <input
                        type="password"
                        className="grow txtinput"
                        name="password"
                    />
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
    ```

    `LogoutButton.tsx`:
    ```tsx
    'use client';

    import { logout } from '@/lib/admin/actions';

    export default function LogoutButton() {
        return (
            <button type="button" className="btn" onClick={logout}>
                Sair
            </button>
        );
    }
    ```
1. De volta ao diretório `admin`, dentro do subdiretório `login`, criar página `page.tsx`:

    ```tsx
    import LoginForm from '@/components/admin/LoginForm';

    export const metadata = { title: 'Login' };

    export default async function AdminLoginPage() {
        return (
            <div className="mx-auto my-4 max-w-[500px]">
                <h1 className="text-center">Login</h1>
                <LoginForm />
            </div>
        );
    }
    ```

1. Dentro do subdiretório `panel`, criar layout `layout.tsx` com:

    ```tsx
    import LogoutButton from '@/components/admin/LogoutButton';
    import NavBar from '@/components/layout/NavBar';
    import NavBarItem from '@/components/layout/NavBarItem';
    import { verifyAdminSession } from '@/lib/dal';

    export const dynamic = 'force-dynamic';

    export default async function AdminLayout(props: { children: any }) {
        await verifyAdminSession();

        return (
            <div>
                <h1 className="block bg-neutral-300 dark:bg-neutral-700 text-center">
                    Administração
                </h1>
                <div className="relative">
                    <NavBar>
                        <span className="flex flex-row">
                            <NavBarItem href="/admin/panel" label="Home Admin" />
                            <NavBarItem href="/admin/panel/blog" label="Blog" />
                            <NavBarItem
                                href="/admin/panel/projects"
                                label="Projetos"
                            />
                            <NavBarItem href="/admin/panel/media" label="Mídias" />
                            <NavBarItem
                                href="/admin/panel/tools"
                                label="Ferramentas"
                            />
                            <NavBarItem
                                href="/admin/panel/settings"
                                label="Configurações"
                            />
                        </span>
                        <span className="p-1">
                            <LogoutButton />
                        </span>
                    </NavBar>
                </div>
                <div className="mx-4 mt-4 mb-4">{props.children}</div>
            </div>
        );
    }
    ```

1. Por fim, a página home do painel de admin `page.tsx` dentro de `app/admin/panel`:

    ```tsx
    export const metadata = { title: 'Administração' };

    export default async function AdminPanelHome() {
        return <h1>Painel de administração</h1>;
    }
    ```

1. Criar proxy para proteção extra das páginas de administração. Criar aquivo `proxy.ts` na raíz do projeto com:

    ```typescript
        import { NextRequest, NextResponse } from 'next/server';
        import { decrypt, sessionCookieName } from '@/lib/session';
        import { cookies } from 'next/headers';

        const protectedRoutes = ['/admin/panel'];
        const publicRoutes = ['/admin/login'];

        export default async function proxy(req: NextRequest) {
            const path = req.nextUrl.pathname;
            const isProtectedRoute = protectedRoutes.includes(path);
            const isPublicRoute = publicRoutes.includes(path);

            const cookie = (await cookies()).get(sessionCookieName)?.value;
            const session = await decrypt(cookie);

            if (isProtectedRoute && !session?.userName) {
                return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
            }

            if (
                isPublicRoute &&
                session?.userName &&
                session?.role === 'admin' &&
                !req.nextUrl.pathname.startsWith('/admin/panel')
            ) {
                return NextResponse.redirect(new URL('/admin/panel', req.nextUrl));
            }

            return NextResponse.next();
        }

        // Rotas onde o proxy não deve ser executado
        export const config = {
            matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
        };
        ```