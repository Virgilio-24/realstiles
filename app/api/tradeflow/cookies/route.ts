import { NextRequest, NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/api-auth';

const TF_URL = () => process.env.TRADEFLOW_API_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  const negado = await exigirAdmin(req);
  if (negado) return negado;

  try {
    const body = await req.json();
    const res = await fetch(`${TF_URL()}/cookies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, token: process.env.COOKIE_CAPTURE_TOKEN }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
