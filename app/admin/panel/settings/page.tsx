import EditAdminName from "@/components/admin/settings/EditAdminName";
import EditAdminPassword from "@/components/admin/settings/EditAdminPassword";
import EditContactInfos from "@/components/admin/settings/EditContactInfos";
import EditHomePageBlogPost from "@/components/admin/settings/EditHomePageBlogPost";
import { getAdminName } from "@/lib/settings/admin";
import { getEmail, getTelephone } from "@/lib/settings/contact";
import { getHomepageBlogPost } from "@/lib/settings/homepage";

export const metadata = { title: 'Configurações' };

export default async function AdminSettingsHome() {
    const email = await getEmail();
    const telephone = await getTelephone();
    const homePagePost = await getHomepageBlogPost();
    const adminName = (await getAdminName()).userName ?? '';

    return (
        <>
            <h2>Configurações</h2>

            <fieldset className="fieldset">
                <legend>Informações de Contato</legend>
                <EditContactInfos email={email} telephone={telephone} />
            </fieldset>

            <fieldset className="fieldset">
                <legend>Página inicial</legend>
                <EditHomePageBlogPost currentId={homePagePost?.id} />
            </fieldset>

            <fieldset className="fieldset">
                <legend>Alterar senha de administração</legend>
                <EditAdminPassword />
            </fieldset>

            <fieldset className="fieldset">
                <legend>Alterar nome de administrador</legend>
                <EditAdminName currentName={adminName} />
            </fieldset>
        </>
    );
} 