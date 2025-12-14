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
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Logo />
                            </div>
                            <div className="ml-6 flex space-x-8">
                                <a
                                    href="/admin"
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Dashboard
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">{user.email}</span>
                            <div className="h-4 w-px bg-gray-300 mx-2"></div>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>
            {!user.hasSetPassword && <PasswordWarning />}
            {children}
        </div>
    );
}
