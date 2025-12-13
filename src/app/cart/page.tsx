
'use client';

import { useCart } from '@/context/CartContext';
import { createOrder } from '@/app/actions';
import { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, Armchair } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
    const [seatNumber, setSeatNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seatNumber) {
            setError('Please enter your seat number');
            return;
        }
        if (cart.length === 0) return;

        setIsSubmitting(true);
        setError('');

        try {
            const items = cart.map(item => ({ productId: item.productId, quantity: item.quantity }));
            await createOrder(seatNumber, items);
            clearCart();
            // Redirect or show success
            router.push('/order-success');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="text-gray-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet.</p>
                <Link
                    href="/menu"
                    className="px-8 py-3 bg-orange-600 text-white rounded-full font-bold shadow-lg hover:bg-orange-700 transition-colors"
                >
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Order</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <ul className="divide-y divide-gray-100">
                    {cart.map((item) => (
                        <li key={item.productId} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Product Info */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                <p className="text-gray-500">₹{item.price} x {item.quantity}</p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between sm:justify-end gap-6 bg-gray-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-semibold w-6 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <span className="text-lg font-bold min-w-[3rem] text-right">₹{item.price * item.quantity}</span>

                                <button
                                    onClick={() => removeFromCart(item.productId)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="bg-gray-50 p-6 flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">₹{totalPrice}</span>
                </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Armchair className="text-orange-500" />
                    Where are you sitting?
                </h2>

                <form onSubmit={handleCreateOrder} className="space-y-6">
                    <div>
                        <label htmlFor="seat" className="sr-only">Seat Number</label>
                        <input
                            type="text"
                            id="seat"
                            placeholder="Enter Seat Number (e.g., A12)"
                            value={seatNumber}
                            onChange={(e) => setSeatNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium text-lg placeholder:text-gray-400"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            'Placing Order...'
                        ) : (
                            <>
                                Complete Order <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

function ShoppingBagIcon({ className, size }: { className?: string; size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
