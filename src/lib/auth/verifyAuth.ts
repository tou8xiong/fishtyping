import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

const ADMIN_EMAIL = 'touxhk@gmail.com';
const ADMIN_ID = '8OZdxsSF8gY5ysBogP5yqkTMaZI3';

export interface AuthUser {
  uid: string;
  email: string | null;
}

/** Extract and verify the Firebase ID token from the Authorization header. */
export async function verifyAuth(request: NextRequest | Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
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
