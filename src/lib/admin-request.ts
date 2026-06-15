import type { NextRequest } from 'next/server';
import { verifyAdminToken } from './firebase-admin';

export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  return verifyAdminToken(authHeader.slice(7));
}
