import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params;
  const sid = String(shareId ?? '').trim();
  if (!sid) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const db = getAdminDb();
  const snap = await db.collection('customer_wishlists').get();

  // NOTE: This is an MVP. For scale, add an index collection mapping shareId -> uid/listId.
  // For now we scan wishlists and find the first matching shareId.
  let foundList: unknown = null;
  for (const doc of snap.docs) {
    const data = doc.data() as { lists?: Array<unknown> };
    const list = (data.lists ?? []).find(
      (l: any) => String(l?.shareId ?? '') === sid
    );
    if (list) {
      foundList = list;
      break;
    }
  }

  if (!foundList) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ list: foundList });
}

