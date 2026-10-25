const LIMITS = { name: 100, email: 254, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: Record<string, unknown>, status = 200, headers: HeadersInit = {}): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!res.ok) return false;
  const data = await res.json<{ success: boolean }>();
  return data.success === true;
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: 'method not allowed' }, 405, { allow: 'POST' });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'invalid form data' }, 400);
  }

  const field = (key: string) => String(form.get(key) ?? '').trim();
  const name = field('name');
  const email = field('email');
  const message = field('message');

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (field('website')) return json({ ok: true });

  if (!name || !email || !message) return json({ ok: false, error: 'all fields are required' }, 400);
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return json({ ok: false, error: 'message is too long' }, 400);
  }
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'that email does not look right' }, 400);

  const token = field('cf-turnstile-response');
  const human = token && (await verifyTurnstile(token, env.TURNSTILE_SECRET, request.headers.get('cf-connecting-ip')));
  if (!human) return json({ ok: false, error: 'spam check failed, please try again' }, 403);

  try {
    await env.EMAIL.send({
      from: { email: env.CONTACT_FROM, name: 'jovantomovic.com' },
      to: env.CONTACT_TO,
      replyTo: { email, name },
      subject: `[jovantomovic.com] message from ${name.replace(/[\r\n]+/g, ' ')}`,
      text: `${message}\n\n--\n${name} <${email}>`,
    });
  } catch (err) {
    console.error('contact: send failed', err);
    return json({ ok: false, error: 'could not send right now, please email me instead' }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') return handleContact(request, env);
    if (pathname.startsWith('/api/')) return json({ ok: false, error: 'not found' }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
