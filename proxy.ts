import { NextRequest, NextResponse } from "next/server";
import { decrypt, sessionCookieName } from "./lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ['/admin/panel'];
const publicRoutes = ['/admin/login'];

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const cookie = (await cookies()).get(sessionCookieName)?.value;
    const session = await decrypt(cookie);

    if (isProtectedRoute && !session?.userName) {
        return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }

    if (
        isPublicRoute &&
        session?.userName &&
        session.role === 'admin' &&
        !req.nextUrl.pathname.startsWith('/admin/panel')
    ) {
        return NextResponse.redirect(new URL('/admin/panel', req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};