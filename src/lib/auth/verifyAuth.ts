import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = 'touxhk@gmail.com';
const ADMIN_ID = '8OZdxsSF8gY5ysBogP5yqkTMaZI3';

export interface AuthUser {
  uid: string;
  email: string | null;
}

async function verifyTokenViaRest(token: string): Promise<AuthUser | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const u = data?.users?.[0];
    if (!u) return null;
    return { uid: u.localId, email: u.email ?? null };
  } catch {
    return null;
  }
}

async function verifyTokenViaAdminSDK(token: string): Promise<AuthUser | null> {
  try {
    const { getAdminAuth } = await import('@/lib/firebase/admin');
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

/** Extract and verify the Firebase ID token from the Authorization header. */
export async function verifyAuth(request: NextRequest | Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    const result = await verifyTokenViaAdminSDK(token);
    if (result) return result;
  }

  // Fall back to Firebase REST API verification (no service account needed)
  return verifyTokenViaRest(token);
}

/** Verify the token AND confirm the caller is the admin. */
export async function verifyAdmin(request: NextRequest | Request): Promise<AuthUser | null> {
  const user = await verifyAuth(request);
  if (!user) return null;
  if (user.email !== ADMIN_EMAIL && user.uid !== ADMIN_ID) return null;
  return user;
}

/** Standard 401 response. */
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
