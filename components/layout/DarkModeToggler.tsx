'use client';

import { ChangeEvent, useEffect, useRef } from "react";

export default function DarkModeToggler() {

    const chbox = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (chbox.current)
            chbox.current.checked = document.documentElement.classList.contains('dark');
    }, []);

    const onChange = (e: ChangeEvent) => {
        const hasDark = window.document.documentElement.classList.toggle('dark');
        window.localStorage.setItem('theme', hasDark ? 'dark' : 'light');
        window.cookieStore.set('theme', hasDark ? 'dark' : 'light');
    };

    return (
        <label
            className="flex flex-row items-center px-2 cursor-pointer"
            title="Alternar modo claro/escuro"
        >
            <input
                type="checkbox"
                className="invisible peer"
                ref={chbox}
                onChange={onChange}
            />
            <span className="inline-block w-[2rem] h-[2rem] transition-[background-image] duration-500 bg-contain peer-checked:bg-[url('/icons/moon.svg')] bg-[url('/icons/sun.svg')]"></span>
        </label>
    );
}