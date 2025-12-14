'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { verifyRolePassword } from '@/app/actions';

interface RoleProtectionProps {
    role: string;
    children: React.ReactNode;
}

export default function RoleProtection({ role, children }: RoleProtectionProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check session storage on mount
        const unlocked = sessionStorage.getItem(`role_unlocked_${role}`);
        if (unlocked === 'true') {
            setIsUnlocked(true);
        }
    }, [role]);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await verifyRolePassword(role, password);
            if (result.success) {
                setIsUnlocked(true);
                sessionStorage.setItem(`role_unlocked_${role}`, 'true');
            } else {
                setError(result.error || 'Invalid Password');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Protected Area</h2>
                    <p className="text-gray-500 text-center mt-2">
                        Please enter the password to access the {role} section.
                    </p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Verifying...' : 'Unlock'}
                    </button>
                </form>
            </div>
        </div>
    );
}
