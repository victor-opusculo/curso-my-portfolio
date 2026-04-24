# Aula 2

## Preparação do ambiente

1. Instalação do Node.js versão 25 e NPM versão 11: Site oficial do [Node.js](https://nodejs.org/pt-br/download)

1. Instalação do SQLite3: 

    > Windows: ``winget install SQLite.SQlite``
    >
    > Linux: ``# apt install sqlite3``

1. Instalação/preparação de IDE:

    > Visual Studio Code:
    > - Windows: [VSCode on Windows](https://code.visualstudio.com/docs/setup/windows)
    > - Linux: [VSCode on Linux](https://code.visualstudio.com/docs/setup/linux#_install-vs-code-on-linux)
    >
    > Visual Studio Codium:
    > - Windows/Linux: [VSCodium](https://github.com/VSCodium/vscodium)
    >
    > **Nota**: Não recomendável instalar via Flatpak ou Appimage, pois o IDE pode não conseguir acessar os binários e bibliotecas necessários para o desenvolvimento completo.

1. Instalação de Git [Git for Windows](https://git-scm.com/install/windows) / [Git for Linux](https://git-scm.com/install/linux)

## Criação do projeto

1. Abrir terminal no diretório onde deve ser criada a raíz do projeto, e executar:

    ```shell
    nvm use stable  # somente se o Node for instalado via NVM (Node Version Manager). Versão 25 no momento desta aula.

    npx create-next-app@latest my-portfolio --yes   # versão 16.2.1 no momento desta aula
    ```

1. Abrir o IDE na pasta recém-criada.
1. Abrir o terminal do IDE e instalar dependências:

    ```shell
    # Dependências de produção

    npm i drizzle-orm @libsql/client
    npm i bcrypt @types/bcrypt
    npm i jose
    npm i server-only
    npm i dayjs
    npm i file-type

    # Dependências de desenvolvimento

    npm i -D drizzle-kit
    npm i -D lorem-ipsum
    npm i -D tsx
    ```

1. Criar arquivo de configuração do Drizzle Kit na raíz do projeto:

    ```typescript
    // drizzle.config.ts

    import { defineConfig } from 'drizzle-kit';

    process.loadEnvFile('.env');

    export default defineConfig({
        out: './data/drizzle',
        schema: './data/schema.ts',
        dialect: 'sqlite',
        dbCredentials: {
            url: process.env.DB_FILE_NAME!,
        },
    });

    ```

