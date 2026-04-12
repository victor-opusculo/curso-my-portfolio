import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: 'Login' };

export default async function AdminLoginPage() {
    return (
        <div className="mx-auto my-4 max-w-[500px]">
            <h1 className="text-center">Login</h1>
            <LoginForm />
        </div>
    );
}