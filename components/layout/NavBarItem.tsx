'use client';

import Link from "next/link";

export default function NavBarItem(props: { href: string; label: string }) {
    const linkStyle = 'flex flex-row items-center relative h-full text-[1.2rem] px-2';

    return (
        <span className="text-(--foreground) hover:bg-blue-600 hover:text-white">
            <Link className={linkStyle} href={props.href} prefetch={false}>
                {props.label}
            </Link>
        </span>
    );
}