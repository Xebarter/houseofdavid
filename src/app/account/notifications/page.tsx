'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, Settings } from 'lucide-react';
import {
  getNotificationCenter,
  getPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  updatePreferences,
} from '@/lib/account-api';

type Center = Awaited<ReturnType<typeof getNotificationCenter>>;
type Prefs = Awaited<ReturnType<typeof getPreferences>>['preferences'];

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-6 border border-white/5 bg-luxury-black/25 px-6 py-5 hover:border-luxury-gold/20 transition-colors"
    >
      <div className="text-left">
        <p className="text-sm text-luxury-cream">{label}</p>
        <p className="text-xs text-luxury-smoke mt-1">{hint}</p>
      </div>
      <span
        className={`h-6 w-11 border transition-colors ${
          checked ? 'bg-luxury-gold/20 border-luxury-gold/40' : 'bg-transparent border-white/10'
        }`}
      >
        <span
          className={`block h-5 w-5 mt-0.5 transition-transform ${
            checked ? 'translate-x-5 bg-luxury-gold' : 'translate-x-0.5 bg-white/40'
          }`}
        />
      </span>
    </button>
  );
}

export default function AccountNotificationsPage() {
  const [center, setCenter] = useState<Center | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([getNotificationCenter(), getPreferences()])
      .then(([c, p]) => {
        setCenter(c);
        setPrefs(p.preferences);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const unread = center?.unread ?? 0;
  const items = center?.items ?? [];

  const grouped = useMemo(() => {
    const today = new Date().toDateString();
    const sections: Array<{ label: string; items: typeof items }> = [
      { label: 'Today', items: [] },
      { label: 'Earlier', items: [] },
    ];
    items.forEach((n) => {
      const d = new Date(n.created_at || Date.now()).toDateString();
      (d === today ? sections[0] : sections[1]).items.push(n);
    });
    return sections.filter((s) => s.items.length > 0);
  }, [items]);

  const setPrefPatch = async (patch: Parameters<typeof updatePreferences>[0]) => {
    setSaving(true);
    setError(null);
    try {
      await updatePreferences(patch);
      const next = await getPreferences();
      setPrefs(next.preferences);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="luxury-label mb-3">Notifications</p>
            <h1 className="luxury-heading text-3xl font-light">Your updates</h1>
            <p className="text-sm text-luxury-smoke mt-3">
              Orders, wishlist alerts, and brand moments — in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wideish text-luxury-gold-muted border border-luxury-gold/20 px-3 py-1 bg-luxury-black/40">
              {loading ? '—' : `${unread} unread`}
            </span>
            <button
              type="button"
              onClick={async () => {
                await markAllNotificationsRead();
                refresh();
              }}
              disabled={loading || unread === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 text-[11px] uppercase tracking-wideish border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/30 transition-colors disabled:opacity-40"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 border border-white/5 bg-luxury-black/30 p-8 sm:p-10 text-center">
            <Bell className="w-7 h-7 text-luxury-gold/70 mx-auto mb-4" />
            <p className="luxury-heading text-xl font-light">All quiet</p>
            <p className="text-sm text-luxury-smoke mt-3 max-w-md mx-auto">
              When something important happens — an order update, a restock, a price drop — you’ll see it here.
            </p>
            <div className="mt-6">
              <Link href="/collections" className="luxury-btn-primary">
                Explore the collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {grouped.map((section) => (
              <div key={section.label}>
                <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke mb-4">
                  {section.label}
                </p>
                <div className="space-y-3">
                  {section.items.map((n) => (
                    <div
                      key={n.id}
                      className={`border px-6 py-5 transition-colors ${
                        n.read_at
                          ? 'border-white/5 bg-luxury-black/20'
                          : 'border-luxury-gold/20 bg-luxury-black/35'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                          <p className="text-sm text-luxury-cream">{n.title}</p>
                          <p className="text-xs text-luxury-smoke mt-2">{n.message}</p>
                          <p className="text-xs text-luxury-smoke/80 mt-3">
                            {new Date(n.created_at || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {n.href && (
                            <Link
                              href={n.href}
                              className="text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-gold transition-colors"
                            >
                              View
                            </Link>
                          )}
                          {!n.read_at && (
                            <button
                              type="button"
                              onClick={async () => {
                                await markNotificationRead(n.id);
                                refresh();
                              }}
                              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-cream/80 hover:text-luxury-cream transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="luxury-label mb-3">Preferences</p>
            <h2 className="luxury-heading text-2xl font-light">Control what you receive</h2>
            <p className="text-sm text-luxury-smoke mt-3">Fine-tune alerts without missing what matters.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke">
            <Settings className="w-4 h-4" />
            {saving ? 'Saving…' : 'Settings'}
          </div>
        </div>

        {!prefs ? (
          <div className="mt-10 grid lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid lg:grid-cols-2 gap-4">
            <Toggle
              checked={prefs.channels.in_app}
              onChange={(next) => setPrefPatch({ channels: { in_app: next } })}
              label="In‑app notifications"
              hint="See updates inside your account."
            />
            <Toggle
              checked={prefs.channels.email}
              onChange={(next) => setPrefPatch({ channels: { email: next } })}
              label="Email"
              hint="Get key updates in your inbox."
            />
            <Toggle
              checked={prefs.topics.orders}
              onChange={(next) => setPrefPatch({ topics: { orders: next } })}
              label="Order updates"
              hint="Payment, processing, shipping, delivery."
            />
            <Toggle
              checked={prefs.topics.wishlist}
              onChange={(next) => setPrefPatch({ topics: { wishlist: next } })}
              label="Wishlist alerts"
              hint="Price drops, restocks, low inventory."
            />
            <Toggle
              checked={prefs.topics.promotions}
              onChange={(next) => setPrefPatch({ topics: { promotions: next } })}
              label="Promotions"
              hint="Exclusive offers and coupons."
            />
            <Toggle
              checked={prefs.topics.new_arrivals}
              onChange={(next) => setPrefPatch({ topics: { new_arrivals: next } })}
              label="New arrivals"
              hint="Be first to know about new releases."
            />
          </div>
        )}
      </div>
    </div>
  );
}

