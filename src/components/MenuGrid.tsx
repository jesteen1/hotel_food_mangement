
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Plus, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { getProducts } from '@/app/actions';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: string;
}

export default function MenuGrid({ products: initialProducts }: { products: Product[] }) {
    const { addToCart, totalItems, totalPrice } = useCart();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [category, setCategory] = useState<string>('All');

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const freshProducts = await getProducts();
                setProducts(freshProducts);
            } catch (error) {
                console.error("Failed to poll products", error);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

    const filteredProducts = category === 'All'
        ? products
        : products.filter((p) => p.category === category);

    return (
        <div className="pb-24">
            {/* Category Filter */}
            <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-sm py-4 mb-6 overflow-x-auto">
                <div className="flex space-x-2 px-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${category === cat
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product._id}
                        className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                            {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
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
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                        {product.category}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                            </div>

                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className={`text-xs font-semibold ${product.stock < 5 && product.stock > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {product.stock > 0 ? `${product.stock} left` : ''}
                                </span>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-transform active:scale-95 ${product.stock > 0
                                        ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <Link href="/cart">
                        <button className="flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                            <div className="relative">
                                <ShoppingBag size={24} />
                                <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-orange-600">
                                    {totalItems}
                                </span>
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-sm font-medium opacity-90">View Cart</span>
                                <span className="text-lg font-bold">₹{totalPrice}</span>
                            </div>
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
