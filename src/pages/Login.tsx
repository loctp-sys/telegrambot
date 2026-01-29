import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
    const { isAuthenticated, isLoading, login } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleSignIn = async () => {
        try {
            await login();
            // Navigation will happen automatically via useEffect
        } catch (error) {
            console.error('Login error:', error);
            alert('❌ Lỗi khi đăng nhập. Vui lòng thử lại!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-4 login-page">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
                    {/* Branding */}
                    <div className="text-center space-y-4">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-30"></div>
                                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full p-4">
                                    <ShieldCheck className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Fintech Command Center
                            </h1>
                            <p className="text-slate-600 mt-2">
                                Quản lý hệ thống Bot & Affiliate hiệu quả
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500">Đăng nhập để tiếp tục</span>
                        </div>
                    </div>

                    {/* Google Sign-In Button */}
                    <div className="space-y-4">
                        <Button
                            onClick={handleSignIn}
                            className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400 shadow-sm transition-all duration-200"
                            disabled={isLoading}
                        >
                            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="font-medium">Sign in with Google</span>
                        </Button>

                        {/* Security Note */}
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Secure authentication via Google OAuth</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-slate-600">
                    <p>© 2026 Fintech Dashboard. Secure Access Only.</p>
                </div>
            </div>
        </div>
    );
}
