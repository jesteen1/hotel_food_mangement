import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RoleProtection from "./RoleProtection";

interface AuthGuardProps {
    role: 'chief' | 'inventory' | 'billing' | 'menu' | 'master';
    children: React.ReactNode;
    requirePassword?: boolean;
}

export default async function AuthGuard({ role, children, requirePassword }: AuthGuardProps) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    // Role-based protection logic
    if (requirePassword) {
        return (
            <RoleProtection role={role}>
                {children}
            </RoleProtection>
        );
    }

    return <>{children}</>;
}
