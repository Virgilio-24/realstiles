import { NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/api-auth';

const API = process.env.NOTIFY_API_URL || 'http://localhost:3010';
const KEY = process.env.NOTIFY_API_KEY || '';

export async function GET(req: Request) {
  const negado = await exigirAdmin(req);
  if (negado) return negado;

  try {
    const res = await fetch(`${API}/status`, {
      headers: { Authorization: `Bearer ${KEY}` },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'desligado', qr: null, numero: null, mensagens_hoje: 0 });
  }
}
