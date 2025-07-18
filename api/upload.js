import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    // 1) Read the raw bytes from the request
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // 2) Build the multipart form
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'snapshot.jpg',
      contentType: 'image/jpeg'
    });
    form.append(
      'payload_json',
      JSON.stringify({ content: '📸 New snapshot!' })
    );

    // 3) Send to Discord
    const discordRes = await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error('Discord error:', errText);
      return res.status(discordRes.status).send(errText);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Function error:', err);
    res.status(500).send(err.message);
  }
}
