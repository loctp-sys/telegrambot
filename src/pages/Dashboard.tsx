import { useEffect, useState } from 'react';
import { readSheet } from '@/lib/google';
import { SHEET_NAMES } from '@/config/constants';
import { TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';

interface DashboardStats {
    totalOffers: number;
    scheduledPosts: number;
    totalRevenue: number;
    activeLoans: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalOffers: 0,
        scheduledPosts: 0,
        totalRevenue: 0,
        activeLoans: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Load data from Google Sheets
            const offersData = await readSheet(`${SHEET_NAMES.OFFERS}!A:D`);
            const scheduleData = await readSheet(`${SHEET_NAMES.SCHEDULE}!A:D`);

            setStats({
                totalOffers: offersData.length - 1, // Subtract header row
                scheduledPosts: scheduleData.length - 1,
                totalRevenue: 0, // Calculate from actual data
                activeLoans: 0, // Calculate from actual data
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
            value: stats.totalOffers,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Bài viết đã lên lịch',
            value: stats.scheduledPosts,
            icon: Calendar,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Doanh thu',
            value: `${stats.totalRevenue.toLocaleString('vi-VN')} ₫`,
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Khoản vay đang hoạt động',
            value: stats.activeLoans,
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
                <h2 className="text-xl font-bold mb-4">Hoạt động gần đây</h2>
                <p className="text-muted-foreground">Chưa có hoạt động nào được ghi nhận.</p>
            </div>
        </div>
    );
}
