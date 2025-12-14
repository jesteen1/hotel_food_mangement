'use client';

import { useState } from 'react';
import AdminOrderList from '@/components/AdminOrderList';
import ChefStockGrid from '@/components/ChefStockGrid';
import { LayoutDashboard, Box } from 'lucide-react';

interface Order {
    _id: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    status: string;
    createdAt: string;
    seatNumber: string;
}

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    description?: string;
    image?: string;
}

export default function AdminDashboardClient({ initialOrders, products }: { initialOrders: Order[], products: Product[] }) {
    const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Chief Dashboard</h1>
                <p className="text-gray-500 mt-2">Manage kitchen orders and status.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8 w-fit">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'orders'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                >
                    <LayoutDashboard size={18} />
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'stock'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                >
                    <Box size={18} />
                    Quick Stock
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === 'orders' ? (
                    <AdminOrderList initialOrders={initialOrders} />
                ) : (
                    <ChefStockGrid products={products} />
                )}
            </div>
        </div>
    );
}
