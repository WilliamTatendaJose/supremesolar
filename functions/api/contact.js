// Cloudflare Pages Function: POST /api/contact
export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get('content-type') || '';
  let data;

  try {
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    }
  } catch {
    return Response.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const name = (data.name || '').toString().trim();
  const phone = (data.phone || '').toString().trim();
  const email = (data.email || '').toString().trim();
  const service = (data.service || '').toString().trim();
  const location = (data.location || '').toString().trim();
  const subject = (data.subject || service || 'Website quote request').toString().trim();
  const source = (data.source || 'website').toString().trim().slice(0, 50);
  let message = (data.message || '').toString().trim();
  const honeypot = (data.company || '').toString().trim();

  // Honeypot: bots fill hidden fields, humans never see it.
  if (honeypot) {
    return Response.json({ success: true, message: 'Thanks! We will be in touch shortly.' });
  }

  if (!name || !phone) {
    return Response.json({ success: false, message: 'Please add your name and phone/WhatsApp number so we can reply.' }, { status: 400 });
  }

  // Basic phone sanity: allow +, spaces, 7-15 digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return Response.json({ success: false, message: 'That phone number looks off — please check it.' }, { status: 400 });
  }

  if (email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return Response.json({ success: false, message: 'Please enter a valid email address (or leave it blank).' }, { status: 400 });
    }
  }

  // Auto-build a useful message if the user only used the short hero form
  if (!message) {
    message = `Service: ${service || 'Not specified'}\nLocation: ${location || 'Not specified'}\nPhone: ${phone}`;
  }

  // Ensure new columns exist (safe migration for existing D1 DBs)
  if (env.LEADS_DB) {
    try {
      const cols = await env.LEADS_DB.prepare('PRAGMA table_info(leads)').all();
      const names = new Set((cols.results || []).map((c) => c.name));
      const alters = [];
      if (!names.has('phone')) alters.push('ALTER TABLE leads ADD COLUMN phone TEXT');
      if (!names.has('service')) alters.push('ALTER TABLE leads ADD COLUMN service TEXT');
      if (!names.has('location')) alters.push('ALTER TABLE leads ADD COLUMN location TEXT');
      if (!names.has('source')) alters.push('ALTER TABLE leads ADD COLUMN source TEXT');
      for (const sql of alters) {
        try { await env.LEADS_DB.prepare(sql).run(); } catch { /* already exists */ }
      }
    } catch (err) {
      console.error('Lead table migration failed', err);
    }
    try {
      await env.LEADS_DB.prepare(
        'INSERT INTO leads (name, phone, email, service, location, subject, message, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(name, phone, email, service, location, subject, message, source, new Date().toISOString()).run();
    } catch (err) {
      console.error('Failed to save lead to D1', err);
    }
  }

  let emailSent = false;
  if (env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `Supreme Solar Systems <${env.FROM_EMAIL}>`,
          to: [env.TO_EMAIL],
          reply_to: email || undefined,
          subject: `🔥 New quote request: ${service || subject} — ${name} (${location || 'no location'})`,
          text: `New website lead (${source})\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email || '-'}\nService: ${service || '-'}\nLocation: ${location || '-'}\n\nDetails:\n${message}`
        })
      });
      emailSent = response.ok;
      if (!response.ok) {
        console.error('Resend API error', await response.text());
      }
    } catch (err) {
      console.error('Failed to send email via Resend', err);
    }
  }

  if (!emailSent && !env.LEADS_DB) {
    return Response.json({ success: false, message: 'Unable to send right now. Please WhatsApp us on +263 771 557 002.' }, { status: 502 });
  }

  return Response.json({ success: true, message: `Thanks ${name}! We got your request and will WhatsApp/call you shortly.` });
}

export async function onRequestGet() {
  return new Response('Method Not Allowed', { status: 405 });
}
