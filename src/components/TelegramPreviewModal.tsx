import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TelegramPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    imageLink?: string;
    buttonLink?: string;
    onSendTest?: () => Promise<void>;
}

export default function TelegramPreviewModal({
    isOpen,
    onClose,
    content,
    imageLink,
    buttonLink,
    onSendTest,
}: TelegramPreviewModalProps) {
    const [sending, setSending] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!isOpen) return null;

    const handleSendTest = async () => {
        if (!onSendTest) return;

        try {
            setSending(true);
            await onSendTest();
            alert('✅ Tin nhắn test đã được gửi đến Telegram của bạn!');
        } catch (error) {
            console.error('Error sending test:', error);
            alert('❌ Lỗi khi gửi tin nhắn test!');
        } finally {
            setSending(false);
        }
    };

    // Format content with line breaks
    const formattedContent = content.split('\n').map((line, index) => (
        <span key={index}>
            {line}
            {index < content.split('\n').length - 1 && <br />}
        </span>
    ));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Xem trước Telegram</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Phone Container */}
                <div className="p-6">
                    <div
                        className="mx-auto bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg shadow-inner p-4"
                        style={{ width: '375px', maxWidth: '100%' }}
                    >
                        {/* Telegram Chat Header */}
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                                📢
                            </div>
                            <div>
                                <div className="font-semibold text-sm">Channel Post</div>
                                <div className="text-xs opacity-80">Preview</div>
                            </div>
                        </div>

                        {/* Message Bubble */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-[85%]">
                            {/* Image Section */}
                            {imageLink && !imageError && (
                                <div className="relative">
                                    <img
                                        src={imageLink}
                                        alt="Preview"
                                        className="w-full h-auto"
                                        onError={() => setImageError(true)}
                                    />
                                </div>
                            )}

                            {/* Image Error Placeholder */}
                            {imageLink && imageError && (
                                <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🖼️</div>
                                        <div className="text-sm">Không thể tải ảnh</div>
                                    </div>
                                </div>
                            )}

                            {/* Caption Section */}
                            {content && (
                                <div className="p-3 text-sm text-gray-800 whitespace-pre-wrap">
                                    {formattedContent}
                                </div>
                            )}

                            {/* Inline Button */}
                            {buttonLink && (
                                <div className="border-t border-gray-200">
                                    <a
                                        href={buttonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block py-2 text-center text-blue-500 hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        🔗 Mở liên kết
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2 p-4 border-t bg-gray-50">
                    <Button
                        onClick={handleSendTest}
                        disabled={sending}
                        className="flex-1"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? 'Đang gửi...' : '📲 Gửi test đến Telegram'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
}
