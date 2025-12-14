'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, LayoutDashboard, ShieldCheck, ShoppingCart, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from './Logo';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden">

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex justify-center mb-8">
                            <div className="scale-150 transform origin-center">
                                <Logo className="w-16 h-16" textClassName="text-4xl" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight">
                            Dining <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Reimagined</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            The complete digital ecosystem for modern restaurants. From smart ordering to inventory management, all in one place.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/menu" className="group flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-orange-600 rounded-full shadow-lg hover:bg-orange-700 hover:shadow-orange-500/30 transition-all transform hover:scale-105">
                                Browse Menu
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/login" className="flex items-center justify-center px-8 py-4 text-lg font-bold text-orange-700 bg-white border-2 border-orange-100 rounded-full hover:bg-orange-50 hover:border-orange-200 shadow-sm transition-all transform hover:scale-105">
                                Staff Login
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-xl text-gray-500">Powerful tools for every role in your restaurant.</p>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <FeatureCard
                            icon={<ShoppingCart className="w-8 h-8 text-blue-500" />}
                            title="Digital Table Service"
                            desc="Waiters use mobile devices to take orders specific to seat numbers. Ensures accuracy and streamlines service."
                            color="bg-blue-50"
                        />
                        <FeatureCard
                            icon={<LayoutDashboard className="w-8 h-8 text-indigo-500" />}
                            title="Admin Dashboard"
                            desc="Get a bird's eye view of your business. Manage orders, track status, and oversee operations."
                            color="bg-indigo-50"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-green-500" />}
                            title="Smart Inventory"
                            desc="Stock auto-deducts with every order. 'Out of Stock' items vanish from the menu automatically."
                            color="bg-green-50"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-orange-500" />}
                            title="Secure Role Access"
                            desc="Dedicated logins for Chef, Waiter, and Manager. Passwords managed securely by the Owner."
                            color="bg-orange-50"
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-purple-500" />}
                            title="Role Management"
                            desc="Granular permissions. Detailed audit logs. Ensure the right people have the right access."
                            color="bg-purple-50"
                        />
                        <FeatureCard
                            icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
                            title="Danger Zone Protection"
                            desc="Sensitive actions like account deletion are protected by high-security Email OTP verification."
                            color="bg-red-50"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Role Explanation */}
            <section className="py-20 bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Designed for Roles</h2>
                            <div className="space-y-4">
                                <RoleItem
                                    title="The Owner"
                                    desc="Full Control. Login via OTP. Manage Settings, Prices & Staff Passwords."
                                    color="bg-orange-100 text-orange-800"
                                />
                                <RoleItem
                                    title="The Chef"
                                    desc="View 'Kitchen Display System'. Mark orders as 'Cooking' or 'Ready'."
                                    color="bg-gray-100 text-gray-800"
                                />
                                <RoleItem
                                    title="The Waiter"
                                    desc="Select Seat. Take Order. Send to Kitchen. Fast & Accurate."
                                    color="bg-blue-100 text-blue-800"
                                />
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="relative w-full max-w-sm aspect-square bg-gradient-to-tr from-orange-100 to-orange-200 rounded-full flex items-center justify-center p-8">
                                <div className="text-center space-y-2">
                                    <div className="p-4 bg-white shadow-lg rounded-2xl inline-block mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="font-bold text-gray-700">System Online</span>
                                        </div>
                                    </div>
                                    <p className="text-orange-900/60 font-medium">Ready for Service</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to modernize your restaurant?</h2>
                    <Link href="/login" className="inline-block px-10 py-5 bg-orange-600 text-white font-bold text-xl rounded-full hover:bg-orange-500 transition-colors shadow-lg hover:shadow-orange-500/50">
                        Get Started Now
                    </Link>
                </div>
            </section>

        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <motion.div
            variants={fadeInUp}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow duration-300"
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${color}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function RoleItem({ title, desc, color }: { title: string, desc: string, color: string }) {
    return (
        <div className="flex items-start gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-1 ${color}`}>
                {title}
            </span>
            <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{desc}</p>
        </div>
    );
}
