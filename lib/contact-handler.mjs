import {createHash} from 'node:crypto';

export const CONTACT_INBOX = 'info@wclcricket.com';
export const CONTACT_TOPICS = ['General enquiry', 'Tickets & matchday', 'Media & press', 'Partnerships', 'Privacy request'];
const MAX_BODY = 16384;
const EMAIL = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const UNAVAILABLE = 'Online enquiries are unavailable right now. Please email info@wclcricket.com.';

function configuration(env) {
  const origins = (env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(s => {
    try { const u = new URL(s); return u.origin === s && (u.protocol === 'https:' || (env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(u.hostname))); } catch { return false; }
  });
  const available = env.CONTACT_ENABLED === 'true' && Boolean(env.RESEND_API_KEY && EMAIL.test(env.CONTACT_FROM_EMAIL || '') && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY && origins.length);
  return {available, origins, siteKey: available ? env.TURNSTILE_SITE_KEY : null};
}

export function validateContact(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {errors: {form: 'Check your enquiry and try again.'}};
  const fields = {};
  for (const key of ['name', 'email', 'topic', 'message']) fields[key] = typeof value[key] === 'string' ? value[key].trim() : '';
  const errors = {};
  if (fields.name.length < 2 || fields.name.length > 100 || /[\r\n\x00-\x1f]/.test(fields.name)) errors.name = 'Enter your name (2–100 characters).';
  if (fields.email.length > 254 || !EMAIL.test(fields.email)) errors.email = 'Enter a valid email address.';
  if (!CONTACT_TOPICS.includes(fields.topic)) errors.topic = 'Choose an enquiry topic.';
  if (fields.message.length < 10 || fields.message.length > 5000 || /\x00/.test(fields.message)) errors.message = 'Write a message between 10 and 5,000 characters.';
  if (value.privacy !== true) errors.privacy = 'Please read and acknowledge the Privacy Policy.';
  if (value.website) errors.form = 'We could not accept this enquiry. Please contact us by email.';
  if (typeof value.requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(value.requestId)) errors.form = 'Refresh the page and try again.';
  if (typeof value.token !== 'string' || !value.token || value.token.length > 2048) errors.verification = 'Complete the security check and try again.';
  return {fields, errors};
}

function reply(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (Number(req.headers['content-length'] || 0) > MAX_BODY) throw Object.assign(new Error(), {status: 413});
  // Vercel parses JSON bodies before the handler; Vite supplies a raw stream.
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > MAX_BODY) throw Object.assign(new Error(), {status: 413});
    return JSON.parse(raw);
  }
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error(), {status: 413});
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

// Shared by the isolated Vercel function and Vite. Never imports the private CMS/database.
export function createContactHandler({env = process.env, fetcher = globalThis.fetch} = {}) {
  return async function contact(req, res) {
    const config = configuration(env);
    if (req.method === 'GET') return reply(res, 200, {available: config.available, siteKey: config.siteKey, email: CONTACT_INBOX});
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(res, 405, {error: 'Method not allowed.'}); }
    if (!config.available) return reply(res, 503, {error: UNAVAILABLE});
    const origin = req.headers.origin;
    if (!config.origins.includes(origin)) return reply(res, 403, {error: 'Please send your enquiry from the WCL website.'});
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reply(res, 415, {error: 'Use the contact form to send your enquiry.'});
    let body;
    try { body = await readBody(req); } catch (error) { return reply(res, error.status || 400, {error: error.status === 413 ? 'Your enquiry is too long.' : 'Check your enquiry and try again.'}); }
    const {fields, errors} = validateContact(body);
    if (Object.keys(errors).length) return reply(res, 400, {error: 'Please check the highlighted fields.', fields: errors});
    try {
      const verified = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({secret: env.TURNSTILE_SECRET_KEY, response: body.token}), signal: AbortSignal.timeout(8000),
      });
      if (!verified.ok) return reply(res, 503, {error: 'The security check is temporarily unavailable. Please try again or email us.'});
      const check = await verified.json();
      if (!check.success || check.action !== 'contact' || check.hostname !== new URL(origin).hostname) return reply(res, 400, {error: 'Please complete a new security check.', fields: {verification: 'The security check expired or was not accepted.'}});
      // Payload-bound idempotency survives function restarts and uncertain network retries.
      const text = `WCL website enquiry\n\nName: ${fields.name}\nEmail: ${fields.email}\nTopic: ${fields.topic}\n\n${fields.message}\n\nPrivacy notice acknowledged: website-2026-09-11\nReference: ${body.requestId}`;
      const key = createHash('sha256').update(body.requestId + text).digest('hex');
      const sent = await fetcher('https://api.resend.com/emails', {
        method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Idempotency-Key': `wcl-contact/${key}`},
        body: JSON.stringify({from: `WCL Website <${env.CONTACT_FROM_EMAIL}>`, to: [CONTACT_INBOX], reply_to: fields.email, subject: `WCL enquiry · ${fields.topic}`, text}),
        signal: AbortSignal.timeout(12000),
      });
      if (!sent.ok) { if (sent.status === 429) res.setHeader('Retry-After', '60'); return reply(res, sent.status === 429 ? 429 : 502, {error: 'Your enquiry could not be confirmed. Wait a moment and retry, or email info@wclcricket.com.'}); }
      const receipt = await sent.json();
      if (!receipt.id) throw new Error('No provider receipt');
      // Accepted for delivery is not a guarantee of arrival in the recipient mailbox.
      return reply(res, 202, {ok: true, reference: body.requestId});
    } catch {
      // Never log or echo credentials, messages, challenge tokens or provider responses.
      return reply(res, 502, {error: 'We could not confirm your enquiry. Please retry without changing your message, or email info@wclcricket.com.'});
    }
  };
}
