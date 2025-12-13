import BillingClient from './BillingClient';
import AuthGuard from '@/components/AuthGuard';

export const dynamic = 'force-dynamic';

export default function BillingPageWrapper() {
    return (
        <AuthGuard role="billing">
            <BillingClient />
        </AuthGuard>
    );
}
