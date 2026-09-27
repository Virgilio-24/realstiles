import { NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/api-auth';
import { sincronizarCategoriasAtivas } from '@/lib/produtos';

export async function POST(req: Request) {
  const negado = await exigirAdmin(req);
  if (negado) return negado;

  try {
    await sincronizarCategoriasAtivas();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
