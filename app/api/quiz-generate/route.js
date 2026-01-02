import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(req) {
  const url = new URL('/api/quiz', req.url);
  return NextResponse.redirect(url, { status: 307 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const target = new URL('/api/quiz', request.url);
    const resp = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.text();
    return new Response(data, { status: resp.status, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Quiz-generate proxy error:', error);
    return NextResponse.json({ error: error.message || 'Failed to proxy request' }, { status: 500 });
  }
}
