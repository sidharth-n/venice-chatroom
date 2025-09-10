// Vercel Edge Function: CORS-friendly image proxy for production
// Usage: /api/proxy-photo?url=<encoded-absolute-url>
export const config = { runtime: 'edge' };

const ALLOWED_HOSTS = new Set(['outerface.venice.ai']);

export default async function handler(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) {
      return new Response('Missing url', { status: 400 });
    }

    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return new Response('Invalid url', { status: 400 });
    }

    if (!ALLOWED_HOSTS.has(target.hostname)) {
      return new Response('Host not allowed', { status: 400 });
    }

    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: {},
      cache: 'no-store',
      // Edge runtime uses the Fetch API; credentials omitted by default
    });

    if (!upstream.ok) {
      return new Response(`Upstream error ${upstream.status}`, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Vary': 'Origin',
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
    });

    // Stream the body through to avoid buffering
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response('Proxy error', { status: 500 });
  }
}
