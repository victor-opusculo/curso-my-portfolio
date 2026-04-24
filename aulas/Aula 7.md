# Aula 7

## Funções para acesso de administrador

1. Criar o diretório `lib` na raíz do projeto;
1. Dentro, criar o arquivo `session.ts` com:

    ```typescript
    import 'server-only';
    import { SignJWT, jwtVerify } from 'jose';
    import { cookies } from 'next/headers';

    export interface SessionPayload {
        [key: string]: any;
        userName: string;
        role: 'admin' | 'other';
        expiresAt: Date;
    }

    const secretKey = process.env.ADMIN_SESSION_SECRET;
    const encodedKey = new TextEncoder().encode(secretKey);

    export const sessionCookieName = 'user_session' as const;

    export async function encrypt(payload: SessionPayload) {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1d')
            .sign(encodedKey);
    }

    export async function decrypt(session: string | undefined = '') {
        try {
            const { payload } = await jwtVerify(session, encodedKey, {
                algorithms: ['HS256'],
            });
            return payload as SessionPayload;
        } catch (err) {}
    }

    export async function createAdminSession(userName: string) {
        const expiresAt = new Date(Date.now() * 24 * 60 * 60 * 1000); // 1 dia
        const session = await encrypt({ userName, expiresAt, role: 'admin' });
        const cookieStore = await cookies();

        cookieStore.set(sessionCookieName, session, {
            httpOnly: true,
            secure: true,
            expires: expiresAt,
            sameSite: 'lax',
            path: '/',
        });
    }

    export async function deleteSession() {
        const cookieStore = await cookies();
        cookieStore.delete(sessionCookieName);
    }

    ```

1. Criar o arquivo `dal.ts` (Data Access Layer) com:

    ```typescript
    import 'server-only';

    import { cookies } from 'next/headers';
    import { decrypt, sessionCookieName, SessionPayload } from '@/lib/session';
    import { redirect } from 'next/navigation';
    import { cache } from 'react';

    export const verifyAdminSession = cache(async () => {
        const cookie = (await cookies()).get(sessionCookieName)?.value;
        const session = await decrypt(cookie);

        if (!session?.userName || session?.role !== 'admin') {
            redirect('/admin/login');
        }

        return {
            isAuth: true,
            userName: session.userName,
            role: 'admin' satisfies SessionPayload['role'],
        } as const;
    });

    export const isAdminSession = cache(async () => {
        const cookie = (await cookies()).get(sessionCookieName)?.value;
        const session = await decrypt(cookie);

        if (!session?.userName || session?.role !== 'admin') {
            return false;
        }

        return true;
    });
    ```

## Acesso ao banco de dados

1. Criar, dentro de `lib`, o diretório `database`, e, dentro dele, o arquivo `conn.ts` com:

    ```typescript
    import { drizzle } from 'drizzle-orm/libsql';

    process.loadEnvFile('.env');

    const db = drizzle(process.env.DB_FILE_NAME!);

    export default db;
    ```

1. Ainda dentro de `database`, ciar o arquivo `errors.ts` com:

    ```typescript
    export class RowNotFound extends Error {
        constructor(public table: string) {
            super('Dados não encontrados!');
        }
    }

    export class IncompleteDataError extends Error {
        constructor(
            public field: string,
            public message: string
        ) {
            super(`Campo ${field}: ${message}`);
        }
    }

    ```

1. Por fim, o arquivo `helpers.ts` com:

    ```typescript
    export const defaultItemsOnPage = 20;

    export function processSearchText(input: string): string {
        let output = '';
        let withinExistentQuotes = false;
        let addedQuoteOpen = false;

        for (const char of input) {
            if (char === '"') {
                withinExistentQuotes = !withinExistentQuotes;
                output += char;
                continue;
            }

            if (!addedQuoteOpen && char !== ' ' && !withinExistentQuotes) {
                output += '"';
                addedQuoteOpen = true;
            } else if (addedQuoteOpen && char === ' ' && !withinExistentQuotes) {
                output += '"';
                addedQuoteOpen = false;
            }

            output += char;
        }

        if (output.at(-1) !== '"') output += '"';

        return output;
    }
    ```

1. Agora, dentro de `lib`, criar o diretório `settings`, e, dentro dele, o arquivo `admin.ts` com:

    ```typescript
    import { settings } from '@/data/drizzle/schema';
    import db from '@/lib/database/conn';
    import { eq } from 'drizzle-orm';
    import { RowNotFound } from '../database/errors';
    import bcrypt from 'bcrypt';

    export const settingKeyUsername = 'admin_username';
    export const settingKeyPassword = 'admin_password_hash';

    export async function getAdminName() {
        const rows = await db
            .select({ userName: settings.value })
            .from(settings)
            .where(eq(settings.key, settingKeyUsername))
            .limit(1);

        if (rows.length < 1) throw new RowNotFound('settings');

        return rows.shift()!;
    }

    export async function setAdminName(newName: string) {
        return db
            .update(settings)
            .set({ value: newName })
            .where(eq(settings.key, settingKeyUsername));
    }

    export async function setAdminPassword(newPassword: string) {
        const newHash = await bcrypt.hash(newPassword, 10);
        return db
            .update(settings)
            .set({ value: newHash })
            .where(eq(settings.key, settingKeyPassword));
    }

    export async function checkPassword(givenPassword: string) {
        const rows = await db
            .select({ password: settings.value })
            .from(settings)
            .where(eq(settings.key, settingKeyPassword))
            .limit(1);
        const hash = rows.shift()?.password;

        if (!hash) throw new RowNotFound('settings');

        return bcrypt.compare(givenPassword, hash);
    }

    export async function checkAndSetPassword(
        oldPassword: string,
        newPassword: string
    ) {
        if (await checkPassword(oldPassword)) return setAdminPassword(newPassword);

        throw new Error('Senha atual incorreta!');
    }

    ```

## Server Actions para o administrador

1. Ainda dentro de `lib`, criar o diretório `admin`, e, dentro dele, o arquivo `actions.ts` com:

    ```typescript
    'use server';

    import { createAdminSession, deleteSession } from '@/lib/session';
    import bcrypt from 'bcrypt';
    import db from '@/lib/database/conn';
    import { settings } from '@/data/drizzle/schema';
    import { eq, or } from 'drizzle-orm';
    import { settingKeyPassword, settingKeyUsername } from '@/lib/settings/admin';
    import { redirect } from 'next/navigation';

    export type FormState =
        | {
            errors?: {
                username?: string[];
                password?: string[];
            };
            message?: string;
        }
        | undefined;

    export async function login(
        formState: FormState,
        formData: FormData
    ): Promise<FormState> {
        const userName = formData.get('username')?.toString();
        const password = formData.get('password')?.toString() ?? '';

        const rows = await db
            .select()
            .from(settings)
            .where(
                or(
                    eq(settings.key, settingKeyUsername),
                    eq(settings.key, settingKeyPassword)
                )
            );

        const userNameGot = rows.find((r) => r.key === settingKeyUsername);
        const passwordHashGot = rows.find((r) => r.key === settingKeyPassword);

        if (!userNameGot?.value || !passwordHashGot?.value)
            throw new Error('Dados de login não encontrados!');

        if (
            userName === userNameGot.value &&
            (await bcrypt.compare(password, passwordHashGot.value))
        ) {
            await createAdminSession(userName);
            redirect('/admin/panel');
        } else
            return {
                errors: {
                    username: ['Combinação usuário/senha incorreta'],
                    password: ['Combinação usuário/senha incorreta'],
                },
            };
    }

    export async function logout() {
        await deleteSession();
        redirect('/admin/login');
    }

    ```
