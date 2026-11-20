import { env } from '../../config.js';

export function emailDeliveryConfigured() {
  return Boolean(env.RESEND_API_KEY && env.ADMIN_SECURITY_EMAIL_FROM);
}

export async function sendApplicationEmail(idempotencyKey: string, email: string, subject: string, text: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ from: env.ADMIN_SECURITY_EMAIL_FROM, to: [email], subject, text }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error('Email delivery request failed');
}
