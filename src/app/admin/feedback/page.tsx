import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import FeedbackForm from "@/components/FeedbackForm";
import { MessageSquareText } from "lucide-react";

export default async function FeedbackPage() {
    const session = await getServerSession(authOptions);

    return (
        <AuthGuard role="master">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                        <MessageSquareText size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-none mb-2">Share Your Feedback</h1>
                        <p className="text-gray-500">We appreciate your suggestions to improve FoodNote.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <FeedbackForm
                        shopName={session?.user?.companyName || "N/A"}
                        email={session?.user?.email || "N/A"}
                    />
                </div>
            </div>
        </AuthGuard>
    );
}
