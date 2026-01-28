import { useEffect, useState } from 'react';
import { readSheet, appendSheet } from '@/lib/google';
import { notifyNewOffer } from '@/lib/telegram';
import { SHEET_NAMES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Offer {
    id: string;
    name: string;
    amount: string;
    interest: string;
    term: string;
}

export default function Offers() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        interest: '',
        term: '',
    });

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            setLoading(true);
            const data = await readSheet(`${SHEET_NAMES.OFFERS}!A:E`);

            if (data.length > 1) {
                const offersData = data.slice(1).map((row, index) => ({
                    id: row[0] || `${index + 1}`,
                    name: row[1] || '',
                    amount: row[2] || '',
                    interest: row[3] || '',
                    term: row[4] || '',
                }));
                setOffers(offersData);
            }
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const newId = (offers.length + 1).toString();
            const newRow = [newId, formData.name, formData.amount, formData.interest, formData.term];

            await appendSheet(`${SHEET_NAMES.OFFERS}!A:E`, [newRow]);
            await notifyNewOffer(formData);

            setFormData({ name: '', amount: '', interest: '', term: '' });
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
                            <label className="block text-sm font-medium mb-2">Tên kho vay</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Số tiền</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Lãi suất</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.interest}
                                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Kỳ hạn</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.term}
                                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
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
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lãi suất</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kỳ hạn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {offers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                    Chưa có kho vay nào. Nhấn "Thêm kho vay" để bắt đầu.
                                </td>
                            </tr>
                        ) : (
                            offers.map((offer) => (
                                <tr key={offer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{offer.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{offer.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{offer.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{offer.interest}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{offer.term}</td>
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
    );
}
