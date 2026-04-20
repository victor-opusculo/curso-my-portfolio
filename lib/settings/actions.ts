'use server';

import { verifyAdminSession } from "../dal";
import { checkPassword, setAdminName, setAdminPassword } from "./admin";
import { upsertInfos as upsertInfosContact } from "./contact";
import { upsertInfos as upsertInfosHomepage } from "./homepage";

type ContactFormState = {
    errors?: {
        email?: string[];
        telephone?: string[];
    };

    message?: string;

    data?: {
        email: string;
        telephone: string;
    }
};

type HomePageFormState = {
    errors?: {
        blogPostId?: string[];
    };

    message?: string;

    data?: {
        blogPostId: number;
    }
}

type AdminPasswordFormState = {
    errors?: {
        currentPassword?: string[];
        newPassword?: string[];
    };

    message?: string;
}

type AdminUsernameFormState = {
    errors?: {
        currentPassword?: string[];
        newUsername?: string[];
    };

    message?: string;
}

export async function saveContactInfos(
    formState: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    await verifyAdminSession();

    const email = formData.get('email')?.toString();
    const telephone = formData.get('telephone')?.toString();

    if (!email)
        return {
            errors: { email: [ 'E-mail não informado!' ] },
            data: { email: email ?? '', telephone: telephone ?? '' }
        };

    if (!telephone)
        return {
            errors: { telephone: [ 'Telefone não informado!' ] },
            data: { email: email ?? '', telephone: telephone ?? '' }
        };  

    const result = await upsertInfosContact({ email, telephone });

    if (result.rowsAffected > 0)
        return { message: 'Informações editadas com sucesso!' };
    else
        return { message: 'Nenhum dado alterado.' }
}

export async function saveHomePageInfos(
    formState: HomePageFormState,
    formData: FormData
): Promise<HomePageFormState> {
    await verifyAdminSession();

    const blogPostId = formData.get('blogPostId')?.toString();

    if (!blogPostId)
        return {
            errors: { blogPostId: [ 'Post de página inicial não informado!' ] }
        };

    const result = await upsertInfosHomepage({ blogPostId: Number.parseInt(blogPostId) });

    if (result.rowsAffected > 0)
        return { message: 'Informações editadas com sucesso!' }
    else
        return { message: 'Nenhum dado alterado.' }
}

export async function saveAdminPassord(
    formState: AdminPasswordFormState,
    formData: FormData
) : Promise<AdminPasswordFormState> {
    await verifyAdminSession();

    const oldPass = formData.get('oldPassword')?.toString() ?? '';
    const newPass = formData.get('newPassword')?.toString() ?? '';
    const newPass2 = formData.get('newPassword2')?.toString() ?? '';

    if (newPass !== newPass2)
        return { errors: { newPassword: [ 'Senhas novas não são iguais!' ] } };

    const oldPassCorrect = await checkPassword(oldPass);

    if (!oldPassCorrect)
        return { errors: { currentPassword: [ 'Senha atual incorreta!' ] } };

    await setAdminPassword(newPass);

    return { message: 'Senha alterada com sucesso!' };
}

export async function saveAdminUsername(
    formState: AdminUsernameFormState,
    formData: FormData
) : Promise<AdminUsernameFormState> {
    await verifyAdminSession();

    const password = formData.get('password')?.toString() ?? '';
    const newUsername = formData.get('newUsername')?.toString() ?? '';

    const passCorrect = await checkPassword(password);

    if (!passCorrect)
        return { errors: { currentPassword: [ 'Senha incorreta!' ] } };
    
    if (!newUsername)
        return { errors: { newUsername: [ 'Nome não pode estar em branco!' ] } };

    await setAdminName(newUsername);

    return { message: 'Nome alterado com sucesso!' };
}