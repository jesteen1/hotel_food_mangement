'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getAccessCode, updateAccessCode } from '@/app/actions';
import { QrCode, RefreshCw, Printer, Download, Plus, Minus, Info, ChevronLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function QRGeneratorClient() {
    const { data: session } = useSession();
    const [accessCode, setAccessCode] = useState('');
    const [tableCount, setTableCount] = useState(1);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [hasSetTables, setHasSetTables] = useState(false);

    const [shopSlug, setShopSlug] = useState('');

    const [allCodes, setAllCodes] = useState<string[]>([]);

    useEffect(() => {
        async function fetchCode() {
            try {
                const res = await getAccessCode();
                if (res) {
                    setAccessCode(res.accessCode);
                    setAllCodes(res.allCodes || []);
                    setShopSlug(res.slug);
                }
            } catch (err) {
                console.error("Failed to fetch access code", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCode();
    }, []);

    const handleRandomize = async () => {
        setUpdating(true);
        try {
            const res = await updateAccessCode();
            if (res.success && res.accessCode) {
                setAccessCode(res.accessCode);
                setAllCodes(prev => [...prev, res.accessCode]);
            }
        } catch (err) {
            console.error("Failed to randomize code", err);
        } finally {
            setUpdating(false);
        }
    };

    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, []);

    // Use Slug if available, fallback to identifier
    const shopIdentifier = shopSlug || session?.user?.email || '';
    const shopUrl = (shopIdentifier && baseUrl)
        ? `${baseUrl}/customer/${shopIdentifier}`
        : '';

    if (loading) {
        return <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading settings...</p>
        </div>;
    }

    if (!hasSetTables) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <QrCode size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code Setup</h1>
                <p className="text-gray-500 mb-8 text-lg">Before creating QR codes, please specify how many tables you have.</p>

                <div className="flex items-center justify-between text-2xl font-bold bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-8">
                    <button
                        onClick={() => setTableCount(Math.max(1, tableCount - 1))}
                        className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-orange-600 transition-colors"
                    >
                        <Minus size={24} />
                    </button>
                    <span className="w-20 text-center text-4xl">{tableCount}</span>
                    <button
                        onClick={() => setTableCount(tableCount + 1)}
                        className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-orange-600 transition-colors"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <button
                    onClick={() => setHasSetTables(true)}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                >
                    Generate QR Codes
                </button>
            </div>
        );
    }

    const downloadQR = (id: string, filename: string, label?: string) => {
        const svg = document.getElementById(id);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = 1200;
            canvas.height = 1600; // Taller for label
            if (ctx) {
                // Background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Border
                ctx.strokeStyle = '#f97316'; // Orange-500
                ctx.lineWidth = 40;
                ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

                // Draw QR Code
                ctx.drawImage(img, 100, 300, 1000, 1000);

                // Add Text
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';

                // Shop Name / Label
                if (label) {
                    ctx.font = 'bold 100px Arial';
                    ctx.fillText(label.toUpperCase(), canvas.width / 2, 200);
                }

                // Table Number / Sublabel
                ctx.font = '60px Arial';
                ctx.fillStyle = '#6b7280'; // Gray-500
                ctx.fillText(shopUrl, canvas.width / 2, 1450);

                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `${filename}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 print:p-0 print:max-w-none print:bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => setHasSetTables(false)} className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            QR Generator
                        </h1>
                        <p className="text-gray-500 mt-1">Management for {tableCount} tables</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:w-full">
                <div className="lg:col-span-1 space-y-6 no-print">
                    <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Info size={20} className="text-blue-500" /> Shop Security
                        </h2>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Current Access Code</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-50 text-3xl font-black tracking-widest px-6 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-center text-orange-600">
                                    {accessCode}
                                </div>
                                <button
                                    onClick={handleRandomize}
                                    disabled={updating}
                                    className="p-4 bg-orange-100 text-orange-600 rounded-2xl hover:bg-orange-600 hover:text-white transition-all active:scale-90"
                                    title="Randomize Code"
                                >
                                    <RefreshCw size={24} className={updating ? 'animate-spin' : ''} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 italic text-center">Customers must enter the active code above to view your menu.</p>
                        </div>
                    </section>

                    <button
                        onClick={() => window.print()}
                        className="w-full py-5 bg-black text-white rounded-3xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                        <Printer size={24} /> Print All Codes
                    </button>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 print-container">
                    {shopUrl && (
                        <div className="bg-white p-8 rounded-3xl border-2 border-orange-500 shadow-xl flex flex-col items-center qr-card">
                            <div className="text-center mb-6 no-print">
                                <span className="text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full">Main Shop URL</span>
                                <h3 className="text-2xl font-black mt-4">WELCOME</h3>
                            </div>

                            {/* PRINT-ONLY HEADER */}
                            <div className="hidden print:block text-center mb-4">
                                <div className="text-sm font-black text-orange-600 tracking-tighter mb-1">FOODBOOK APP</div>
                                <div className="text-2xl font-black">WELCOME</div>
                                <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Scan to View Menu</div>
                            </div>

                            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center p-4 mb-6 border border-gray-100 print:border-none print:p-0">
                                <QRCodeSVG id="qr-main" value={shopUrl} size={280} level="H" includeMargin />
                            </div>

                            <div className="w-full flex items-center justify-between no-print">
                                <p className="text-[10px] text-gray-400 truncate px-2 flex-1">{shopUrl}</p>
                                <button
                                    onClick={() => downloadQR('qr-main', 'shop-welcome-qr', 'Welcome')}
                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                >
                                    <Download size={20} />
                                </button>
                            </div>

                            {/* PRINT-ONLY FOOTER */}
                            <div className="hidden print:block text-center mt-2">
                                <p className="text-[9px] font-mono text-gray-400">{shopUrl}</p>
                            </div>
                        </div>
                    )}

                    {shopUrl && Array.from({ length: tableCount }).map((_, i) => {
                        const tableNo = i + 1;
                        const tableUrl = `${shopUrl}/${tableNo}`;
                        const qrId = `qr-table-${tableNo}`;
                        return (
                            <div key={tableNo} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md hover:border-orange-200 transition-colors qr-card shadow-gray-200/40 flex flex-col items-center">
                                <div className="text-center mb-6 no-print">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full">Specific Seat</span>
                                    <h3 className="text-2xl font-black mt-4">TABLE #{tableNo}</h3>
                                </div>

                                {/* PRINT-ONLY HEADER */}
                                <div className="hidden print:block text-center mb-4">
                                    <div className="text-sm font-black text-orange-600 tracking-tighter mb-1">FOODBOOK APP</div>
                                    <div className="text-2xl font-black">TABLE {tableNo}</div>
                                    <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Scan to Order Food</div>
                                </div>

                                <div className="aspect-square bg-white rounded-2xl flex items-center justify-center p-4 border border-gray-100 print:border-none print:p-0">
                                    <QRCodeSVG id={qrId} value={tableUrl} size={260} level="H" includeMargin />
                                </div>

                                <div className="w-full mt-6 flex items-center justify-between no-print">
                                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{tableUrl}</span>
                                    <button
                                        onClick={() => downloadQR(qrId, `table-${tableNo}-qr`, `Table #${tableNo}`)}
                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>

                                {/* PRINT-ONLY FOOTER */}
                                <div className="hidden print:block text-center mt-4">
                                    <p className="text-[9px] font-mono text-gray-400">{tableUrl}</p>
                                    <div className="mt-4 border-t border-gray-100 pt-2 text-[8px] text-gray-300">Cut along the dotted line</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0.5cm;
                        size: A4 portrait;
                    }
                    .no-print { display: none !important; }
                    html, body, main, #__next { 
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        min-height: 0 !important;
                        display: block !important;
                        visibility: visible !important;
                        color: black !important;
                        color-scheme: light !important;
                    }
                    nav { display: none !important; }
                    .print-container {
                        display: block !important;
                        width: 100% !important;
                    }
                    .qr-card {
                        display: inline-block !important;
                        width: 44% !important;
                        height: 12cm !important;
                        margin: 2% !important;
                        border: 1px dashed #e5e7eb !important; /* Lighter dashed border for cutting */
                        padding: 1.5cm 1cm !important;
                        page-break-inside: avoid !important;
                        text-align: center !important;
                        background: white !important;
                        visibility: visible !important;
                        color: black !important;
                        position: relative !important;
                        vertical-align: top !important;
                        box-sizing: border-box !important;
                        border-radius: 0 !important; /* Straight edges for cutting */
                        box-shadow: none !important;
                    }
                    .qr-card svg {
                        width: 100% !important;
                        height: auto !important;
                        display: block !important;
                        margin: 0 auto !important;
                    }

                }
            `}</style>
        </div>
    );
}
