export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const contentType = request.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    }

    const name = (data.name || '').toString().trim();
    const email = (data.email || '').toString().trim();
    const subject = (data.subject || 'Website enquiry').toString().trim();
    const message = (data.message || '').toString().trim();

    if (!name || !email || !message) {
      return Response.json({ success: false, message: 'Please fill in your name, email, and message.' }, { status: 400 });
    }

    const payload = {
      from: `${name} <${email}>`,
      to: env.TO_EMAIL,
      subject: `Website enquiry: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.MAILCHANNELS_API_KEY}`
      },
      body: JSON.stringify({ personalizations: [{ to: [{ email: env.TO_EMAIL }] }], from: { email: env.FROM_EMAIL, name: 'Supreme Solar Systems' }, subject: payload.subject, content: [{ type: 'text/plain', value: payload.text }] })
    });

    if (!response.ok) {
      return Response.json({ success: false, message: 'Unable to send message right now.' }, { status: 502 });
    }

    return Response.json({ success: true, message: 'Your message has been sent.' });
  }
};
