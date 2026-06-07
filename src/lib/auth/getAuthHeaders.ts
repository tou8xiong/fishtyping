import { auth } from '@/lib/firebase/config';

/** Returns an Authorization header with the current user's Firebase ID token. */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
