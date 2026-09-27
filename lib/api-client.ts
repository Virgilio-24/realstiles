import { auth } from './firebase';

// fetch para as rotas /api: junta o ID token do Firebase em
// `Authorization: Bearer <token>` quando há sessão (ver lib/api-auth.ts).
// Espera que o Firebase restaure a sessão, para as chamadas feitas logo ao
// montar a página não saírem sem token.
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
