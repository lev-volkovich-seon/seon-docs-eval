export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SEON_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SEON_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.seon.io/SeonRestService/fraud-api/v2/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'SEON API unreachable', detail: err.message });
  }
}
