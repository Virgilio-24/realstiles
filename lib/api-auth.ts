import { NextResponse } from 'next/server';
import { adminAuth, adminDb, getAdminDb } from './firebase-admin';

export type Caller = { uid: string; email: string | null; isAdmin: boolean };

// Verifica o ID token do Firebase enviado em `Authorization: Bearer <token>`
// (o cliente obtém-no com auth.currentUser.getIdToken(), ver lib/api-client.ts).
// Admin = clientes/{uid}.admin === true, a mesma definição do firestore.rules.
// Devolve o caller ou uma resposta 401/403 que a rota deve devolver tal e qual:
//
//   const caller = await autenticar(req, { admin: true });
//   if (caller instanceof NextResponse) return caller;
export async function autenticar(req: Request, opts: { admin?: boolean } = {}): Promise<Caller | NextResponse> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  let uid: string;
  let email: string | null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email ?? null;
  } catch {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }

  const db = getAdminDb();
  const perfil = db ? await db.collection('clientes').doc(uid).get() : null;
  const isAdmin = perfil?.data()?.admin === true;

  if (opts.admin && !isAdmin) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }
  return { uid, email, isAdmin };
}

// Atalho para rotas só de admin: devolve a resposta de erro, ou null se ok.
export async function exigirAdmin(req: Request): Promise<NextResponse | null> {
  const caller = await autenticar(req, { admin: true });
  return caller instanceof NextResponse ? caller : null;
}

// Encomenda à qual o caller tem acesso (a sua, ou qualquer uma se for admin).
// Devolve null se não existir ou não lhe pertencer.
export async function encomendaDoCaller(caller: Caller, encomendaId: string) {
  const snap = await adminDb.collection('encomendas').doc(encomendaId).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (!caller.isAdmin && data.cliente_id !== caller.uid) return null;
  return data;
}
