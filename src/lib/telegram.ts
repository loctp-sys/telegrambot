import { TELEGRAM_CONFIG } from '@/config/constants';

const cleanTelegramHTML = (html: string): string => {
    let clean = html;

    // 1. Convert block elements to newlines
    clean = clean.replace(/<\/p>/gi, '\n');
    clean = clean.replace(/<\/div>/gi, '\n');
    clean = clean.replace(/<br\s*\/?>/gi, '\n');

    // 2. Remove forbidden start tags (p, div, span) but keep content
    clean = clean.replace(/<p[^>]*>/gi, '');
    clean = clean.replace(/<div[^>]*>/gi, '');
    clean = clean.replace(/<span[^>]*>/gi, '');
    clean = clean.replace(/<\/span>/gi, '');

    // 3. Remove all attributes from tags EXCEPT href
    // This regex explicitly targets common attributes to strip them
    clean = clean.replace(/\s+(class|style|id|dir|target|rel|width|height)="[^"]*"/gi, '');

    // 4. Clean up multiple newlines
    clean = clean.replace(/\n\s*\n/g, '\n\n');

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

    // Clean caption/text
    const cleanedText = cleanTelegramHTML(data.content);

    // Prepare message body
    const body: any = {
        chat_id: chatId,
        parse_mode: 'HTML',
        reply_markup: keyboard,
    };

    if (data.imageLink) {
        body.photo = data.imageLink;
        body.caption = cleanedText; // Use cleaned text for caption
    } else {
        body.text = cleanedText; // Use cleaned text for message
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                botToken,
                method: method,
                body: body
            }),
        });

        const resData = await response.json();
        if (!response.ok) {
            console.error('Telegram API Error:', resData);
        }
        return resData.ok;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return false;
    }
};
