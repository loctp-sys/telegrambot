import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { initGoogleAPI, initGoogleIdentity, signIn, signOut, isSignedIn } from '@/lib/google';
import { LogIn, LogOut } from 'lucide-react';

export default function LoginBtn() {
    const [signedIn, setSignedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeGoogleServices = async () => {
            try {
                await Promise.all([initGoogleAPI(), initGoogleIdentity()]);
                setSignedIn(isSignedIn());
            } catch (error) {
                console.error('Error initializing Google services:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeGoogleServices();
    }, []);

    const handleSignIn = async () => {
        try {
            setLoading(true);
            await signIn();
            setSignedIn(true);
            // Reload page to fetch data with new authentication
            window.location.reload();
        } catch (error) {
            console.error('Error signing in:', error);
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        signOut();
        setSignedIn(false);
        // Reload page to clear data
        window.location.reload();
    };

    if (loading) {
        return (
            <Button disabled>
                Đang tải...
            </Button>
        );
    }

    if (signedIn) {
        return (
            <Button onClick={handleSignOut} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
            </Button>
        );
    }

    return (
        <Button onClick={handleSignIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Đăng nhập Google
        </Button>
    );
}
