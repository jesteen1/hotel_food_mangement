
'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function OrderSuccessPage() {
    useEffect(() => {
        // Clear all verification flags upon successful order completion
        // This ensures the customer must re-enter the code to order more (Privacy)
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('verified_')) {
                sessionStorage.removeItem(key);
            }
        });

        // Also ensure any lingering auth session is cleared
        signOut({ redirect: false });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in zoom-in-50 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                <CheckCircle size={48} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Received!</h1>
            <p className="text-xl text-gray-500 mb-8 max-w-sm">
                Just sit back and relax. Your food will be brought to your seat shortly.
            </p>

            <div className="flex gap-4">
                <Link
                    href="/menu"
                    className="px-8 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:bg-gray-800 transition-colors"
                >
                    Order More
                </Link>
                <Link
                    href="/"
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
