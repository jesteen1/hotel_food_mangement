'use client';

import { getAuthSettings, updatePassword, sendOtp, verifyStepUpOtp, deleteAccount, setPassword } from "@/app/actions";
import { useState, useEffect } from "react";
import { Key, Save, Loader2, ShieldCheck, Mail, Lock, AlertTriangle, Trash2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [passwords, setPasswords] = useState<Record<string, string>>({});

    // Step-up Auth State
    const [isVerified, setIsVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');

    // Owner Password State
    const [ownerPassword, setOwnerPassword] = useState('');
    const [settingOwnerPass, setSettingOwnerPass] = useState(false);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteOtpSent, setDeleteOtpSent] = useState(false);
    const [deleteOtp, setDeleteOtp] = useState('');
    const [deleting, setDeleting] = useState(false);

    const [errorPopup, setErrorPopup] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    useEffect(() => {
        // Check if previously verified in this tab session
        if (sessionStorage.getItem('settings_verified')) {
            setIsVerified(true);
        }
    }, []);

    useEffect(() => {
        if (isVerified) {
            getAuthSettings().then((data: any) => {
                if (data) {
                    setRoles(Object.keys(data).filter(r => r !== 'master'));
                    setPasswords(data);
                    setLoading(false);
                }
            });
        }
    }, [isVerified]);

    const handleSendOtp = async () => {
        try {
            if (status === 'loading') return;
            if (!session?.user?.email) {
                setErrorPopup({ message: "Session not ready. Please refresh.", type: 'error' });
                return;
            }
            setOtpLoading(true);
            setOtpError('');
            const res = await sendOtp(session.user.email, 'security');
            if (res.success) {
                setOtpSent(true);
                if (res.mode === 'dev') setErrorPopup({ message: `DEV OTP: ${res.otp}`, type: 'success' });
            } else {
                setOtpError(res.error || "Failed to send OTP");
                setErrorPopup({ message: res.error || "Failed to send OTP", type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setErrorPopup({ message: "An unexpected error occurred sending OTP", type: 'error' });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            if (!session?.user?.email) return;
            setOtpLoading(true);
            setOtpError('');
            const res = await verifyStepUpOtp(session.user.email, otp);
            if (res.success) {
                setIsVerified(true);
                sessionStorage.setItem('settings_verified', 'true');
            } else {
                const msg = res.error || "Invalid OTP";
                setOtpError(msg);
                setErrorPopup({ message: msg, type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setErrorPopup({ message: "An unexpected error occurred during verification", type: 'error' });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleUpdateOwnerPassword = async () => {
        if (!ownerPassword) return;

        // Security Validation
        if (ownerPassword.length < 8) {
            setErrorPopup({ message: "Password must be at least 8 characters long.", type: 'error' });
            return;
        }
        if (!/[a-zA-Z]/.test(ownerPassword)) {
            setErrorPopup({ message: "Password must contain at least one letter.", type: 'error' });
            return;
        }
        if (!/\d/.test(ownerPassword)) {
            setErrorPopup({ message: "Password must contain at least one number.", type: 'error' });
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(ownerPassword)) {
            setErrorPopup({ message: "Password must contain at least one special character.", type: 'error' });
            return;
        }

        setSettingOwnerPass(true);
        try {
            const res = await setPassword(ownerPassword);
            if (res.success) {
                setErrorPopup({ message: "Your login password has been set successfully.", type: 'success' });
                setOwnerPassword('');
                router.refresh();
            } else {
                setErrorPopup({ message: res.error || "Failed to set password", type: 'error' });
            }
        } catch (e) {
            setErrorPopup({ message: "Error setting password", type: 'error' });
        } finally {
            setSettingOwnerPass(false);
        }
    };

    const handleDeleteSendOtp = async () => {
        try {
            if (!session?.user?.email) return;
            setOtpLoading(true);
            const res = await sendOtp(session.user.email, 'delete_account');
            if (res.success) {
                setDeleteOtpSent(true);
                setErrorPopup({ message: "Verification code sent to email", type: 'success' });
                if (res.mode === 'dev') alert(`DEV DELETE OTP: ${res.otp}`);
            } else {
                setErrorPopup({ message: res.error || "Failed to send OTP", type: 'error' });
            }
        } catch (e) {
            console.error(e);
            setErrorPopup({ message: "Error sending OTP", type: 'error' });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            const res = await deleteAccount(deleteOtp);
            if (res.success) {
                await signOut({ callbackUrl: '/login' });
            } else {
                setErrorPopup({ message: res.error || "Delete failed", type: 'error' });
                setDeleting(false);
            }
        } catch (e) {
            console.error(e);
            setErrorPopup({ message: "Critical error during deletion", type: 'error' });
            setDeleting(false);
        }
    };

    if (errorPopup) {
        setTimeout(() => setErrorPopup(null), 3000);
    }

    if (!isVerified) {
        return (
            <div className="p-6 max-w-md mx-auto mt-12 bg-white rounded-xl shadow-lg border border-gray-100 text-center relative">
                {errorPopup && (
                    <div className={`absolute top-4 left-4 right-4 p-4 rounded-lg shadow-lg text-white font-medium text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 z-50 ${errorPopup.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                        {errorPopup.type === 'error' ? <ShieldCheck size={20} /> : <Mail size={20} />}
                        {errorPopup.message}
                        <button onClick={() => setErrorPopup(null)} className="ml-auto opacity-80 hover:opacity-100">✕</button>
                    </div>
                )}
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Security Verification</h2>
                <p className="text-gray-500 mb-6">This is a sensitive area. Please verify your identity via Email OTP to proceed.</p>
                {otpError && !errorPopup && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{otpError}</div>
                )}
                {!otpSent ? (
                    <button onClick={handleSendOtp} disabled={otpLoading || status === 'loading'} className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50">
                        {otpLoading || status === 'loading' ? <Loader2 className="animate-spin" /> : <Mail size={18} />}
                        {status === 'loading' ? 'Loading Session...' : 'Send OTP to Email'}
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => { setOtp(e.target.value); setOtpError(''); }} className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                        <button onClick={handleVerifyOtp} disabled={otpLoading || otp.length < 6} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {otpLoading ? 'Verifying...' : 'Verify Access'}
                        </button>
                        <button onClick={() => setOtpSent(false)} className="text-sm text-gray-500 underline hover:text-gray-700">Resend Code</button>
                    </div>
                )}
            </div>
        );
    }



    const handleUpdate = async (role: string) => {
        if (!passwords[role]) return;
        setUpdating(role);
        const res = await updatePassword(role, passwords[role]);
        if (res.success) {
            setErrorPopup({ message: `Password for ${role} updated successfully`, type: 'success' });
            setPasswords(prev => ({ ...prev, [role]: '' }));
        } else {
            setErrorPopup({ message: `Failed: ${res.error}`, type: 'error' });
        }
        setUpdating(null);
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto relative pb-20">
            {errorPopup && (
                <div className={`fixed top-24 right-6 p-4 rounded-lg shadow-lg text-white font-medium text-sm flex items-center gap-3 animate-in fade-in slide-in-from-right-4 z-50 ${errorPopup.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                    {errorPopup.message}
                    <button onClick={() => setErrorPopup(null)} className="ml-auto opacity-80 hover:opacity-100">✕</button>
                </div>
            )}
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Key className="text-orange-600" />
                Security Settings
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Manage Passwords</h2>
                    <p className="text-gray-500 text-sm">Update login credentials for different roles.</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {roles.map(role => (
                        <div key={role} className="p-6 flex items-center justify-between gap-4 flex-wrap">
                            <div className="w-32"><span className="font-medium text-gray-900 capitalize">{role}</span></div>
                            <div className="flex-1 max-w-md">
                                <input type="text" placeholder="Enter new password" value={passwords[role] || ''} onChange={(e) => setPasswords({ ...passwords, [role]: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                            </div>
                            <button onClick={() => handleUpdate(role)} disabled={!passwords[role] || updating === role} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                                {updating === role ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Owner Password Section */}
            <div className="bg-orange-50 rounded-xl border border-orange-100 overflow-hidden mb-8">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                        <Lock size={20} />
                        Your Login Password (Optional)
                    </h2>
                    <p className="text-orange-800 text-sm mt-1">
                        Set a password to login without OTP. You can always use OTP if you forget it.
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Set new login password"
                                value={ownerPassword}
                                onChange={(e) => setOwnerPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleUpdateOwnerPassword}
                            disabled={!ownerPassword || settingOwnerPass}
                            className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {settingOwnerPass ? <Loader2 className="animate-spin" size={18} /> : null}
                            Set Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden mb-8">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Danger Zone
                    </h2>
                    <p className="text-red-700 text-sm mt-1">
                        Irreversible actions. Please be certain.
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900">Delete Account</p>
                            <p className="text-sm text-gray-500">Permanently remove your account and all data.</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>



            <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p className="font-bold mb-2">ℹ️ Security Note</p>
                <p>
                    <strong>You (The Owner)</strong> do not need a password. You always log in or verify step-up access securely via <strong>Email OTP</strong>.
                </p>
                <p className="mt-2">
                    The passwords above are for your <strong>Employees</strong> (Chef, Waiter, Manager) to access their specific dashboards without needing your Email OTP.
                </p>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => { setShowDeleteModal(false); setDeleteOtpSent(false); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Delete Account?</h3>
                            <p className="text-gray-500 mt-2 text-sm">
                                This action cannot be undone. All products, orders, and settings will be lost.
                            </p>
                        </div>
                        {!deleteOtpSent ? (
                            <button
                                onClick={handleDeleteSendOtp}
                                disabled={otpLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {otpLoading ? <Loader2 className="animate-spin" /> : <Mail size={18} />}
                                Send Verification Code
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-orange-50 text-orange-800 text-sm rounded-lg text-center">
                                    Check your email for the deletion code.
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Deletion Code"
                                    value={deleteOtp}
                                    onChange={(e) => setDeleteOtp(e.target.value)}
                                    className="w-full px-4 py-3 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                />
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={deleting || deleteOtp.length < 6}
                                    className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Confirm Permanent Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
