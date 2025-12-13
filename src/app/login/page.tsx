'use client';

import { login } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Lock } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetRole = searchParams.get('target') || 'chief';

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await login(targetRole, password);

        if (res.success) {
            router.refresh(); // Refresh to update AuthGuard
            // Dynamic redirect based on role if no specific history, but usually router.push to original destination is handled by middleware or flow. 
            // Here we know the target mapping roughly.
            if (targetRole === 'chief') router.push('/admin');
            else if (targetRole === 'inventory') router.push('/admin/inventory');
            else if (targetRole === 'billing') router.push('/admin/billing');
            else if (targetRole === 'menu') router.push('/menu');
            else if (targetRole === 'master') router.push('/admin/settings');
            else router.push('/admin');
        } else {
            setError(res.error || "Login failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                        <Lock size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    {targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} Login
                </h2>
                <p className="text-center text-gray-500 mb-8">Please enter the password to access this section.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Access Dashboard"}
                    </button>

                    <div className="text-center mt-4">
                        <a href="/" className="text-sm text-gray-400 hover:text-gray-600">Back to Home</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
