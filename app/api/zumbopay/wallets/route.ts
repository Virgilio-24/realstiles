import { NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/api-auth';

const ZP_BASE = 'https://zumbopay.com/api/public/v1';

export async function GET(req: Request) {
  const negado = await exigirAdmin(req);
  if (negado) return negado;

  try {
    const res = await fetch(`${ZP_BASE}/wallets`, {
      headers: {
        'Authorization': `Bearer ${process.env.ZUMBOPAY_API_KEY || ''}`,
        'X-Merchant-Id': process.env.ZUMBOPAY_MERCHANT_ID || '',
      },
      cache: 'no-store',
    });

    const body = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: body.error?.message || 'Erro ao obter wallets' },
        { status: res.status },
      );
    }

    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
