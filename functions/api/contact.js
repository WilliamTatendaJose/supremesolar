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
  const email = (data.email || '').toString().trim();
  const subject = (data.subject || 'Website enquiry').toString().trim();
  const message = (data.message || '').toString().trim();
  const honeypot = (data.company || '').toString().trim();

  // Honeypot field: bots fill hidden fields, humans never see it.
  if (honeypot) {
    return Response.json({ success: true, message: 'Your message has been sent.' });
  }

  if (!name || !email || !message) {
    return Response.json({ success: false, message: 'Please fill in your name, email, and message.' }, { status: 400 });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return Response.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }

  if (env.LEADS_DB) {
    try {
      await env.LEADS_DB.prepare(
        'INSERT INTO leads (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(name, email, subject, message, new Date().toISOString()).run();
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
          reply_to: email,
          subject: `Website enquiry: ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
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
    return Response.json({ success: false, message: 'Unable to send message right now. Please contact us directly.' }, { status: 502 });
  }

  return Response.json({ success: true, message: 'Thanks ' + name + ', your message has been sent. We will get back to you shortly.' });
}

export async function onRequestGet() {
  return new Response('Method Not Allowed', { status: 405 });
}
