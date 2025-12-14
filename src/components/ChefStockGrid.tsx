'use client';

import { useState } from 'react';
import { updateProductStock } from '@/app/actions';
import { Search, UtensilsCrossed } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    description?: string;
    image?: string;
}

export default function ChefStockGrid({ products: initialProducts }: { products: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');

    const handleStockUpdate = async (id: string, newStock: number) => {
        // Optimistic update
        setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: newStock } : p));
        await updateProductStock(id, newStock);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Stock Management</h2>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product._id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                            {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    No Image
                                </div>
                            )}
                            {product.stock <= 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="flex items-center gap-2 text-white font-bold px-4 py-2 bg-red-500/80 rounded-full">
                                        <UtensilsCrossed size={18} />
                                        Out of Stock
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                            </div>

                            <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 mb-4">{product.category}</span>

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    onClick={() => handleStockUpdate(product._id, product.stock > 0 ? 0 : 20)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${product.stock > 0
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                >
                                    {product.stock > 0 ? 'Mark Out of Stock' : 'Restock (20)'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
