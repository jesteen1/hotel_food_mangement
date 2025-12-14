import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function PasswordWarning() {
    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 shadow-sm mx-4 sm:mx-6 lg:mx-8 mt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-amber-700">
                            <span className="font-bold">Security Alert:</span> You haven't set a login password yet.
                            Please set one to secure your account.
                        </p>
                    </div>
                </div>
                <div className="ml-4 shrink-0 flex">
                    <Link
                        href="/admin/settings"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                    >
                        Set Password
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
