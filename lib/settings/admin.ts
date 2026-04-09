import { settings } from "@/data/drizzle/schema";
import db from "../database/conn";
import { eq } from "drizzle-orm";
import { RowNotFound } from "../database/errors";
import bcrypt from 'bcrypt';

export const settingKeyUsername = 'admin_username';
export const settingKeyPassword = 'admin_password_hash';

export async function getAdminName() {
    const rows = await db
        .select({ userName: settings.value })
        .from(settings)
        .where(eq(settings.key, settingKeyUsername))
        .limit(1);

    if (rows.length < 1)
        throw new RowNotFound('settings');

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

    if (!hash)
        throw new RowNotFound('settings');

    return bcrypt.compare(givenPassword, hash);
}

export async function checkAndSetPassword(
    oldPassword: string,
    newPassword: string
) {
    if (await checkPassword(oldPassword))
        return setAdminPassword(newPassword);

    throw new Error('Senha atual incorreta!');
}