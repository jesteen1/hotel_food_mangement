'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateHotelProfile } from '@/app/actions';
import { MapPin, Globe, Building2, Navigation } from 'lucide-react';

export default function OnboardingPage() {
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const router = useRouter();

    const getGeoLocation = () => {
        setGeoLoading(true);
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setGeoLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setGeoLoading(false);
        }, (error) => {
            console.error("Geo error:", error);
            alert("Failed to get location. Please ensure you are at the hotel.");
            setGeoLoading(false);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location) {
            alert("Please detect your hotel location first.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateHotelProfile({
                companyName,
                address,
                lat: location.lat,
                lng: location.lng
            });
            if (result.success) {
                router.push('/admin');
            } else {
                alert("Onboarding failed. Please try again.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-xl p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Building2 size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Setup Your Hotel</h1>
                    <p className="text-gray-500 text-lg">You must be at the hotel location to register.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 border-l-4 border-orange-500 pl-3 uppercase tracking-widest mb-3">Hotel Information</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all text-lg font-medium"
                                placeholder="Hotel/Shop Name"
                                required
                            />
                        </div>

                        <div>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all text-lg font-medium min-h-[100px]"
                                placeholder="Full Postal Address"
                                required
                            />
                        </div>

                        <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-3 text-orange-700 font-bold">
                                <Navigation size={24} className="animate-pulse" />
                                <span>Geolocation Verification</span>
                            </div>

                            {location ? (
                                <div className="text-center space-y-2">
                                    <div className="px-4 py-2 bg-white rounded-full text-green-600 font-mono text-sm border border-green-100 shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Location Captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={getGeoLocation}
                                        className="text-orange-600 text-sm font-bold hover:underline"
                                    >
                                        Retake Location
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={getGeoLocation}
                                    disabled={geoLoading}
                                    className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-sm border border-orange-200 hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2"
                                >
                                    {geoLoading ? 'Detecting...' : 'Detect Hotel Location'} <MapPin size={20} />
                                </button>
                            )}
                            <p className="text-xs text-orange-400 text-center italic">Customers can verify you are at this location.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !location}
                        className="w-full py-5 bg-black text-white rounded-3xl font-black text-xl hover:bg-gray-800 disabled:bg-gray-200 transition-all shadow-xl shadow-gray-200/50"
                    >
                        {isSubmitting ? 'Verifying & Saving...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
}
