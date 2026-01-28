import { useEffect, useState } from 'react';
import { readConfigData, writeConfigData, type ConfigItem } from '@/lib/google';
import { SHEET_NAMES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, Settings } from 'lucide-react';

export default function Config() {
    const [configs, setConfigs] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newConfig, setNewConfig] = useState({ key: '', value: '' });

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);

            // Check if user is signed in
            if (!(window as any).gapi?.client?.getToken()) {
                console.log('⚠️ User not signed in, skipping data fetch');
                setLoading(false);
                return;
            }

            const data = await readConfigData(SHEET_NAMES.CONFIG);
            setConfigs(data);
        } catch (error) {
            console.error('Error loading configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await writeConfigData(SHEET_NAMES.CONFIG, configs);
            alert('✅ Cấu hình đã được lưu thành công!');
        } catch (error) {
            console.error('Error saving configs:', error);
            alert('❌ Lỗi khi lưu cấu hình!');
        } finally {
            setSaving(false);
        }
    };

    const handleAddConfig = () => {
        if (!newConfig.key || !newConfig.value) {
            alert('Vui lòng nhập đầy đủ Key và Value!');
            return;
        }

        setConfigs([...configs, { ...newConfig }]);
        setNewConfig({ key: '', value: '' });
        setShowForm(false);
    };

    const handleUpdateConfig = (index: number, field: 'key' | 'value', value: string) => {
        const updated = [...configs];
        updated[index][field] = value;
        setConfigs(updated);
    };

    const handleDeleteConfig = (index: number) => {
        if (confirm('Bạn có chắc muốn xóa cấu hình này?')) {
            const updated = configs.filter((_, i) => i !== index);
            setConfigs(updated);
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
                    <h1 className="text-3xl font-bold text-gray-900">Cấu hình hệ thống</h1>
                    <p className="text-muted-foreground mt-2">Quản lý các thiết lập của bot</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowForm(!showForm)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mới
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Thêm cấu hình mới</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Key *</label>
                            <input
                                type="text"
                                value={newConfig.key}
                                onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="VD: BOT_NAME"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Value *</label>
                            <input
                                type="text"
                                value={newConfig.value}
                                onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="VD: My Fintech Bot"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleAddConfig}>Thêm</Button>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {configs.length === 0 ? (
                    <div className="p-8 text-center">
                        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Chưa có cấu hình nào</h3>
                        <p className="text-muted-foreground mb-4">
                            Nhấn "Thêm mới" để tạo cấu hình đầu tiên
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                                        Key
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/2">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {configs.map((config, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={config.key}
                                                onChange={(e) => handleUpdateConfig(index, 'key', e.target.value)}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={config.value}
                                                onChange={(e) => handleUpdateConfig(index, 'value', e.target.value)}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteConfig(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Hướng dẫn sử dụng</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Chỉnh sửa trực tiếp trong bảng</li>
                    <li>• Nhấn "Lưu thay đổi" để đồng bộ lên Google Sheets</li>
                    <li>• Các cấu hình này có thể được sử dụng bởi bot Telegram</li>
                </ul>
            </div>
        </div>
    );
}
