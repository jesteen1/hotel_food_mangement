'use client';

import { useEffect, useState } from 'react';
import { manualSeed } from '../actions';
import Link from 'next/link';

export default function FixFriesPage() {
    const [status, setStatus] = useState('Fixing...');

    useEffect(() => {
        manualSeed().then((res) => {
            if (res.success) {
                setStatus('✅ Fixed! You can now check the menu.');
            } else {
                setStatus('❌ Failed: ' + res.error);
            }
        });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-4">{status}</h1>
            <Link href="/admin/inventory" className="text-blue-600 hover:underline">
                Go to Inventory
            </Link>
            <div className="mt-8 border p-4 bg-white rounded-lg shadow-sm">
                <p className="mb-2 text-sm text-gray-500">Image Verification:</p>
                <img src="/images/french_fries_crispy.png" alt="Verification" className="w-32 h-32 object-cover rounded-md bg-gray-100" />
            </div>
        </div>
    );
}
