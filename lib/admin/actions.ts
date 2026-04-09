'use server';

import { createAdminSession, deleteSession } from "../session";
import bcrypt from 'bcrypt';
import db from "../database/conn";
import { settings } from "@/data/drizzle/schema";
import { eq, or } from "drizzle-orm";
import { settingKeyPassword, settingKeyUsername } from "../settings/admin";
import { redirect } from "next/navigation";

export type FormState = 
    | {
        errors?: {
            username?: string[],
            password?: string[],
        },
        message?: string
    }
    | undefined;

export async function login(formState: FormState, formData: FormData) : Promise<FormState>
{
    const userName = formData.get('username')?.toString();
    const password = formData.get('password')?.toString() ?? '';

    const rows = await db
        .select()
        .from(settings)
        .where(
            or(
                eq(settings.key, settingKeyUsername),
                eq(settings.key, settingKeyPassword),
            )
        );

        const userNameGot = rows.find(r => r.key === settingKeyUsername);
        const passwordHashGot = rows.find(r => r.key === settingKeyPassword);

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
                }
            };
}

export async function logout()
{
    await deleteSession();
    redirect('/admin/login');
}