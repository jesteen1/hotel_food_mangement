import SettingsClient from './SettingsClient';
import AuthGuard from '@/components/AuthGuard';

export const dynamic = 'force-dynamic';

export default function SettingsPageWrapper() {
    return (
        <AuthGuard role="master">
            <SettingsClient />
        </AuthGuard>
    );
}
