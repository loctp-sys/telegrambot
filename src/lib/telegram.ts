import { TELEGRAM_CONFIG } from '@/config/constants';

/**
 * Send a message to Telegram
 */
export const sendTelegramMessage = async (message: string): Promise<boolean> => {
    const { botToken, chatId } = TELEGRAM_CONFIG;

    if (!botToken || !chatId) {
        console.error('Telegram configuration is missing');
        return false;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return false;
    }
};

/**
 * Format and send notification about new loan offer
 */
export const notifyNewOffer = async (offerData: {
    name: string;
    type: string;
    affLink: string;
    status: string;
    description: string;
}): Promise<boolean> => {
    const message = `
🆕 <b>Kho vay mới được thêm</b>

📋 Tên: ${offerData.name}
🏷️ Loại: ${offerData.type}
🔗 Link Aff: ${offerData.affLink}
✅ Trạng thái: ${offerData.status}
📝 Mô tả: ${offerData.description}

Thời gian: ${new Date().toLocaleString('vi-VN')}
  `.trim();

    return sendTelegramMessage(message);
};

/**
 * Format and send notification about scheduled post
 */
export const notifyScheduledPost = async (postData: {
    title: string;
    platform: string;
    scheduledTime: string;
}): Promise<boolean> => {
    const message = `
📅 <b>Bài viết được lên lịch</b>

📝 Tiêu đề: ${postData.title}
🌐 Nền tảng: ${postData.platform}
⏰ Thời gian đăng: ${postData.scheduledTime}

Thời gian tạo: ${new Date().toLocaleString('vi-VN')}
  `.trim();

    return sendTelegramMessage(message);
};

/**
 * Send error notification
 */
export const notifyError = async (errorMessage: string): Promise<boolean> => {
    const message = `
⚠️ <b>Lỗi hệ thống</b>

${errorMessage}

Thời gian: ${new Date().toLocaleString('vi-VN')}
  `.trim();

    return sendTelegramMessage(message);
};

/**
 * Send test message with image, caption, and inline button
 */
export const sendTestMessage = async (data: {
    content: string;
    imageLink?: string;
    buttonLink?: string;
}): Promise<boolean> => {
    const { botToken, chatId } = TELEGRAM_CONFIG;

    if (!botToken || !chatId) {
        console.error('Telegram configuration is missing');
        return false;
    }

    try {
        // If there's an image, use sendPhoto, otherwise use sendMessage
        if (data.imageLink) {
            const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

            // Prepare inline keyboard if button link exists
            const keyboard = data.buttonLink ? {
                inline_keyboard: [[
                    {
                        text: '🔗 Mở liên kết',
                        url: data.buttonLink
                    }
                ]]
            } : undefined;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    photo: data.imageLink,
                    caption: data.content,
                    parse_mode: 'HTML',
                    reply_markup: keyboard,
                }),
            });

            const result = await response.json();
            return result.ok;
        } else {
            // Text-only message with optional button
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

            const keyboard = data.buttonLink ? {
                inline_keyboard: [[
                    {
                        text: '🔗 Mở liên kết',
                        url: data.buttonLink
                    }
                ]]
            } : undefined;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: data.content,
                    parse_mode: 'HTML',
                    reply_markup: keyboard,
                }),
            });

            const result = await response.json();
            return result.ok;
        }
    } catch (error) {
        console.error('Error sending test message:', error);
        return false;
    }
};

