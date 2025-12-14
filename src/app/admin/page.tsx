import { getOrders, getProducts } from '@/app/actions';
import AdminOrderList from '@/components/AdminOrderList';
import AuthGuard from '@/components/AuthGuard';
import ChefStockGrid from '@/components/ChefStockGrid';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const orders = await getOrders();
    const products = await getProducts();

    return (
        <AuthGuard role="chief">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Chief Dashboard</h1>
                    <p className="text-gray-500 mt-2">Manage kitchen orders and status.</p>
                </div>
                <AdminOrderList initialOrders={orders} />

                <hr className="my-12 border-gray-200" />

                <ChefStockGrid products={products} />
            </div>
        </AuthGuard>
    );
}
