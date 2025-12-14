import { getProducts } from '@/app/actions';
import InventoryManager from '@/components/InventoryManager';
import AuthGuard from '@/components/AuthGuard';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const products = await getProducts();

    return (
        <AuthGuard role="inventory" requirePassword={true}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500 mt-2">Update stock levels and manage products.</p>
                </div>
                <InventoryManager products={products} />
            </div>
        </AuthGuard>
    );
}
