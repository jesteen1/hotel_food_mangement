'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LayoutDashboard, Coffee, Box, Menu as MenuIcon, X, Receipt, Shield } from 'lucide-react';
import { useState } from 'react';
import LogoutButton from './LogoutButton';

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const links = [
        { href: '/menu', label: 'Menu', icon: Coffee },
        { href: '/cart', label: 'Cart', icon: ShoppingCart },
        { href: '/admin/kitchen', label: 'Chief', icon: LayoutDashboard },
        { href: '/admin/inventory', label: 'Inventory', icon: Box },
        { href: '/admin/billing', label: 'Billing', icon: Receipt },
        { href: '/admin/settings', label: 'Admin', icon: Shield },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                                FoodBook App
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
                        <div className="pl-2 border-l border-gray-200 ml-2">
                            <LogoutButton />
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden bg-white">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                        >
                            <MenuIcon size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />
            <div
                className={`fixed top-0 left-0 bottom-0 w-[75%] max-w-sm z-[70] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}

            >
                <div className="p-6 flex flex-col h-full bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                            FoodBook App
                        </span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-2 flex-1 bg-white">
                        {links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all ${isActive(link.href)
                                        ? 'bg-orange-50 text-orange-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <LogoutButton />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 bg-white">
                        <p className="text-xs text-center text-gray-400">
                            © 2025 FoodBook App
                        </p>
                    </div>
                </div>
            </div>
        </nav >
    );
}
