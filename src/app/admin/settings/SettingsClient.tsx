'use client';

import { getAuthSettings, updatePassword } from "@/app/actions";
import { useState, useEffect } from "react";
import { Key, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [passwords, setPasswords] = useState<Record<string, string>>({});

    useEffect(() => {
        getAuthSettings().then((data: any) => {
            if (data) {
                // data is now { chief: '...', ... }
                setRoles(Object.keys(data).filter(r => r !== 'master'));
                setPasswords(data); // Populate inputs with actual passwords
                setLoading(false);
            }
        });
    }, []);

    const handleUpdate = async (role: string) => {
        if (!passwords[role]) return;
        setUpdating(role);

        const res = await updatePassword(role, passwords[role]);

        if (res.success) {
            alert(`Password for ${role} updated successfully`);
            setPasswords(prev => ({ ...prev, [role]: '' })); // Clear input
        } else {
            alert(`Failed: ${res.error}`);
        }
        setUpdating(null);
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Key className="text-orange-600" />
                Security Settings
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Manage Passwords</h2>
                    <p className="text-gray-500 text-sm">Update login credentials for different roles.</p>
                </div>

                <div className="divide-y divide-gray-100">
                    {roles.map(role => (
                        <div key={role} className="p-6 flex items-center justify-between gap-4 flex-wrap">
                            <div className="w-32">
                                <span className="font-medium text-gray-900 capitalize">{role}</span>
                            </div>

                            <div className="flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Enter new password"
                                    value={passwords[role] || ''}
                                    onChange={(e) => setPasswords({ ...passwords, [role]: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                />
                            </div>

                            <button
                                onClick={() => handleUpdate(role)}
                                disabled={!passwords[role] || updating === role}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updating === role ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Update
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                You are logged in as Master Admin.
            </div>
        </div>
    );
}
