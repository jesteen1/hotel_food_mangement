'use client';

import { useState, useEffect } from 'react';
import { getBill, closeBill, getOrders } from '@/app/actions';
import { Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
    const [activeSeats, setActiveSeats] = useState<string[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [billData, setBillData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Fetch active seats (seats with 'Completed' orders)
    useEffect(() => {
        loadActiveSeats();
        const interval = setInterval(loadActiveSeats, 4000);
        return () => clearInterval(interval);
    }, []);

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
        setLoading(true);
        const data = await getBill(seat);
        setBillData(data);
        setLoading(false);
    };

    const [closing, setClosing] = useState(false);

    const handleCloseBill = async () => {
        if (!selectedSeat) return;
        setClosing(true);
        // confirm removed for debugging responsiveness
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

    return (
        <div className="p-6 max-w-6xl mx-auto">
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
                        <div className="bg-white p-8 rounded-xl shadow-md border">
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {billData.items.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-3">{item.name}</td>
                                            <td className="text-center p-3 text-gray-600">x{item.quantity}</td>
                                            <td className="text-right p-3">₹{item.price}</td>
                                            <td className="text-right p-3 font-medium">₹{item.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

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
