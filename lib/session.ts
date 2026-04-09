import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface SessionPayload {
    [key: string]: any;
    userName: string;
    role: 'admin'|'other';
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
            algorithms: ['HS256']
        });

        return payload as SessionPayload;
    }
    catch (err) {}
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
        path: '/'
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(sessionCookieName);
}