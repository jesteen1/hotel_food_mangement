
'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/app/actions';
import { RefreshCw, Check, Clock, XCircle, Search } from 'lucide-react';

interface Order {
    _id: string;
    seatNumber: string;
    items: { name: string; quantity: number; price: number }[];
    status: string;
    totalAmount: number;
    createdAt: string;
}

export default function AdminOrderList({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('All');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
        await updateOrderStatus(id, newStatus);
        fetchOrders(); // Sync
    };

    // Poll every 4 seconds for new orders
    useEffect(() => {
        const interval = setInterval(fetchOrders, 4000);
        return () => clearInterval(interval);
    }, []);

    const filteredOrders = (filter === 'All'
        ? orders
        : orders.filter(o => o.status === filter)).filter(o => o.status !== 'Paid');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex space-x-2">
                    {['All', 'Pending', 'Completed', 'Cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-black text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ${loading ? 'opacity-70' : ''}`}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        No orders found.
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col animate-in fade-in duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seat</span>
                                    <h3 className="text-2xl font-bold text-gray-900">{order.seatNumber}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex-1 space-y-3 mb-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-900 font-medium">
                                            <span className="text-gray-400 mr-2">{item.quantity}x</span>
                                            {item.name}
                                        </span>
                                        <span className="text-gray-500">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="h-px bg-gray-100 my-2"></div>
                                <div className="flex justify-between font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                    <Clock size={12} />
                                    {mounted ? new Date(order.createdAt).toLocaleTimeString() : '...'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                {order.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={16} /> Cancel
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Completed')}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 shadow-sm transition-colors"
                                        >
                                            <Check size={16} /> Complete
                                        </button>
                                    </>
                                )}
                                {order.status !== 'Pending' && (
                                    <button
                                        disabled
                                        className="col-span-2 py-2 rounded-lg bg-gray-50 text-gray-400 font-medium cursor-not-allowed border"
                                    >
                                        {order.status}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
