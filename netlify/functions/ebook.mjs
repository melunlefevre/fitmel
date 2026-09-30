import { createDecipheriv } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
const unavailable = (statusCode, message) => ({ statusCode, headers, body: `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ebook FITMEL</title><body style="background:#050505;color:#fff;font-family:system-ui;margin:0;padding:60px 24px;line-height:1.6"><main style="max-width:600px;margin:auto"><h1>Ebook FITMEL</h1><p>${message}</p><a href="/#offres" style="color:#dcc6a8">Retour aux offres</a></main></body></html>` });
export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return unavailable(405, 'Méthode non autorisée.');
  const id = event.queryStringParameters?.session_id;
  if (!id || !/^cs_(test_|live_)?[a-zA-Z0-9]+$/.test(id)) return unavailable(403, 'La lecture de l’ebook est réservée aux acheteurs. Après ton paiement, Stripe te redirige vers ton guide.');
  if (!process.env.STRIPE_SECRET_KEY || !process.env.FITMEL_EBOOK_KEY) return unavailable(503, 'La vérification du paiement est momentanément indisponible. Conserve ton lien et réessaie plus tard.');
  try {
    const result = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } });
    if (!result.ok) return unavailable(403, 'Ce lien d’accès n’a pas pu être validé.');
    const session = await result.json();
    if (session.payment_status !== 'paid' || session.mode !== 'payment' || session.currency !== 'eur' || session.amount_total !== 2500 || session.metadata?.fitmel_offer !== 'ebook_v1') return unavailable(403, 'Le paiement de cet ebook n’est pas confirmé. Si tu viens de payer, recharge cette page dans quelques instants.');
    const encrypted = JSON.parse(await readFile(new URL('./ebook-content.enc', import.meta.url), 'utf8'));
    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(process.env.FITMEL_EBOOK_KEY, 'base64'), Buffer.from(encrypted.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
    const body = Buffer.concat([decipher.update(Buffer.from(encrypted.data, 'base64')), decipher.final()]).toString('utf8');
    return { statusCode: 200, headers, body };
  } catch {
    return unavailable(503, 'Impossible de vérifier ton accès pour le moment. Conserve ton lien et réessaie dans quelques instants.');
  }
};
