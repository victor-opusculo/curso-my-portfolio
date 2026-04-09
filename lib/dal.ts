import 'server-only';

import { cookies } from 'next/headers';
import { decrypt, sessionCookieName, SessionPayload } from './session';
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
        role: 'admin' satisfies SessionPayload['role']
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