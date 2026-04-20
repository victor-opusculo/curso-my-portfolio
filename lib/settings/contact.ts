import { settings } from "@/data/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import db from "../database/conn";

const emailSettingsKey = 'contact_email';
const telephoneSettingsKey = 'contact_phone';

export async function getEmail() {
    const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, emailSettingsKey));

    const email = String(rows.shift()?.value ?? '');

    return email;
}

export async function getTelephone() {
    const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, telephoneSettingsKey));

    const phone = String(rows.shift()?.value ?? '');

    return phone;
}

export async function upsertInfos(infos: { email: string; telephone: string }) {
    const result = await db
        .insert(settings)
        .values([
            { key: emailSettingsKey, value: infos.email },
            { key: telephoneSettingsKey, value: infos.telephone },
        ])
        .onConflictDoUpdate({
            target: settings.key,
            set: { value: sql.raw(`excluded.${settings.value.name}`) }
        });

    return result;
}

