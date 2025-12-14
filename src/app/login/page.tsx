'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp } from '@/app/actions';
import { AlertTriangle, X } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState<{ message: string; type: 'error' | 'success'; action?: { label: string, onClick: () => void } } | null>(null);
    const router = useRouter();

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (result?.error) {
                if (result.error === 'PasswordNotSet') {
                    setErrorPopup({
                        message: "You have not set a login password. Please use OTP to login, then set a password in Settings.",
                        type: 'error',
                        action: {
                            label: "Switch to OTP",
                            onClick: () => { setLoginMethod('otp'); setErrorPopup(null); }
                        }
                    });
                } else if (result.error === 'InvalidPassword') {
                    setErrorPopup({ message: "Incorrect password.", type: 'error' });
                } else if (result.error === 'UserNotFound') {
                    setErrorPopup({ message: "User not found.", type: 'error' });
                } else {
                    setErrorPopup({ message: "Authentication failed", type: 'error' });
                }
            } else if (result?.ok) {
                router.push('/admin');
            }
        } catch (error) {
            console.error(error);
            setErrorPopup({ message: "An unexpected error occurred", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const { data: session } = useSession();
    useEffect(() => {
        if (session) {
            router.replace('/admin');
        }
    }, [session, router]);

    // Effect for handling URL errors
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');

        // Restore Auth Mode from Cookie (for persistence across redirects)
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };

        const savedIntent = getCookie('auth_intent') as 'login' | 'signup' | undefined;
        if (savedIntent && (savedIntent === 'login' || savedIntent === 'signup')) {
            setAuthMode(savedIntent);
        }

        if (error === 'AccessDenied') {
            const isSignup = savedIntent === 'signup';
            setErrorPopup({
                message: isSignup
                    ? "Sign Up failed. Account may already exist or is not a Gmail account."
                    : "Sign In failed. Account may not exist or is not a Gmail account.",
                type: 'error',
                action: isSignup ? {
                    label: "Go to Sign In",
                    onClick: () => {
                        setAuthMode('login');
                        setErrorPopup(null);
                    }
                } : {
                    label: "Go to Sign Up",
                    onClick: () => {
                        setAuthMode('signup');
                        setErrorPopup(null);
                    }
                }
            });
            // Clean URL
            window.history.replaceState({}, '', '/login');
        }
    }, []);



    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // if (!email.endsWith('@gmail.com')) {
            //     setErrorPopup({ message: "This app only supports Gmail accounts (@gmail.com).", type: 'error' });
            //     setLoading(false);
            //     return;
            // }

            const result = await sendOtp(email, authMode);

            if (result.success) {
                setShowOtpInput(true);
                if (result.mode === 'dev') {
                    setErrorPopup({ message: `Development Mode: Your code is ${result.otp}`, type: 'success' });
                } else {
                    setErrorPopup({ message: `Verification code sent to ${email}.`, type: 'success' });
                }
            } else {
                // Handle Specific Errors
                if (result.error === 'UserNotFound') {
                    setErrorPopup({
                        message: "Account not found. Please Sign Up to continue.",
                        type: 'error',
                        action: {
                            label: "Go to Sign Up",
                            onClick: () => {
                                setAuthMode('signup');
                                setErrorPopup(null);
                            }
                        }
                    });
                } else if (result.error === 'UserExists') {
                    setErrorPopup({
                        message: "Account already exists. Please Sign In.",
                        type: 'error',
                        action: {
                            label: "Go to Sign In",
                            onClick: () => {
                                setAuthMode('login');
                                setErrorPopup(null);
                            }
                        }
                    });
                } else {
                    setErrorPopup({ message: result.error || "Failed to send code.", type: 'error' });
                }
            }
        } catch (error) {
            console.error(error);
            setErrorPopup({ message: "An error occurred", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                otp,
                companyName: authMode === 'signup' ? companyName : undefined,
                redirect: false,
            });

            if (result?.error) {
                setErrorPopup({ message: "Invalid OTP. Please try again.", type: 'error' });
                setOtp('');
            } else if (result?.ok) {
                router.push('/admin'); // Redirect to Admin Hub
            }
        } catch (error) {
            console.error(error);
            setErrorPopup({ message: "Authentication failed", type: 'error' });
        } finally {
            setLoading(false);
        }

        // No need for error handling here as redirect:true handles it (or redirects to error page)
        // We rely on NextAuth to handle the flow + cookies
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-orange-50 to-red-100">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
                <div className="mb-8 flex justify-center">
                    <Logo className="w-12 h-12" textClassName="text-3xl" />
                </div>

                {/* Mode Toggles */}
                <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                    <button
                        onClick={() => { setAuthMode('login'); setShowOtpInput(false); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setAuthMode('signup'); setShowOtpInput(false); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'signup' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <h1 className="text-2xl font-bold mb-2">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-gray-500 mb-6">
                    {authMode === 'login' ? 'Sign in to manage your venue.' : 'Join FoodBook App to manage your venue.'}
                </p>

                {/* Google Sign In */}
                <button
                    onClick={() => signIn('google')}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors mb-6 font-medium"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Method Toggle */}
                    {authMode === 'login' && !showOtpInput && (
                        <div className="flex justify-center gap-4 text-sm font-medium text-gray-500 mb-2">
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('otp'); setPassword(''); }}
                                className={`pb-1 border-b-2 transition-colors ${loginMethod === 'otp' ? 'text-orange-600 border-orange-600' : 'border-transparent hover:text-gray-700'}`}
                            >
                                Login with OTP
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('password'); setOtp(''); }}
                                className={`pb-1 border-b-2 transition-colors ${loginMethod === 'password' ? 'text-orange-600 border-orange-600' : 'border-transparent hover:text-gray-700'}`}
                            >
                                Login with Password
                            </button>
                        </div>
                    )}

                    {/* Login Form */}
                    {!showOtpInput ? (
                        <form onSubmit={loginMethod === 'otp' || authMode === 'signup' ? handleSendOtp : handlePasswordLogin} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                required
                            />

                            {/* Password Input */}
                            {authMode === 'login' && loginMethod === 'password' && (
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    required
                                />
                            )}

                            {authMode === 'signup' && (
                                <input
                                    type="text"
                                    placeholder="Company Name (e.g. My Restaurant)"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    required
                                />
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                            >
                                {loading ? 'Processing...' : (
                                    authMode === 'signup' ? 'Send Verification Code' :
                                        loginMethod === 'password' ? 'Login' : 'Send Login Code'
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="text-sm text-gray-600 mb-2">
                                Code sent to <strong>{email}</strong>
                                <button
                                    type="button"
                                    onClick={() => setShowOtpInput(false)}
                                    className="ml-2 text-orange-600 underline text-xs"
                                >
                                    Change
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-center tracking-widest text-lg"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            >
                                {loading ? 'Verifying...' : (authMode === 'login' ? 'Verify & Login' : 'Verify & Sign Up')}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Error/Info Popup Modal */}
            {errorPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setErrorPopup(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={`p-3 rounded-full mb-4 ${errorPopup.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {errorPopup.type === 'error' ? <AlertTriangle className="w-8 h-8" /> : <div className="text-2xl">📧</div>}
                            </div>

                            <h3 className={`text-lg font-bold mb-2 ${errorPopup.type === 'error' ? 'text-gray-900' : 'text-green-700'}`}>
                                {errorPopup.type === 'error' ? 'Action Required' : 'Email Sent'}
                            </h3>

                            <p className="text-gray-600 mb-6 font-medium">
                                {errorPopup.message}
                            </p>

                            {errorPopup.action ? (
                                <button
                                    onClick={errorPopup.action.onClick}
                                    className="w-full py-3 px-4 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                                >
                                    {errorPopup.action.label}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setErrorPopup(null)}
                                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors ${errorPopup.type === 'error'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {errorPopup.type === 'error' ? 'Try Again' : 'Okay, Got it'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
