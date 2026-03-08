import AuthGuard from '@/components/AuthGuard';
import QRGeneratorClient from './QRGeneratorClient';

export const dynamic = 'force-dynamic';

export default async function QRGeneratorPage() {
    return (
        <AuthGuard role="master">
            <QRGeneratorClient />
        </AuthGuard>
    );
}
