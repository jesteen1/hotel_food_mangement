'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAccessCode, getProductsByShop, getShopStatus } from '@/app/actions';
import MenuGrid from '@/components/MenuGrid';
import { Lock, Utensils, AlertCircle, ChevronLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { signOut } from 'next-auth/react';

interface CustomerShopClientProps {
    shopIdentifier: string;
    tableNo?: string | null;
}

export default function CustomerShopClient({ shopIdentifier, tableNo }: CustomerShopClientProps) {
    const router = useRouter();
    const { setSeatNumber } = useCart();

    const [accessCode, setAccessCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [shopData, setShopData] = useState<{ products: any[], shopName: string, shopEmail: string, isLocationLocked: boolean, shopAddress?: string } | null>(null);
    const [shopInfo, setShopInfo] = useState<{ shopName: string, isLocationLocked: boolean, shopAddress?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tableNo) {
            console.log("Setting seat number to:", tableNo);
            setSeatNumber(tableNo);
        }
        const saved = sessionStorage.getItem(`verified_${shopIdentifier}`);

        // Always fetch basic shop info for locking status
        getShopStatus(shopIdentifier).then(info => {
            if (info) setShopInfo(info);
        });

        if (saved === 'true') {
            handleVerificationSuccess();
        }
    }, [shopIdentifier, tableNo, setSeatNumber]);

    async function handleVerificationSuccess() {
        try {
            // Log out any staff/admin session to ensure customer privacy
            await signOut({ redirect: false });

            const data = await getProductsByShop(shopIdentifier);
            setShopData(data);
            setIsVerified(true);
            sessionStorage.setItem(`verified_${shopIdentifier}`, 'true');
        } catch (err) {
            setError('Failed to load menu. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const performVerification = async (lat?: number, lng?: number) => {
            try {
                const result = await verifyAccessCode(
                    shopIdentifier,
                    accessCode.toUpperCase(),
                    lat,
                    lng
                );
                if (result.success) {
                    await handleVerificationSuccess();
                } else {
                    setError(result.error || 'Invalid code');
                }
            } catch (err) {
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        // Conditional Geolocation
        if (shopInfo?.isLocationLocked) {
            if (!navigator.geolocation) {
                setError('Geolocation is not supported by your browser.');
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    await performVerification(position.coords.latitude, position.coords.longitude);
                },
                (geoError) => {
                    console.error("Geo error:", geoError);
                    setError('Location access required. Please enable GPS to order from this shop.');
                    setLoading(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            // No lock, skip GPS
            await performVerification();
        }
    }

    if (!isVerified) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-orange-500 p-8 text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-2xl font-bold">{shopInfo?.shopName || 'Access Code Required'}</h1>
                        <p className="text-white mt-1 text-sm opacity-90">{shopInfo?.shopAddress || 'Please enter the access code provided.'}</p>
                        {shopInfo?.isLocationLocked && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/20 py-1.5 px-3 rounded-full border border-white/30 truncate">
                                <MapPin size={12} /> Proximity Verification Near-Active
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleVerify} className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                                <AlertCircle size={20} />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Verification Code</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="ENTER CODE"
                                className="w-full text-center text-2xl md:text-4xl font-extrabold tracking-[0.2em] md:tracking-[0.5em] py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-200"
                                autoFocus
                            />
                        </div>

                        <button
                            disabled={loading || accessCode.length < 3}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Unlock Menu <Utensils size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="px-8 pb-8 text-center">
                        <Link href="/customer" className="text-sm text-gray-500 hover:text-orange-600 flex items-center justify-center gap-1 transition-colors">
                            <ChevronLeft size={16} /> Back to Browse
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">{shopData?.shopName}</h1>
                            {tableNo && (
                                <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Table {tableNo}</span>
                                </div>
                            )}
                        </div>
                        {(shopData as any)?.shopAddress && (
                            <div className="flex items-center gap-1 text-gray-400 mt-1">
                                <MapPin size={12} className="text-orange-400" />
                                <p className="text-[10px] font-medium truncate max-w-[200px]">{(shopData as any).shopAddress}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem(`verified_${shopIdentifier}`);
                            setIsVerified(false);
                        }}
                        className="text-gray-400 hover:text-orange-600 p-2 rounded-lg transition-colors"
                        title="Lock Menu"
                    >
                        <Lock size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome! 👋</h2>
                    <p className="text-gray-500 mt-2 italic">Select items to add to your order at Table {tableNo || 'N/A'}</p>
                </div>

                {shopData && <MenuGrid products={shopData.products} />}
            </main>
        </div>
    );
}
