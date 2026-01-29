import { TELEGRAM_CONFIG } from '@/config/constants';

const cleanTelegramHTML = (html: string): string => {
    let clean = html;
    // Replace <p> with nothing (start) and </p> with newline
    clean = clean.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '\n');

    // Replace <br> with newline
    clean = clean.replace(/<br\s*\/?>/g, '\n');

    // Remove class attributes from tags (Telegram doesn't support them except class on code inside pre, which we preserve if needed, but Tiptap adds it on pre/code)
    // Actually, simply removing class="..." globally is safer for most tags unless we specifically need language highlighting class on code.
    // Tiptap adds class="code-block" on pre. Telegram doesn't like it.
    // Let's strip class attributes generally.
    clean = clean.replace(/ class="[^"]*"/g, '');

    return clean.trim();
};

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

    // Clean HTML before sending
    const cleanedMessage = cleanTelegramHTML(message);

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
                    text: cleanedMessage,
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
    buttonLabel?: string;
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
                text: data.buttonLabel || '🔗 Mở liên kết',
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

