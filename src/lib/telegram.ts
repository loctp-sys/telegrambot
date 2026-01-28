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
 * Format and send notification about new offer
 */
export const notifyNewOffer = async (offerData: {
    name: string;
    amount: string;
    interest: string;
    term: string;
}): Promise<boolean> => {
    const message = `
🆕 <b>Kho vay mới được thêm</b>

📋 Tên: ${offerData.name}
💰 Số tiền: ${offerData.amount}
📊 Lãi suất: ${offerData.interest}
⏰ Kỳ hạn: ${offerData.term}

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
