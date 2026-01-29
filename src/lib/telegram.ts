import { TELEGRAM_CONFIG } from '@/config/constants';

/**
 * Send a message to Telegram
 */
export const sendTelegramMessage = async (message: string): Promise<boolean> => {
    const { botToken, chatId } = TELEGRAM_CONFIG;

    if (!chatId) {
        console.error('Telegram Chat ID is missing');
        return false;
    }

    // Use local proxy to avoid CORS
    const url = '/api/telegram';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                botToken, // Optional: pass token if allowed by proxy, otherwise proxy uses env
                method: 'sendMessage',
                body: {
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                }
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
    buttonText?: string;
}): Promise<boolean> => {
    const { botToken, chatId } = TELEGRAM_CONFIG;

    if (!chatId) {
        console.error('Telegram Chat ID is missing');
        return false;
    }

    const url = '/api/telegram';
    const method = data.imageLink ? 'sendPhoto' : 'sendMessage';

    // Prepare inline keyboard if button link exists
    const keyboard = data.buttonLink ? {
        inline_keyboard: [[
            {
                text: data.buttonText || '🔗 Mở liên kết',
                url: data.buttonLink
            }
        ]]
    } : undefined;

    // Prepare message body
    const body: any = {
        chat_id: chatId,
        parse_mode: 'HTML',
        reply_markup: keyboard,
    };

    if (data.imageLink) {
        body.photo = data.imageLink;
        body.caption = data.content;
    } else {
        body.text = data.content;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                botToken,
                method,
                body
            }),
        });

        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error('Error sending test message:', error);
        return false;
    }
};

