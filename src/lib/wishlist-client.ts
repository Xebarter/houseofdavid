'use client';

import { auth } from '@/lib/firebase';
import { getWishlists, updateWishlists } from '@/lib/account-api';

let cache:
  | {
      lists: Array<{ id: string; productIds: string[] }>;
      defaultListId: string;
    }
  | null = null;

async function loadWishlists() {
  if (cache) return cache;
  const wl = await getWishlists();
  cache = { lists: wl.lists.map((l) => ({ id: l.id, productIds: l.productIds })), defaultListId: wl.defaultListId };
  return cache;
}

export async function addToDefaultWishlist(productId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('AUTH_REQUIRED');

  const wl = await loadWishlists();
  const listId = wl.defaultListId || wl.lists[0]?.id || 'default';
  const list = wl.lists.find((l) => l.id === listId) ?? wl.lists[0];
  const nextIds = Array.from(new Set([...(list?.productIds ?? []), productId]));

  await updateWishlists({ defaultListId: listId, lists: [{ id: listId, productIds: nextIds }] });
  cache = { ...wl, lists: wl.lists.map((l) => (l.id === listId ? { ...l, productIds: nextIds } : l)) };
  return { listId };
}

export async function isInDefaultWishlist(productId: string): Promise<boolean> {
  try {
    const wl = await loadWishlists();
    const listId = wl.defaultListId || wl.lists[0]?.id || 'default';
    const list = wl.lists.find((l) => l.id === listId) ?? wl.lists[0];
    return (list?.productIds ?? []).includes(productId);
  } catch {
    return false;
  }
}

