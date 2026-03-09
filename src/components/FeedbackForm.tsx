'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FeedbackFormProps {
    shopName: string;
    email: string;
}

export default function FeedbackForm({ shopName, email }: FeedbackFormProps) {
    const [name, setName] = useState('');
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !feedback) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, feedback, shopName, email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Thank you! Your feedback has been sent to the hotel owner.');
                setName('');
                setFeedback('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went welcome. Please try again later.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Failed to connect to the server. Please check your internet.');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name</label>
                            <input
                                type="text"
                                value={shopName}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email</label>
                            <input
                                type="text"
                                value={email}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Name <span className="text-orange-600">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                            Feedback <span className="text-orange-600">*</span>
                        </label>
                        <textarea
                            id="feedback"
                            required
                            rows={5}
                            placeholder="Write your suggestions or feedback here..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {status === 'success' && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle2 size={20} />
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Feedback
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
