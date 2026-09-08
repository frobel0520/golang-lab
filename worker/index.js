const UPSTREAM = 'https://go.dev/_/compile';
const MAX_BYTES = 128 * 1024;

const worker = {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const headers = { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'Origin' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405, headers);
    if (origin !== '*' && request.headers.get('origin') && request.headers.get('origin') !== origin) return json({ error: 'Origin Not Allowed' }, 403, headers);
    const length = Number(request.headers.get('content-length') || 0);
    if (length > MAX_BYTES) return json({ error: 'Request too large' }, 413, headers);
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return json({ error: 'Request too large' }, 413, headers);
    let input;
    try { input = JSON.parse(new TextDecoder().decode(body)); } catch { return json({ error: 'Invalid JSON' }, 400, headers); }
    if (typeof input?.code !== 'string' || !input.code.trim()) return json({ error: 'code is required' }, 400, headers);
    const form = new URLSearchParams({ body: input.code, version: '2' });
    try {
      const upstream = await fetch(UPSTREAM, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form, signal: AbortSignal.timeout(8000) });
      const text = await upstream.text();
      return new Response(text, { status: upstream.status, headers: { ...headers, 'content-type': upstream.headers.get('content-type') || 'application/json' } });
    } catch (error) { return json({ error: 'Upstream Go service unavailable', detail: String(error) }, 502, headers); }
  }
};

export default worker;

function json(value, status, headers) { return new Response(JSON.stringify(value), { status, headers: { ...headers, 'content-type': 'application/json' } }); }
