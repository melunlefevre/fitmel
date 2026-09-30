export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Méthode non autorisée.' });
  const key = process.env.STRIPE_SECRET_KEY || process.env.stripe;
  const origin = process.env.SITE_URL || process.env.URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
  if (!key || !origin || !process.env.FITMEL_EBOOK_KEY) return reply(503, { error: 'Le paiement de l’ebook sera bientôt disponible. Reviens ici prochainement.' });
  try {
    const base = new URL(origin);
    if (base.protocol !== 'https:') throw new Error('Invalid site URL');
    const params = new URLSearchParams({
      mode: 'payment',
      success_url: `${base.origin}/ebook?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base.origin}/#offres`,
      'metadata[fitmel_offer]': 'ebook_v1',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': '2500',
      'line_items[0][price_data][product_data][name]': 'FITMEL — Comprendre ta perte de poids',
      'line_items[0][quantity]': '1'
    });
    const result = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params
    });
    const session = await result.json();
    if (!result.ok || !session.url) throw new Error('Checkout failed');
    return reply(200, { url: session.url });
  } catch {
    return reply(502, { error: 'Le paiement est momentanément indisponible. Réessaie dans quelques instants.' });
  }
};
