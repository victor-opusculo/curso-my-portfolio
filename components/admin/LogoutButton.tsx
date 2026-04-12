'use client';

import { logout } from "@/lib/admin/actions";

export default function LogoutButton() {
    return (
        <button type="button" className="btn" onClick={logout}>
            Sair
        </button>
    );
}