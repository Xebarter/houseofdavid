'use client';

import { auth } from '@/lib/firebase';

function getSessionId(): string {
  const key = 'hod_session_id';
  const existing = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  if (existing) return existing;
  const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  if (typeof window !== 'undefined') window.localStorage.setItem(key, id);
  return id;
}

export type AnalyticsEventType =
  | 'product_view'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'purchase'
  | 'collection_view'
  | 'collection_filter';

export async function trackEvent(event: {
  type: AnalyticsEventType;
  product_id?: string;
  wishlist_id?: string;
  order_id?: string;
  value?: number;
  currency?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const session_id = getSessionId();
    const path = typeof window !== 'undefined' ? window.location.pathname : null;
    const referrer = typeof document !== 'undefined' ? document.referrer : null;

    // If signed in, include Authorization; if not, send anonymously.
    const user = auth.currentUser;
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (user) {
      const token = await user.getIdToken(false);
      headers.set('Authorization', `Bearer ${token}`);
    }

    await fetch('/api/analytics/events', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...event, session_id, path, referrer }),
    });
  } catch {
    // analytics must never break UX
  }
}

