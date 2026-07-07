import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Deprecated: desktop pairing via localhost callback.
  // New flow: /connect?uuid=... which links user <-> node_ip via Supabase.
  const { uuid } = req.query;
  if (typeof uuid !== 'string' || uuid.trim().length === 0) {
    return res.status(400).json({ error: 'Missing uuid parameter.' });
  }

  return res.redirect(`/connect?uuid=${encodeURIComponent(uuid.trim())}`);
}
