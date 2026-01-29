
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { botToken, body, method = 'sendMessage' } = req.body;
    const token = botToken || process.env.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        res.status(500).json({ error: 'Telegram Bot Token configuration missing' });
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/${method}`;
        let requestOptions = { method: 'POST', headers: {} };

        // Handle Base64 Image (data:image/...)
        if (body.photo && typeof body.photo === 'string' && body.photo.startsWith('data:')) {
            try {
                // Manually parse Base64 to Buffer
                // Format: "data:image/png;base64,iVBORw0KGgo..."
                const matches = body.photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

                if (!matches || matches.length !== 3) {
                    throw new Error('Invalid Base64 string');
                }

                const mimeType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const filename = 'image.' + (mimeType.split('/')[1] || 'jpg');

                // Create FormData
                // Note: In Vercel Node.js environment, we might need 'form-data' package or polyfills
                // But modern Node.js has native FormData (Node 18+). 
                // If native FormData doesn't support Buffer directly in all environments, we need to be careful.
                // However, let's try standard Blob approach using the Buffer.

                const formData = new FormData();
                const blob = new Blob([buffer], { type: mimeType });

                formData.append('photo', blob, filename);

                // Add other fields
                for (const key in body) {
                    if (key !== 'photo') {
                        if (typeof body[key] === 'object') {
                            formData.append(key, JSON.stringify(body[key]));
                        } else {
                            formData.append(key, body[key]);
                        }
                    }
                }

                requestOptions.body = formData;
            } catch (err) {
                console.error('Error processing Base64:', err);
                // Fallback to sending as JSON (will likely fail for Data URI)
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.body = JSON.stringify(body);
            }
        } else {
            // Standard JSON request (text or URL)
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);
        const data = await response.json();

        if (!response.ok) {
            console.error('Telegram API error:', data);
            res.status(response.status).json(data);
            return;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
