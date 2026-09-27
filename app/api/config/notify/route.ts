import { NextRequest, NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// O login por WhatsApp só existe se a conta TradeFlow tiver o WhatsApp activo.
// Calculado aqui para a página pública /conta não precisar de chamar
// /api/tradeflow/conta, que é só de admin (devolve a license_key).
async function whatsappAtivo(): Promise<boolean> {
  const tfUrl = process.env.TRADEFLOW_API_URL;
  const tfToken = process.env.TRADEFLOW_ADMIN_TOKEN;
  if (!tfUrl || !tfToken) return false;
  try {
    const snap = await adminDb.collection('configuracoes').doc('tradeflow').get();
    const accountId = snap.data()?.account_id;
    if (!accountId) return false;
    const res = await fetch(`${tfUrl}/admin/accounts/${accountId}`, {
      headers: { 'x-admin-token': tfToken },
      cache: 'no-store',
    });
    return res.ok && (await res.json()).whatsapp_ativo === true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const [snap, ativo] = await Promise.all([
      adminDb.collection('config').doc('notify').get(),
      whatsappAtivo(),
    ]);
    const data = snap.exists ? snap.data() : {};
    return NextResponse.json({ whatsapp_login: data?.whatsapp_login ?? false, whatsapp_ativo: ativo });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const negado = await exigirAdmin(req);
  if (negado) return negado;

  try {
    const body = await req.json();
    await adminDb.collection('config').doc('notify').set(body, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
