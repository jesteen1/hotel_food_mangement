import { getOrders, getProducts } from '@/app/actions';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { ChefHat, Receipt, Box, Settings as SettingsIcon } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminHub() {
    const session = await getServerSession(authOptions);
    return (
        <AuthGuard role="master">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Headquarters</h1>
                    <p className="text-gray-500 mt-2">Welcome, <span className="font-bold text-orange-600">{session?.user?.email}</span>. Manage your venue from here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard
                        title="Kitchen / Chief"
                        description="View active orders and manage stock"
                        icon={ChefHat}
                        href="/admin/kitchen"
                        color="bg-orange-100 text-orange-600"
                    />
                    <DashboardCard
                        title="Billing"
                        description="Manage bills and payments"
                        icon={Receipt}
                        href="/admin/billing"
                        color="bg-green-100 text-green-600"
                    />
                    <DashboardCard
                        title="Inventory"
                        description="Add or edit menu items"
                        icon={Box}
                        href="/admin/inventory"
                        color="bg-blue-100 text-blue-600"
                    />
                    <DashboardCard
                        title="Settings"
                        description="Manage passwords and account"
                        icon={SettingsIcon}
                        href="/admin/settings"
                        color="bg-gray-100 text-gray-600"
                    />
                </div>

                <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
                    <p className="text-gray-500">Select a module above to get started.</p>
                </div>
            </div>
        </AuthGuard>
    );
}

function DashboardCard({ title, description, icon: Icon, href, color }: any) {
    return (
        <Link href={href} className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </Link>
    );
}
