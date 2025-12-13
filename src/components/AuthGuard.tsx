import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";

interface AuthGuardProps {
    role: 'chief' | 'inventory' | 'billing' | 'menu' | 'master';
    children: React.ReactNode;
}

export default async function AuthGuard({ role, children }: AuthGuardProps) {
    const session = await getSession();

    // Master has access to everything
    if (session.role === 'master') {
        return <>{children}</>;
    }

    // Role specific check
    if (session.role !== role) {
        redirect(`/login?target=${role}`);
    }

    return <>{children}</>;
}
