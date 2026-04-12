import LogoutButton from "@/components/admin/LogoutButton";
import NavBar from "@/components/layout/NavBar";
import NavBarItem from "@/components/layout/NavBarItem";
import { verifyAdminSession } from "@/lib/dal";

export const dynamic = 'force-dynamic';

export default async function AdminLayout(props: { children: any }) {
    await verifyAdminSession();

    return (
        <div>
            <h1 className="block bg-neutral-300 dark:bg-neutral-700 text-center">
                Administração
            </h1>
            <div className="relative">
                <NavBar>
                    <span className="flex flex-row">
                        <NavBarItem href="/admin/panel" label="Home Admin" />
                        <NavBarItem href="/admin/panel/blog" label="Blog" />
                        <NavBarItem href="/admin/panel/projects" label="Projetos" />
                        <NavBarItem href="/admin/panel/media" label="Mídias" />
                        <NavBarItem href="/admin/panel/tools" label="Ferramentas" />
                        <NavBarItem href="/admin/panel/settings" label="Configurações" />
                    </span>
                    <span className="p-1">
                        <LogoutButton />
                    </span>
                </NavBar>
            </div>
            <div className="mx-4 mt-4 mb-4">{props.children}</div>
        </div>
    );
}