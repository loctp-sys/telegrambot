import { useEffect, useState } from 'react';
import { readScheduleData, addScheduledPost, updateScheduledPost, deleteScheduledPost, type ScheduledPost } from '@/lib/google';
import { notifyScheduledPost, sendTestMessage } from '@/lib/telegram';
import { SHEET_NAMES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ExternalLink, Image, Eye, Edit, Bold, Italic, Underline, Code, Link } from 'lucide-react';
import TelegramPreviewModal from '@/components/TelegramPreviewModal';

export default function Content() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [previewPost, setPreviewPost] = useState<ScheduledPost | null>(null);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [broadcasting, setBroadcasting] = useState<number | null>(null);
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
            console.log('📄 Refreshing content data after sign-in...');
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
            if (editingIndex !== null) {
                // Update existing post
                await updateScheduledPost(SHEET_NAMES.SCHEDULE, editingIndex, formData);
                alert('✅ Content đã được cập nhật!');
            } else {
                // Add new post
                await addScheduledPost(SHEET_NAMES.SCHEDULE, formData);
                await notifyScheduledPost({
                    title: formData.content.substring(0, 50) + '...',
                    platform: 'Telegram',
                    scheduledTime: `${formData.date} ${formData.time}`,
                });
                alert('✅ Content đã được thêm!');
            }

            resetForm();
            loadPosts();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('❌ Lỗi khi lưu content!');
        }
    };

    const resetForm = () => {
        setFormData({
            date: '',
            time: '',
            content: '',
            buttonLink: '',
            imageLink: '',
            status: 'Pending',
            exactTime: '',
        });
        setUploadedImage(null);
        setImagePreview('');
        setShowForm(false);
        setEditingIndex(null);
    };

    const handleSendTest = async (post: ScheduledPost) => {
        await sendTestMessage({
            content: post.content,
            imageLink: post.imageLink,
            buttonLink: post.buttonLink,
        });
    };

    const handleBroadcastNow = async (post: ScheduledPost, index: number) => {
        if (!confirm('🚀 Gửi content này ngay lập tức đến Telegram?')) return;

        try {
            setBroadcasting(index);
            const success = await sendTestMessage({
                content: post.content,
                imageLink: post.imageLink,
                buttonLink: post.buttonLink,
            });

            if (success) {
                // Update status to Done
                await updateScheduledPost(SHEET_NAMES.SCHEDULE, index, {
                    ...post,
                    status: 'Done',
                });
                alert('✅ Content đã được gửi thành công!');
                loadPosts();
            }
        } catch (error) {
            console.error('Error broadcasting:', error);
            alert('❌ Lỗi khi gửi content!');
        } finally {
            setBroadcasting(null);
        }
    };

    const handleEdit = (post: ScheduledPost, index: number) => {
        setFormData(post);
        setEditingIndex(index);
        setShowForm(true);
        if (post.imageLink && post.imageLink.startsWith('data:')) {
            setImagePreview(post.imageLink);
        }
    };

    const handleDelete = async (index: number) => {
        if (!confirm('🗑️ Bạn có chắc chắn muốn xóa content này?')) return;

        try {
            await deleteScheduledPost(index);
            alert('✅ Content đã được xóa!');
            loadPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('❌ Lỗi khi xóa content!');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedImage(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setFormData({ ...formData, imageLink: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePreviewForm = () => {
        setPreviewPost(formData as ScheduledPost);
    };

    const handleFormat = (tag: string) => {
        const textarea = document.getElementById('caption-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content;
        const selectedText = text.substring(start, end);

        let newText = '';
        let newCursorPos = 0;

        if (tag === 'link') {
            const url = prompt('Nhập đường dẫn URL:', 'https://');
            if (!url) return;
            newText = text.substring(0, start) + `<a href="${url}">${selectedText || 'Link'}</a>` + text.substring(end);
            newCursorPos = start + `<a href="${url}">${selectedText || 'Link'}</a>`.length;
        } else {
            const openTag = `<${tag}>`;
            const closeTag = `</${tag}>`;
            newText = text.substring(0, start) + openTag + (selectedText || '') + closeTag + text.substring(end);
            newCursorPos = end + openTag.length + closeTag.length;
            if (!selectedText) newCursorPos = start + openTag.length;
        }

        setFormData({ ...formData, content: newText });

        // Restore focus and cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Content</h1>
                    <p className="text-muted-foreground mt-2">Quản lý nội dung đăng bài trên Telegram</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Content
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">
                            {editingIndex !== null ? 'Chỉnh sửa Content' : 'Thêm Content mới'}
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePreviewForm}
                            disabled={!formData.content}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem trước
                        </Button>
                    </div>
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
                            <div>
                                <label className="block text-sm font-medium mb-2">Nội dung Caption *</label>

                                {/* Formatting Toolbar */}
                                <div className="flex items-center gap-1 mb-2 border rounded-md p-1 bg-gray-50 w-fit">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('b')} title="In đậm">
                                        <Bold className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('i')} title="In nghiêng">
                                        <Italic className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('u')} title="Gạch chân">
                                        <Underline className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('code')} title="Monospace">
                                        <Code className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('link')} title="Chèn link">
                                        <Link className="h-4 w-4" />
                                    </Button>
                                </div>

                                <textarea
                                    id="caption-textarea"
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
                                <label className="block text-sm font-medium mb-2">Link ảnh hoặc tải lên</label>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        value={uploadedImage ? '' : formData.imageLink}
                                        onChange={(e) => {
                                            setFormData({ ...formData, imageLink: e.target.value });
                                            setUploadedImage(null);
                                            setImagePreview('');
                                        }}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="https://... hoặc tải ảnh từ máy"
                                        disabled={!!uploadedImage}
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                                        >
                                            📁 Chọn ảnh từ máy
                                        </label>
                                        {uploadedImage && (
                                            <span className="text-sm text-gray-600">
                                                ✅ {uploadedImage.name}
                                            </span>
                                        )}
                                        {(uploadedImage || imagePreview) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setUploadedImage(null);
                                                    setImagePreview('');
                                                    setFormData({ ...formData, imageLink: '' });
                                                }}
                                            >
                                                ❌ Xóa
                                            </Button>
                                        )}
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="max-w-xs h-auto rounded border"
                                            />
                                        </div>
                                    )}
                                </div>
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
                                <Button type="submit">{editingIndex !== null ? 'Cập nhật' : 'Lưu'}</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
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
                                        Chưa có content nào. Nhấn "Thêm Content" để bắt đầu.
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
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBroadcastNow(post, index)}
                                                    disabled={broadcasting === index}
                                                    title="Gửi ngay"
                                                    className="hover:bg-green-50 border-green-600 text-green-600 hover:text-green-700"
                                                >
                                                    {broadcasting === index ? 'Đang gửi...' : 'Gửi ngay'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(post, index)}
                                                    title="Chỉnh sửa"
                                                    className="hover:bg-amber-50"
                                                >
                                                    <Edit className="h-4 w-4 text-amber-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(index)}
                                                    title="Xóa"
                                                    className="hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
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
