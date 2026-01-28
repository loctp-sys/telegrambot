import { useEffect, useState } from 'react';
import { readScheduleData, addScheduledPost, type ScheduledPost } from '@/lib/google';
import { notifyScheduledPost, sendTestMessage } from '@/lib/telegram';
import { SHEET_NAMES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ExternalLink, Image, Eye } from 'lucide-react';
import TelegramPreviewModal from '@/components/TelegramPreviewModal';

export default function Scheduler() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [previewPost, setPreviewPost] = useState<ScheduledPost | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        content: '',
        buttonLink: '',
        imageLink: '',
        status: 'Pending',
        exactTime: '',
    });

    useEffect(() => {
        loadPosts();

        // Listen for sign-in events to refresh data
        const handleSignIn = () => {
            console.log('📅 Refreshing scheduler data after sign-in...');
            loadPosts();
        };

        window.addEventListener('google-signin', handleSignIn);

        return () => {
            window.removeEventListener('google-signin', handleSignIn);
        };
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);

            // Check if user is signed in
            if (!(window as any).gapi?.client?.getToken()) {
                console.log('⚠️ User not signed in, skipping data fetch');
                setLoading(false);
                return;
            }

            const data = await readScheduleData(SHEET_NAMES.SCHEDULE);
            setPosts(data);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await addScheduledPost(SHEET_NAMES.SCHEDULE, formData);
            await notifyScheduledPost({
                title: formData.content.substring(0, 50) + '...',
                platform: 'Telegram',
                scheduledTime: `${formData.date} ${formData.time}`,
            });

            setFormData({
                date: '',
                time: '',
                content: '',
                buttonLink: '',
                imageLink: '',
                status: 'Pending',
                exactTime: '',
            });
            setShowForm(false);
            loadPosts();
        } catch (error) {
            console.error('Error adding post:', error);
        }
    };

    const handleSendTest = async (post: ScheduledPost) => {
        await sendTestMessage({
            content: post.content,
            imageLink: post.imageLink,
            buttonLink: post.buttonLink,
        });
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
                    <h1 className="text-3xl font-bold text-gray-900">Lên lịch đăng bài</h1>
                    <p className="text-muted-foreground mt-2">Quản lý lịch đăng bài trên các nền tảng</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm lịch
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Lên lịch bài viết mới</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Ngày dự kiến *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Giờ gửi *</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nội dung Caption *</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={4}
                                placeholder="Nhập nội dung bài viết..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Link nút bấm</label>
                            <input
                                type="url"
                                value={formData.buttonLink}
                                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Link ảnh</label>
                            <input
                                type="url"
                                value={formData.imageLink}
                                onChange={(e) => setFormData({ ...formData, imageLink: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Trạng thái *</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Giờ đăng chính xác</label>
                                <input
                                    type="datetime-local"
                                    value={formData.exactTime}
                                    onChange={(e) => setFormData({ ...formData, exactTime: e.target.value })}
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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nội dung</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ảnh</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                                        Chưa có bài viết nào được lên lịch. Nhấn "Thêm lịch" để bắt đầu.
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{post.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{post.time}</td>
                                        <td className="px-6 py-4 text-sm max-w-xs truncate" title={post.content}>
                                            {post.content}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {post.buttonLink ? (
                                                <a
                                                    href={post.buttonLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {post.imageLink ? (
                                                <a
                                                    href={post.imageLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    <Image className="h-3 w-3" />
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${post.status === 'Done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setPreviewPost(post)}
                                                title="Xem trước"
                                            >
                                                <Eye className="h-4 w-4 text-blue-600" />
                                            </Button>
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

            {/* Preview Modal */}
            <TelegramPreviewModal
                isOpen={previewPost !== null}
                onClose={() => setPreviewPost(null)}
                content={previewPost?.content || ''}
                imageLink={previewPost?.imageLink}
                buttonLink={previewPost?.buttonLink}
                onSendTest={previewPost ? () => handleSendTest(previewPost) : undefined}
            />
        </div>
    );
}
