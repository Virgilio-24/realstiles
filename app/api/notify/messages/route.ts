import { NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/api-auth';

const API = process.env.NOTIFY_API_URL || 'http://localhost:3010';
const KEY = process.env.NOTIFY_API_KEY || '';

export async function GET(req: Request) {
  const negado = await exigirAdmin(req);
  if (negado) return negado;

  try {
    const res = await fetch(`${API}/messages?limite=50`, {
      headers: { Authorization: `Bearer ${KEY}` },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ mensagens: [], total: 0 });
  }
}
