'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCompanyName } from '@/app/actions';

export default function OnboardingPage() {
    const [companyName, setCompanyName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await updateCompanyName(companyName);
            if (result.success) {
                router.push('/admin'); // Redirect to dashboard
            } else {
                alert("Failed to update company name");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Welcome to FoodBook App</h1>
                <p className="text-gray-500 mb-8 text-center">Please enter your company name to get started.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            id="company"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            placeholder="e.g. My Dosa Corner"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Saving...' : 'Get Started'}
                    </button>
                </form>
            </div>
        </div>
    );
}
