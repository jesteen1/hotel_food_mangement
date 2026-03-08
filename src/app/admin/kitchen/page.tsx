import { getOrders, getProducts } from '@/app/actions';
import AuthGuard from '@/components/AuthGuard';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const orders = await getOrders();
    const products = await getProducts();

    return (
        <AuthGuard role="chief" requirePassword={true}>
            <AdminDashboardClient initialOrders={orders} products={products} />
        </AuthGuard>
    );
}
