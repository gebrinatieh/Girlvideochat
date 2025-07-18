import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  try {
    // 1) Get the Data‑URL from JSON
    const { image } = await req.json();
    if (!image) throw new Error('No image in request');

    // 2) Extract MIME type & base64
    const match = image.match(/^data:(.+);base64,(.+)$/);
    if (!match) throw new Error('Invalid Data‑URL');

    const [, mimeType, b64] = match;
    const buffer = Buffer.from(b64, 'base64');

    // 3) Build Discord form
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'snapshot.jpg',
      contentType: mimeType
    });
    form.append('payload_json', JSON.stringify({
      content: '📸 New snapshot!'
    }));

    // 4) POST to your webhook
    const discordRes = await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error('Discord error:', errText);
      return res.status(502).send(errText);
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('Function error:', err);
    res.status(500).send(err.message);
  }
}

// Tell Vercel to parse JSON automatically
export const config = { api: { bodyParser: true } };
