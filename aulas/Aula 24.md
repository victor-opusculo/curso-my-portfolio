# Aula 24

## Página de configurações no painel de administrador

### Server Actions e acesso ao banco de dados

1. Criar em `lib/settings` o arquivo `contact.ts` com:

    ```ts
    import { settings } from '@/data/drizzle/schema';
    import { eq, sql } from 'drizzle-orm';
    import db from '../database/conn';

    const emailSettingKey = 'contact_email';
    const telephoneSettingKey = 'contact_phone';

    export async function getEmail() {
        const rows = await db
            .select()
            .from(settings)
            .where(eq(settings.key, emailSettingKey));
        const email = String(rows.shift()?.value ?? '');

        return email;
    }

    export async function getTelephone() {
        const rows = await db
            .select()
            .from(settings)
            .where(eq(settings.key, telephoneSettingKey));
        const phone = String(rows.shift()?.value ?? '');

        return phone;
    }

    export async function upsertInfos(infos: { email: string; telephone: string }) {
        const result = await db
            .insert(settings)
            .values([
                { key: emailSettingKey, value: infos.email },
                { key: telephoneSettingKey, value: infos.telephone },
            ])
            .onConflictDoUpdate({
                target: settings.key,
                set: { value: sql.raw(`excluded.${settings.value.name}`) },
            });

        return result;
    }

    ```

1. Criar no mesmo diretório o arquivo `homepage.ts` com:

    ```ts
    import { settings } from '@/data/drizzle/schema';
    import db from '../database/conn';
    import { eq, sql } from 'drizzle-orm';
    import { getSingle } from '../blog/blog';

    const settingKeyHomepageId = 'homepage_blog_post_id';

    export async function getHomepageBlogPost() {
        const rows = await db
            .select()
            .from(settings)
            .where(eq(settings.key, settingKeyHomepageId));
        const id = Number(rows.shift()?.value ?? NaN);

        if (id) return getSingle(id);
        else return null;
    }

    export async function setHomepageBlogPost(id: number) {
        const result = await db
            .insert(settings)
            .values({ key: settingKeyHomepageId, value: id.toString() })
            .onConflictDoUpdate({
                target: settings.key,
                set: { value: sql.raw(`excluded.${settings.value.name}`) },
            });

        return result;
    }

    export async function upsertInfos(infos: { blogPostId: number }) {
        const result = await db
            .insert(settings)
            .values({
                key: settingKeyHomepageId,
                value: infos.blogPostId.toString(),
            })
            .onConflictDoUpdate({
                target: settings.key,
                set: { value: sql.raw(`excluded.${settings.value.name}`) },
            });

        return result;
    }

    ```

1. Criar o arquivo de server actions `actions.ts` com:

    ```ts
    'use server';

    import { verifyAdminSession } from '../dal';
    import { checkPassword, setAdminName, setAdminPassword } from './admin';
    import { upsertInfos as upsertInfosContact } from './contact';
    import { upsertInfos as upsertInfosHomepage } from './homepage';

    type ContactFormState = {
        errors?: {
            email?: string[];
            telephone?: string[];
        };

        message?: string;

        data?: {
            email: string;
            telephone: string;
        };
    };

    type HomePageFormState = {
        errors?: {
            blogPostId?: string[];
        };

        message?: string;

        data?: {
            blogPostId: number;
        };
    };

    type AdminPasswordFormState = {
        errors?: {
            currentPassword?: string[];
            newPassword?: string[];
        };

        message?: string;
    };

    type AdminUsernameFormState = {
        errors?: {
            currentPassword?: string[];
            newUsername?: string[];
        };

        message?: string;
    };

    export async function saveContactInfos(
        formState: ContactFormState,
        formData: FormData
    ): Promise<ContactFormState> {
        await verifyAdminSession();

        const email = formData.get('email')?.toString();
        const telephone = formData.get('telephone')?.toString();

        if (!email)
            return {
                errors: { email: ['E-mail não informado!'] },
                data: { email: email ?? '', telephone: telephone ?? '' },
            };

        if (!telephone)
            return {
                errors: { telephone: ['Telefone não informado!'] },
                data: { email: email ?? '', telephone: telephone ?? '' },
            };

        const result = await upsertInfosContact({ email, telephone });

        if (result.rowsAffected > 0)
            return { message: 'Informações editadas com sucesso! ' };
        else return { message: 'Nenhum dado alterado.' };
    }

    export async function saveHomePageInfos(
        formState: HomePageFormState,
        formData: FormData
    ): Promise<HomePageFormState> {
        await verifyAdminSession();

        const blogPostId = formData.get('blogPostId')?.toString();

        if (!blogPostId)
            return {
                errors: { blogPostId: ['Post de página inicial não informado!'] },
            };

        const result = await upsertInfosHomepage({
            blogPostId: Number.parseInt(blogPostId),
        });

        if (result.rowsAffected > 0)
            return { message: 'Informações editadas com sucesso! ' };
        else return { message: 'Nenhum dado alterado.' };
    }

    export async function saveAdminPassword(
        formState: AdminPasswordFormState,
        formData: FormData
    ): Promise<AdminPasswordFormState> {
        await verifyAdminSession();

        const oldPass = formData.get('oldPassword')?.toString() ?? '';
        const newPass = formData.get('newPassword')?.toString() ?? '';
        const newPass2 = formData.get('newPassword2')?.toString() ?? '';

        if (newPass !== newPass2)
            return { errors: { newPassword: ['Senhas novas não são iguais!'] } };

        const oldPassCorrect = await checkPassword(oldPass);
        if (!oldPassCorrect)
            return { errors: { currentPassword: ['Senha atual incorreta!'] } };

        await setAdminPassword(newPass);

        return { message: 'Senha alterada com sucesso!' };
    }

    export async function saveAdminUsername(
        formState: AdminUsernameFormState,
        formData: FormData
    ): Promise<AdminUsernameFormState> {
        await verifyAdminSession();

        const password = formData.get('password')?.toString() ?? '';
        const newUsername = formData.get('newUsername')?.toString() ?? '';

        const passCorrect = await checkPassword(password);
        if (!passCorrect)
            return { errors: { currentPassword: ['Senha incorreta!'] } };

        if (!newUsername)
            return { errors: { newUsername: ['Nome não pode estar em branco!'] } };

        await setAdminName(newUsername);

        return { message: 'Nome alterado com sucesso!' };
    }
    ```