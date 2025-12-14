'use client';

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => {
                // Clear all session storage (locks menu re-entry)
                sessionStorage.clear();

                // Clear custom cookies
                document.cookie = "auth_intent=; path=/; max-age=0";

                signOut({ callbackUrl: '/login' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
            <LogOut size={16} />
            Sign Out
        </button>
    );
}
