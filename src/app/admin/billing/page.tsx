import BillingClient from './BillingClient';
import AuthGuard from '@/components/AuthGuard';

export const dynamic = 'force-dynamic';

export default async function BillingPageWrapper() {
    return (
        <AuthGuard role="billing" requirePassword={true}>
            <BillingClient />
        </AuthGuard>
    );
}
