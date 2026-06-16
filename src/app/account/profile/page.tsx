'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAccountProfile, updateAccountProfile } from '@/lib/account-api';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAccountProfile()
      .then(({ profile }) => {
        setDisplayName(profile.displayName ?? '');
        setPhone(profile.phone ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const canSave = useMemo(() => displayName.trim().length >= 2 || phone.trim().length > 0, [displayName, phone]);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateAccountProfile({ displayName: displayName.trim() || undefined, phone: phone.trim() || undefined });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
      <div>
        <p className="luxury-label mb-3">Profile</p>
        <h1 className="luxury-heading text-3xl font-light">Your details</h1>
        <p className="text-sm text-luxury-smoke mt-3">Keep your account up to date for faster checkout.</p>
      </div>

      {error && (
        <div className="mt-8 border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="h-24 bg-white/5 animate-pulse" />
          <div className="h-24 bg-white/5 animate-pulse" />
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] uppercase tracking-wideish text-luxury-smoke mb-2">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-luxury-black/60 border border-white/10 px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/50"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wideish text-luxury-smoke mb-2">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-luxury-black/60 border border-white/10 px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/50"
              placeholder="+256 …"
            />
          </div>

          <div className="sm:col-span-2 border border-white/5 bg-luxury-black/25 p-6">
            <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke">Email</p>
            <p className="text-sm text-luxury-cream mt-2">{user?.email}</p>
          </div>

          <div className="sm:col-span-2 flex items-center justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave || saving}
              className="luxury-btn-primary"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

