'use client';

import { useState, useEffect } from 'react';
import { getBill, closeBill, getOrders, removeItemFromBill, addItemToBill, getProducts } from '@/app/actions';
import { Printer, CheckCircle, ArrowLeft, Trash2, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
    const [activeSeats, setActiveSeats] = useState<string[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [billData, setBillData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Fetch active seats (seats with 'Completed' orders)
    useEffect(() => {
        loadActiveSeats();
        loadProducts();
        const interval = setInterval(loadActiveSeats, 4000);
        return () => clearInterval(interval);
    }, []);

    const loadProducts = async () => {
        const products = await getProducts();
        setAllProducts(products);
    };

    const loadActiveSeats = async () => {
        try {
            const orders = await getOrders();
            // Filter orders that are 'Completed' and get unique seat numbers
            const seats = Array.from(new Set(
                orders.filter((o: any) => o.status === 'Completed').map((o: any) => o.seatNumber)
            )) as string[];
            setActiveSeats(seats);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectSeat = async (seat: string) => {
        setSelectedSeat(seat);
        refreshBill(seat);
    };

    const refreshBill = async (seat: string) => {
        setLoading(true);
        const data = await getBill(seat);
        setBillData(data);
        setLoading(false);
    };

    const [closing, setClosing] = useState(false);

    const handleCloseBill = async () => {
        if (!selectedSeat) return;
        setClosing(true);
        try {
            const result = await closeBill(selectedSeat);
            if (result.success) {
                alert("Bill closed successfully!");
                setSelectedSeat(null);
                setBillData(null);
                loadActiveSeats();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (e) {
            alert("Unexpected error.");
        } finally {
            setClosing(false);
        }
    };

    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const confirmRemoveItem = async () => {
        if (!selectedSeat || !itemToDelete) return;
        const result = await removeItemFromBill(selectedSeat, itemToDelete);
        if (result.success) {
            refreshBill(selectedSeat);
            setItemToDelete(null);
        } else {
            alert("Failed to remove item");
        }
    };

    const handleAddItem = async (productId: string) => {
        if (!selectedSeat) return;
        const result = await addItemToBill(selectedSeat, productId);
        if (result.success) {
            refreshBill(selectedSeat);
            setIsAddModalOpen(false);
        } else {
            alert(result.error || "Failed to add item");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Item?</h3>
                        <p className="text-gray-500 mb-6">Are you sure you want to remove <span className="font-bold text-gray-900">{itemToDelete}</span> from the bill?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveItem}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold">Billing Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Seat List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                    <h2 className="font-bold text-xl mb-4">Active Seats</h2>
                    {activeSeats.length === 0 ? (
                        <p className="text-gray-500">No active bills (Completed orders).</p>
                    ) : (
                        <div className="space-y-2">
                            {activeSeats.map(seat => (
                                <button
                                    key={seat}
                                    onClick={() => handleSelectSeat(seat)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedSeat === seat
                                        ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    Seat {seat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bill Details */}
                <div className="md:col-span-2">
                    {selectedSeat && billData ? (
                        <div className="bg-white p-8 rounded-xl shadow-md border relative">
                            <div className="flex justify-between items-start mb-6 border-b pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Bill for Seat {selectedSeat}</h2>
                                    <p className="text-gray-500">Total Orders: {billData.ordersCount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <table className="w-full mb-8">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3">Item</th>
                                        <th className="text-center p-3">Qty</th>
                                        <th className="text-right p-3">Price</th>
                                        <th className="text-right p-3">Total</th>
                                        <th className="text-right p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {billData.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="group">
                                            <td className="p-3">{item.name}</td>
                                            <td className="text-center p-3 text-gray-600">x{item.quantity}</td>
                                            <td className="text-right p-3">₹{item.price}</td>
                                            <td className="text-right p-3 font-medium">₹{item.total}</td>
                                            <td className="text-right p-3">
                                                <button
                                                    onClick={() => setItemToDelete(item.name)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t-2 border-dashed border-gray-200">
                                <div className="text-3xl font-bold">Total:</div>
                                <div className="text-3xl font-bold text-orange-600">₹{billData.grandTotal}</div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 flex justify-center items-center gap-2 py-3 bg-gray-100 font-bold rounded-lg hover:bg-gray-200"
                                >
                                    <Printer size={20} /> Print Bill
                                </button>
                                <button
                                    onClick={handleCloseBill}
                                    disabled={closing}
                                    className={`flex-1 flex justify-center items-center gap-2 py-3 text-white font-bold rounded-lg transition-colors ${closing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {closing ? (
                                        <span>Processing...</span>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} /> Close & Paid
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Add Item Modal */}
                            {isAddModalOpen && (
                                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-center p-6 border-b">
                                            <h3 className="text-xl font-bold">Add Item to Bill</h3>
                                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                            {allProducts.map(product => (
                                                <button
                                                    key={product._id}
                                                    onClick={() => handleAddItem(product._id)}
                                                    className="w-full flex justify-between items-center p-4 hover:bg-orange-50 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors group"
                                                >
                                                    <span className="font-medium text-lg">{product.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-500 font-medium">₹{product.price}</span>
                                                        <div className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full">
                                                            <Plus size={18} />
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : loading ? (
                        <div className="text-center py-12 text-gray-500">Loading bill data...</div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                            Select a seat to view the bill
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
