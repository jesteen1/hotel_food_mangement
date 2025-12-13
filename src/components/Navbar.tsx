
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LayoutDashboard, Coffee, Box, Menu as MenuIcon, X, Receipt, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const links = [
        { href: '/menu', label: 'Menu', icon: Coffee },
        { href: '/cart', label: 'Cart', icon: ShoppingCart },
        { href: '/admin', label: 'Chief', icon: LayoutDashboard },
        { href: '/admin/inventory', label: 'Inventory', icon: Box },
        { href: '/admin/billing', label: 'Billing', icon: Receipt },
        { href: '/admin/settings', label: 'Admin', icon: Shield },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                                FoodBook
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.href)
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                        >
                            {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden animate-in slide-in-from-top-5 duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200 shadow-lg">
                        {links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-2 block px-3 py-2 rounded-md text-base font-medium ${isActive(link.href)
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
