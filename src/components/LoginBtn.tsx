import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut } from 'lucide-react';

export default function LoginBtn() {
    const { isAuthenticated, isLoading, login, logout } = useAuth();

    const handleSignIn = async () => {
        try {
            await login();
        } catch (error) {
            console.error('Error signing in:', error);
            alert('❌ Lỗi khi đăng nhập. Vui lòng thử lại!');
        }
    };

    if (isLoading) {
        return (
            <Button disabled>
                Đang tải...
            </Button>
        );
    }

    if (isAuthenticated) {
        return (
            <Button onClick={logout} variant="outline">
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
