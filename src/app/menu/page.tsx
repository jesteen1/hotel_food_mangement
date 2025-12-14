import { getProducts } from '@/app/actions';
import MenuGrid from '@/components/MenuGrid';
import AuthGuard from '@/components/AuthGuard';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data especially for stock

export default async function MenuPage() {
    const products = await getProducts();

    return (
        <AuthGuard role="menu" requirePassword={true}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
                    <p className="text-gray-500 mt-2">Choose from our delicious selection</p>
                </div>
                <MenuGrid products={products} />
            </div>
        </AuthGuard>
    );
}
