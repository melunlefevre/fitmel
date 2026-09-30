import { handler } from '../netlify/functions/checkout.mjs';
export default async function checkout(req, res) {
  const result = await handler({ httpMethod: req.method });
  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
  res.status(result.statusCode).send(result.body);
}
