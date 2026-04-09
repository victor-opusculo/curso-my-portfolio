"use client";

interface NavBarProperties {
    children: React.JSX.Element | string | (React.JSX.Element | string)[];
}

export default function NavBar(props: NavBarProperties)
{
    return (
        <nav className="left-0 flex flex-row justify-between w-full px-2 bg-neutral-400 dark:bg-neutral-800 min-h-[2.5rem]">
            {props.children}
        </nav>
    );
}

