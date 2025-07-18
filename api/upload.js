import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  try {
    // 1) Read the raw request body into a string
    let bodyText = '';
    for await (const chunk of req) {
      bodyText += chunk;
    }

    // 2) Parse it as JSON
    let parsed;
    try {
      parsed = JSON.parse(bodyText);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
    const image = parsed.image;
    if (!image) throw new Error('No image field in JSON');

    // 3) Decode the Data‑URL
    const match = image.match(/^data:(.+);base64,(.+)$/);
    if (!match) throw new Error('Invalid Data‑URL format');
    const [, mimeType, b64] = match;
    const buffer = Buffer.from(b64, 'base64');

    // 4) Build the multipart form for Discord
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'snapshot.jpg',
      contentType: mimeType
    });
    form.append('payload_json', JSON.stringify({
      content: '📸 New snapshot!'
    }));

    // 5) Send to Discord
    const discordRes = await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error('Discord error:', text);
      return res.status(502).send(text);
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).send(err.message);
  }
}

// Let Vercel serve this function without special parsing
export const config = { api: { bodyParser: false } };
