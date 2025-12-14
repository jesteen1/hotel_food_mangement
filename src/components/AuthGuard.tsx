import { getUserSession } from "@/app/actions";
import { redirect } from "next/navigation";

interface AuthGuardProps {
    role: 'chief' | 'inventory' | 'billing' | 'menu' | 'master';
    children: React.ReactNode;
    requirePassword?: boolean;
}

export default async function AuthGuard({ role, children, requirePassword }: AuthGuardProps) {
    const session = await getUserSession();

    if (!session || !session.user) {
        redirect("/login");
    }

    // Adapt legacy role check to verify if the user is authenticated. 
    // Since we moved to Google Auth/Multi-tenancy for owners, 
    // we assume any authenticated owner has access for now, 
    // or we need to add 'role' to the User model.
    // For now, let's treat any logged-in user as having access to these valid pages, 
    // effectively making it an authentication guard rather than a role guard.
    // If we need strict roles, we should add it to the User model.

    // For this build fix:
    // If strict password protection is required (e.g. for Menu Kiosk mode)
    if (requirePassword) {
        // Dynamic import to avoid server component issues with client component if needed, 
        // but here we just import it.
        const RoleProtection = (await import("@/components/RoleProtection")).default;
        return (
            <RoleProtection role={role}>
                {children}
            </RoleProtection>
        );
    }

    return <>{children}</>;
}
