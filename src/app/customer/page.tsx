'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listHotels } from '@/app/actions';
import { Utensils, Search, ChevronRight } from 'lucide-react';

export default function CustomerExplore() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHotels() {
            try {
                const data = await listHotels();
                setHotels(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchHotels();
    }, []);

    const filteredHotels = hotels.filter(hotel =>
        hotel.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 py-6 px-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                            <Utensils size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">FoodNote <span className="text-orange-600">Browse</span></h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4 italic">Hungry? Find your spot.</h2>
                    <p className="text-gray-500 text-lg">Select a hotel to view their digital menu and order fresh.</p>
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a hotel or shop name..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none shadow-sm text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredHotels.length > 0 ? (
                            filteredHotels.map(hotel => (
                                <Link
                                    key={hotel.email}
                                    href={`/customer/${hotel.email}`}
                                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center justify-between"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {hotel.companyName || "Unnamed Hotel"}
                                        </h3>
                                        <p className="text-sm text-gray-400">{hotel.email}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-gray-400 text-lg">No hotels found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="py-8 text-center text-gray-400 text-sm">
                <p>&copy; 2024 FoodNote - Digital Menu System</p>
            </footer>
        </div>
    );
}
