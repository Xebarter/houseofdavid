import type { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export type VerifiedUser = {
  uid: string;
  email: string | null;
  name: string | null;
};

export async function verifyUserRequest(request: NextRequest): Promise<VerifiedUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: (decoded.email as string | undefined) ?? null,
      name: (decoded.name as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

