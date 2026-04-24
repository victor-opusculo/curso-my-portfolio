# Aula 5

## Componentes

1. Criar diretório `components` na raíz do projeto, ao lado de `app`;
1. Dentro, criar diretório `layout`;
1. Criar o arquivo `DarkModeToggler.tsx` com:

    ```tsx
    'use client';

    import { ChangeEvent, useEffect, useRef } from 'react';

    export default function DarkModeToggler() {
        const chbox = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (chbox.current)
                chbox.current.checked =
                    document.documentElement.classList.contains('dark');
        }, []);

        const onChange = (e: ChangeEvent) => {
            const hasDark =
                window.document.documentElement.classList.toggle('dark');
            window.localStorage.setItem('theme', hasDark ? 'dark' : 'light');
            window.cookieStore.set('theme', hasDark ? 'dark' : 'light');
        };

        return (
            <label
                className="flex flex-row items-center px-2 cursor-pointer"
                title="Alternar modo claro/escuro'"
            >
                <input
                    type="checkbox"
                    className="invisible peer"
                    ref={chbox}
                    onChange={onChange}
                />
                <span className="inline-block w-[2rem] h-[2rem] transition-[background-image] duration-500 bg-contain peer-checked:bg-[url('/icons/moon.svg')] bg-[url('/icons/sun.svg')]"></span>
            </label>
        );
    }
    ```

1. Criar o arquivo `NavBar.tsx` com:
    ```tsx
    'use client';

    interface NavBarProperties {
        children: React.JSX.Element | string | (React.JSX.Element | string)[];
    }

    export default function NavBar(props: NavBarProperties) {
        return (
            <nav className="left-0 flex flex-row justify-between w-full px-2 bg-neutral-400 dark:bg-neutral-800 min-h-[2.5rem]">
                {props.children}
            </nav>
        );
    }
    ```

1. Criar o arquivo `NavBarItem.tsx` com:
    ```tsx
    'use client';

    import Link from 'next/link';

    export default function NavBarItem(props: { href: string; label: string }) {
        const linkStyle =
            'flex flex-row items-center relative h-full text-[1.2rem] px-2';

        return (
            <span className="text-(--foreground) hover:bg-blue-600 hover:text-white">
                <Link className={linkStyle} href={props.href} prefetch={false}>
                    {props.label}
                </Link>
            </span>
        );
    }
    ```

## Montando o layout

1. De volta ao arquivo `layout.tsx` no diretório `app`, dentro do `div` no lugar do texto "NavBar":

    ```tsx
    import NavBar from "@/components/layout/NavBar";
    import NavBarItem from "@/components/layout/NavBarItem";
    import DarkModeToggler from "@/components/layout/DarkModeToggler";

    // ...

    // Dentro do div, no lugar de "NavBar"

    <NavBar>
        <span className="flex flex-row">
            <NavBarItem href="/" label="Home" />
            <NavBarItem href="/blog" label="Blog" />
            <NavBarItem
                href="/projects"
                label="Projetos"
            />
            <NavBarItem
                href="/tools"
                label="Ferramentas"
            />
        </span>
        <DarkModeToggler />
    </NavBar>
    ```

1. Ainda no layout, após o div com id "growableToFooter":
    ```tsx
    <footer className="pl-4 bg-neutral-300 dark:bg-neutral-700 text-center p-4">
        <p className="font-bold text-lg">Meu portfólio</p>
        <p>
            <a
                href="mailto:teste@example.com"
                className="hover:underline"
            >
                {email}
            </a>
        </p>
        <p>
            <a
                href={`https://wa.me/${telephone.replace(/\D+/g, '')}`}
                className="hover:underline"
            >
                {telephone}
            </a>
        </p>
    </footer>
    ```

1. Acima, após a constante `darkMode`:
    ```ts
    const email = 'exemplo@exemplo.com';    // Temporário!
    const telephone = '+5511999999999';    // Temporário!
    ```

1. Adicionar o valor de `darkMode` às classes do elemento HTML:

    ```tsx
    <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${darkMode}`}
    >
    ```

1. Layout básico com barra de menus e botão de modo escuro implementados.