import { handler } from '../netlify/functions/ebook.mjs';
export default async function ebook(req, res) {
  const result = await handler({ httpMethod: req.method, queryStringParameters: req.query });
  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
  res.status(result.statusCode).send(result.body);
}
