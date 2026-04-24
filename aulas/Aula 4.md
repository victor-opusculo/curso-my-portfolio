# Aula 4

1. Criar arquivos de schema do DrizzleORM a partir do banco de dados criado:
    ```bash
    # na raíz do projeto
    npx drizzle-kit pull
    ```

1. Copiar arquivos de ícones para layout em `public`;
1. Dentro de `app`, alterar o arquivo `globals.css`:

    ```css
    @import 'tailwindcss';

    :root {
        --background: #ffffff;
        --foreground: #171717;
    }

    @theme inline {
        --color-background: var(--background);
        --color-foreground: var(--foreground);
        --font-sans: var(--font-geist-sans);
        --font-mono: var(--font-geist-mono);
    }

    @custom-variant dark (&:where(.dark, .dark *));

    :root.dark {
        --background: #0a0a0a;
        --foreground: #ededed;
    }

    body {
        background: var(--background);
        color: var(--foreground);
        font-family: Arial, Helvetica, sans-serif;
    }

    h1 {
        @apply font-bold uppercase text-[2rem];
    }
    h2 {
        @apply font-bold uppercase text-[1.3rem];
    }

    .link {
        @apply text-lg text-sky-600 mx-2 hover:brightness-90 hover:underline active:brightness-80;
    }

    .pagination {
        @apply block my-2 list-none text-base ml-4;
    }
    .pagination li {
        @apply inline mx-1;
    }
    .pagination .currentPageNum {
        @apply font-bold;
    }

    .fieldset {
        @apply border border-2 rounded-md p-2 m-2;
    }

    .btn {
        @apply min-w-[3rem] border border-(--background) bg-(--foreground) text-(--background) font-bold rounded-md py-1 px-2 cursor-pointer active:brightness-90;
    }

    .txtinput {
        @apply border border-(--foreground) bg-(--background) text-(--foreground) rounded-md p-1 active:brightness-110;
    }

    .taglabel {
        @apply inline-block rounded-xl bg-sky-600 text-white p-2;
    }

    .responsiveTable {
        @apply block lg:table w-full;
    }
    .responsiveTable thead {
        @apply block lg:table-header-group;
    }
    .responsiveTable th {
        @apply absolute hidden lg:table-cell lg:relative;
    }
    .responsiveTable tbody {
        @apply block lg:table-row-group;
    }
    .responsiveTable tr {
        @apply block py-4 lg:py-2 lg:table-row border-b border-b-(--foreground);
    }
    .responsiveTable td {
        @apply block lg:table-cell before:font-bold before:content-[attr(data-th)':_'] lg:before:content-none;
    }

    #growableToFooter {
        min-height: calc(100vh - 150px);
    }

    footer {
        height: 150px;
    }

    ```

1. Alterar o arquivo `layout.tsx`:

    Adicionar metadados ao layout:
    ```typescript
    export const metadata: Metadata = {
        title: { template: '%s | Meu portfólio', default: 'Meu portfólio' },
        description: 'Curso V. Opus',
    };
    ```

1. Definir função de renderização como `async`;

1. Dentro da função de renderização:
    ```typescript
    const cookiesStore = await cookies();
    const darkMode = cookiesStore.get('theme')?.value === 'dark' ? 'dark' : '';
    ```
1. Adicionar esta `div` dentro da tag body:

    ```tsx
    <div id="growableToFooter">
        <header className="w-full relative block min-h-[200px] bg-neutral-300 dark:bg-neutral-700 pt-8">
            <Image
                className="pl-8"
                src="/logo-generic.svg"
                alt="Meu portfólio"
                width={300}
                height={200}
                loading="eager"
            />
            <div className="absolute bottom-0 w-full">
                NavBar
            </div>
        </header>
        <main>{children}</main>
    </div>
    ```

1. Apagar conteúdo de página padrão (`page.tsx`) e deixar somente:

    ```typescript
    export default function Home() {
        return (
            <h1>Homepage</h1>
        );
    }
    ```

1. Testar a página:
    
    ```bash
    npm run dev
    ```

1. Abrir http://localhost:3000