import { useEffect, useState } from 'react';
import { readLoansData, addLoanOffer, type LoanOffer } from '@/lib/google';
import { notifyNewOffer } from '@/lib/telegram';
import { SHEET_NAMES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export default function Offers() {
    const [offers, setOffers] = useState<LoanOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'WEB',
        affLink: '',
        status: 'Active',
        description: '',
    });

    useEffect(() => {
        loadOffers();

        // Listen for sign-in events to refresh data
        const handleSignIn = () => {
            console.log('🏦 Refreshing offers data after sign-in...');
            loadOffers();
        };

        window.addEventListener('google-signin', handleSignIn);

        return () => {
            window.removeEventListener('google-signin', handleSignIn);
        };
    }, []);

    const loadOffers = async () => {
        try {
            setLoading(true);

            // Check if user is signed in
            if (!(window as any).gapi?.client?.getToken()) {
                console.log('⚠️ User not signed in, skipping data fetch');
                setLoading(false);
                return;
            }

            const data = await readLoansData(SHEET_NAMES.LOANS);
            setOffers(data);
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await addLoanOffer(SHEET_NAMES.LOANS, formData);
            await notifyNewOffer(formData);

            setFormData({ name: '', type: 'WEB', affLink: '', status: 'Active', description: '' });
            setShowForm(false);
            loadOffers();
        } catch (error) {
            console.error('Error adding offer:', error);
        }
    };

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
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý kho vay</h1>
                    <p className="text-muted-foreground mt-2">Danh sách các khoản vay có sẵn</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm kho vay
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Thêm kho vay mới</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tên kho vay *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="VD: Vay tiền nhanh ABC"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Loại *</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="WEB">WEB</option>
                                    <option value="H5">H5</option>
                                    <option value="CIC">CIC</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Trạng thái *</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Link Affiliate *</label>
                            <input
                                type="url"
                                required
                                value={formData.affLink}
                                onChange={(e) => setFormData({ ...formData, affLink: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                                placeholder="Mô tả chi tiết về kho vay..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">Lưu</Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Hủy
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link Aff</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {offers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                        Chưa có kho vay nào. Nhấn "Thêm kho vay" để bắt đầu.
                                    </td>
                                </tr>
                            ) : (
                                offers.map((offer) => (
                                    <tr key={offer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{offer.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{offer.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${offer.type === 'WEB' ? 'bg-blue-100 text-blue-800' :
                                                offer.type === 'H5' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {offer.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <a
                                                href={offer.affLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                Link <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${offer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {offer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm max-w-xs truncate" title={offer.description}>
                                            {offer.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
