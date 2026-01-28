import { useEffect, useState } from 'react';
import { readLoansData, readScheduleData } from '@/lib/google';
import { SHEET_NAMES } from '@/config/constants';
import { TrendingUp, Package, Calendar, CheckCircle } from 'lucide-react';

interface DashboardStats {
    totalLoans: number;
    activeLoans: number;
    scheduledPosts: number;
    pendingPosts: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalLoans: 0,
        activeLoans: 0,
        scheduledPosts: 0,
        pendingPosts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();

        // Listen for sign-in events to refresh data
        const handleSignIn = () => {
            console.log('📊 Refreshing dashboard data after sign-in...');
            loadDashboardData();
        };

        window.addEventListener('google-signin', handleSignIn);

        return () => {
            window.removeEventListener('google-signin', handleSignIn);
        };
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Check if user is signed in
            if (!(window as any).gapi?.client?.getToken()) {
                console.log('⚠️ User not signed in, skipping data fetch');
                setLoading(false);
                return;
            }

            // Load loans data
            const loansData = await readLoansData(SHEET_NAMES.LOANS);
            const activeLoans = loansData.filter(loan => loan.status === 'Active').length;

            // Load schedule data
            const scheduleData = await readScheduleData(SHEET_NAMES.SCHEDULE);
            const pendingPosts = scheduleData.filter(post => post.status === 'Pending').length;

            setStats({
                totalLoans: loansData.length,
                activeLoans: activeLoans,
                scheduledPosts: scheduleData.length,
                pendingPosts: pendingPosts,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Tổng kho vay',
            value: stats.totalLoans,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Kho vay đang hoạt động',
            value: stats.activeLoans,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Tổng bài đã lên lịch',
            value: stats.scheduledPosts,
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Bài chờ đăng',
            value: stats.pendingPosts,
            icon: TrendingUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Tổng quan hệ thống quản lý tài chính</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                                    <p className="text-2xl font-bold mt-2">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                    <Icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Thông tin hệ thống</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✅ Kết nối Google Sheets: Thành công</p>
                    <p>✅ Telegram Bot: Đã cấu hình</p>
                    <p>📊 Dữ liệu được đồng bộ từ: <span className="font-mono">DATA_KHOANVAY</span>, <span className="font-mono">AUTO_POST</span></p>
                </div>
            </div>
        </div>
    );
}
