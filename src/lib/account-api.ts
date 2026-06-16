'use client';

import { auth } from '@/lib/firebase';

async function userApiFetch(path: string, init: RequestInit): Promise<Response> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in');

  const token = await user.getIdToken(true);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res;
}

export async function getAccountDashboard() {
  const res = await userApiFetch('/api/account/dashboard', { method: 'GET' });
  return (await res.json()) as {
    profile: { displayName: string | null; email: string | null; photoUrl: string | null };
    points: { balance: number; tier: 'Silver' | 'Gold' | 'Platinum' | 'Black'; nextTierAt: number };
    recentOrders: Array<{
      id: string;
      status: string;
      total_amount: number;
      currency: string;
      created_at: string;
    }>;
    wishlist: { count: number; productIds: string[] };
  };
}

export async function getAccountProfile() {
  const res = await userApiFetch('/api/account/profile', { method: 'GET' });
  return (await res.json()) as {
    profile: {
      displayName: string | null;
      email: string | null;
      phone: string | null;
      photoUrl: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

export async function updateAccountProfile(input: { displayName?: string; phone?: string; photoUrl?: string }) {
  const res = await userApiFetch('/api/account/profile', { method: 'PUT', body: JSON.stringify(input) });
  return (await res.json()) as { ok: true };
}

export async function getAccountWishlist() {
  const res = await userApiFetch('/api/account/wishlist', { method: 'GET' });
  return (await res.json()) as { productIds: string[] };
}

export async function setAccountWishlist(productIds: string[]) {
  const res = await userApiFetch('/api/account/wishlist', {
    method: 'PUT',
    body: JSON.stringify({ productIds }),
  });
  return (await res.json()) as { ok: true };
}

export async function getMyOrders() {
  const res = await userApiFetch('/api/account/orders', { method: 'GET' });
  return (await res.json()) as {
    orders: Array<{
      id: string;
      status: string;
      total_amount: number;
      currency: string;
      created_at: string;
      updated_at: string;
    }>;
  };
}

export async function getMyOrderDetails(orderId: string) {
  const res = await userApiFetch(`/api/account/orders/${encodeURIComponent(orderId)}`, { method: 'GET' });
  return (await res.json()) as {
    order: Record<string, unknown>;
    items: Array<Record<string, unknown>>;
    products: Array<Record<string, unknown>>;
  };
}

export async function getNotificationCenter() {
  const res = await userApiFetch('/api/account/notifications', { method: 'GET' });
  return (await res.json()) as {
    items: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      href: string | null;
      read_at: string | null;
      created_at: string;
    }>;
    unread: number;
  };
}

export async function markNotificationRead(id: string) {
  const res = await userApiFetch('/api/account/notifications', { method: 'PATCH', body: JSON.stringify({ id }) });
  return (await res.json()) as { ok: true };
}

export async function markAllNotificationsRead() {
  const res = await userApiFetch('/api/account/notifications', { method: 'PATCH', body: JSON.stringify({ markAllRead: true }) });
  return (await res.json()) as { ok: true };
}

export async function getPreferences() {
  const res = await userApiFetch('/api/account/preferences', { method: 'GET' });
  return (await res.json()) as {
    preferences: {
      channels: { email: boolean; in_app: boolean };
      topics: { orders: boolean; wishlist: boolean; rewards: boolean; promotions: boolean; new_arrivals: boolean };
      created_at: string;
      updated_at: string;
    };
  };
}

export async function updatePreferences(input: {
  channels?: { email?: boolean; in_app?: boolean };
  topics?: { orders?: boolean; wishlist?: boolean; rewards?: boolean; promotions?: boolean; new_arrivals?: boolean };
}) {
  const res = await userApiFetch('/api/account/preferences', { method: 'PUT', body: JSON.stringify(input) });
  return (await res.json()) as { ok: true };
}

export type WishlistList = {
  id: string;
  name: string;
  productIds: string[];
  shareId: string | null;
  created_at: string;
  updated_at: string;
};

export async function getWishlists() {
  const res = await userApiFetch('/api/account/wishlists', { method: 'GET' });
  return (await res.json()) as {
    lists: WishlistList[];
    defaultListId: string;
    created_at: string;
    updated_at: string;
  };
}

export async function createWishlist(name: string) {
  const res = await userApiFetch('/api/account/wishlists', { method: 'POST', body: JSON.stringify({ name }) });
  return (await res.json()) as { ok: true; id: string };
}

export async function updateWishlists(input: { defaultListId?: string; lists?: Array<Partial<WishlistList>> }) {
  const res = await userApiFetch('/api/account/wishlists', { method: 'PUT', body: JSON.stringify(input) });
  return (await res.json()) as { ok: true };
}

export async function deleteWishlist(id: string) {
  const res = await userApiFetch('/api/account/wishlists', { method: 'DELETE', body: JSON.stringify({ id }) });
  return (await res.json()) as { ok: true };
}

export async function syncWishlistAlerts() {
  const res = await userApiFetch('/api/account/wishlists/alerts/sync', { method: 'POST' });
  return (await res.json()) as { ok: true; generated: number };
}

