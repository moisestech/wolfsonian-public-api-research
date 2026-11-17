export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const expected = process.env.DEMO_GATE_PASSWORD || '';
  if (!expected) {
    res.status(404).end();
    return;
  }
  let password = '';
  const body = req.body;
  if (body && typeof body === 'object') password = body.password || '';
  else if (typeof body === 'string' && body) {
    try { password = JSON.parse(body).password || ''; } catch { password = ''; }
  }
  if (password && password === expected) res.status(200).json({ ok: true });
  else res.status(401).json({ ok: false });
}
