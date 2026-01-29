import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import LoginBtn from './LoginBtn';
import { LayoutDashboard, Package, Calendar, Settings, Menu } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/offers', label: 'Offers', icon: Package },
    { path: '/content', label: 'Content', icon: Calendar },
    { path: '/config', label: 'Cấu hình', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="font-bold text-lg">Fintech Dashboard</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full bg-white border-r w-64 z-40 transition-transform duration-300',
                    'lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-primary">Fintech Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">Quản lý tài chính</p>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-gray-100 text-gray-700'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <LoginBtn />
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
