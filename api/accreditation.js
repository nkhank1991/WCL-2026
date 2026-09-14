import { allowedAccreditationRoute } from '../lib/accreditation-routes.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const fail = (status, error) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error })); };
  if (!['GET','POST'].includes(req.method)) return fail(405, 'Method not allowed.');
  const incoming = new URL(req.url, 'https://www.wclcricket.com');
  const route = String(req.query?.accreditationPath || incoming.searchParams.get('accreditationPath') || '');
  if (!allowedAccreditationRoute(route)) return fail(404, 'Not found.');
  if (!process.env.ACCREDITATION_BACKEND_ORIGIN || !process.env.ACCREDITATION_PROXY_SECRET) return fail(503, 'The accreditation service is not connected. Applications have not opened.');
  try {
    const backend = new URL(process.env.ACCREDITATION_BACKEND_ORIGIN);
    if (backend.protocol !== 'https:' || backend.username || backend.password || backend.pathname !== '/' || backend.search || backend.hash) return fail(503, 'The accreditation service configuration needs review.');
    const headers = {
      'X-WCL-Proxy-Key': process.env.ACCREDITATION_PROXY_SECRET,
      'X-WCL-Client-IP': String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0],
    };
    for (const key of ['origin','x-csrf-token','content-type']) if (req.headers[key]) headers[key] = req.headers[key];
    // Never forward the editorial CMS session to the accreditation service.
    const cookie = req.headers.cookie?.split(';').map(c => c.trim()).find(c => c.startsWith('wcl_accreditation_session='));
    if (cookie) headers.cookie = cookie;
    let body;
    if (req.method === 'POST') {
      if (!String(req.headers['content-type']).includes('application/json')) return fail(415, 'JSON body required.');
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      if (Buffer.byteLength(body) > 3 * 1024 * 1024) return fail(413, 'Choose a headshot below 2 MB.');
    }
    const response = await fetch(new URL('/api/' + route, backend), { method: req.method, headers, body, redirect: 'error', signal: AbortSignal.timeout(20000) });
    res.statusCode = response.status;
    for (const key of ['content-type','x-frame-options']) if (response.headers.has(key)) res.setHeader(key, response.headers.get(key));
    const session = response.headers.get('set-cookie');
    if (session?.startsWith('wcl_accreditation_session=')) res.setHeader('set-cookie', session);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { fail(502, 'The accreditation service could not be reached. Please try again; do not assume the application was received without a receipt.'); }
}
