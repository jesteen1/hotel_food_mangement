import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import LogoutButton from "@/components/LogoutButton";
import PasswordWarning from "@/components/PasswordWarning";
import Logo from "@/components/Logo";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ... existing session checks ...
    const session = await getServerSession(authOptions);
    // ...
    if (!session || !session.user || !session.user.email) {
        redirect("/login");
    }

    // Fetch fresh user data from DB to ensure checks are up-to-date
    // Actions might rely on 'connectToDatabase' so we ensure it's imported (indirectly or directly)
    // We need to import User model here.
    const { User } = await import("@/lib/models");
    const { default: connectToDatabase } = await import("@/lib/db");

    await connectToDatabase();
    const dbUser = await User.findOne({ email: session.user.email }).lean() as any;

    if (!dbUser) redirect("/login");

    if (!dbUser.companyName) {
        redirect("/onboarding");
    }

    // Password Check Removed Request

    // Use dbUser for rendering to be safe/current
    const user = { ...session.user, ...dbUser };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {!user.hasSetPassword && <PasswordWarning />}
            {children}
        </div>
    );
}
