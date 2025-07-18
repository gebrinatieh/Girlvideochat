import fetch from 'node-fetch';
import FormData from 'form-data';

// Tell Vercel not to parse body for us:
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // Read raw request body (the file upload)
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  // Build form-data to Discord
  const form = new FormData();
  form.append('file', buffer, 'snapshot.jpg');
  form.append('payload_json', JSON.stringify({
    content: '📸 New snapshot!'
  }));

  const discordRes = await fetch(process.env.DISCORD_WEBHOOK, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  if (!discordRes.ok) {
    console.error(await discordRes.text());
    return res.status(502).send('Discord error');
  }
  res.status(200).send('OK');
}
