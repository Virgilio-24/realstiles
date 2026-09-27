import { NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';

const TF_URL = () => process.env.TRADEFLOW_API_URL || 'http://localhost:3000';
const TF_TOKEN = () => process.env.TRADEFLOW_ADMIN_TOKEN || '';

export async function POST(req: Request) {
  const negado = await exigirAdmin(req);
  if (negado) return negado;

  try {
    const snap = await adminDb.collection('configuracoes').doc('tradeflow').get();
    const accountId = snap.data()?.account_id;
    if (!accountId) return NextResponse.json({ error: 'Sem conta TradeFlow associada' }, { status: 404 });

    const res = await fetch(`${TF_URL()}/admin/accounts/${accountId}/renew`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': TF_TOKEN() },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`TradeFlow ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
