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

    // Use token from body or environment variable
    const token = botToken || process.env.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        res.status(500).json({ error: 'Telegram Bot Token is missing configuration' });
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/${method}`;

        // Prepare request options
        let requestOptions = {
            method: 'POST',
            headers: {},
        };

        // Check if photo is a Base64 string (data URI)
        // Telegram requires multipart/form-data for file uploads
        if (body.photo && typeof body.photo === 'string' && body.photo.startsWith('data:')) {
            try {
                // Construct FormData for multipart upload
                const formData = new FormData();

                // Add all other fields
                for (const key in body) {
                    if (key !== 'photo') {
                        // Handle complex objects (like reply_markup) by stringifying them
                        if (typeof body[key] === 'object') {
                            formData.append(key, JSON.stringify(body[key]));
                        } else {
                            formData.append(key, body[key]);
                        }
                    }
                }

                // Process Base64 Image
                // Fetch the data URI to get a Blob (Node 18+ supports this)
                const imageResponse = await fetch(body.photo);
                const blob = await imageResponse.blob();

                // Append photo with filename
                formData.append('photo', blob, 'image.jpg');

                requestOptions.body = formData;
                // Note: Do NOT set Content-Type header manually for FormData, 
                // fetch will set it with the correct boundary
            } catch (err) {
                console.error('Error processing Base64 image:', err);
                // Fallback to sending as JSON if blob conversion fails (likely to fail at Telegram end but worth a try)
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.body = JSON.stringify(body);
            }
        } else {
            // Standard JSON request (for text messages or URL-based photos)
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
