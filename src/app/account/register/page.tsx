'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';

export default function AccountRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && email.trim().length > 3 && password.length >= 6,
    [name, email, password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      router.replace('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <Header onCartClick={() => {}} />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-md mx-auto border border-white/5 bg-luxury-charcoal/30 backdrop-blur-sm">
          <div className="p-8 sm:p-10 border-b border-white/5">
            <BrandLogo size="lg" showName className="mb-6" nameClassName="text-xl" />
            <h1 className="luxury-heading text-3xl font-light tracking-tight">Create your account</h1>
            <p className="text-sm text-luxury-smoke mt-3">Save favorites, track orders, and build your collection.</p>
          </div>

          <form onSubmit={onSubmit} className="p-8 sm:p-10 space-y-5">
            <button
              type="button"
              onClick={onGoogle}
              disabled={googleSubmitting || submitting}
              className="w-full inline-flex items-center justify-center px-6 py-3.5 text-xs font-medium uppercase tracking-wideish border border-white/15 text-luxury-cream/90 hover:border-luxury-gold/40 hover:text-luxury-cream transition-all duration-500 disabled:opacity-40"
            >
              {googleSubmitting ? 'Connecting…' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-wideish text-luxury-smoke">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wideish text-luxury-smoke mb-2">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                autoComplete="name"
                className="w-full bg-luxury-black/60 border border-white/10 px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/50"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wideish text-luxury-smoke mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full bg-luxury-black/60 border border-white/10 px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wideish text-luxury-smoke mb-2">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="w-full bg-luxury-black/60 border border-white/10 px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/50"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button type="submit" disabled={!canSubmit || submitting} className="luxury-btn-primary w-full">
              {submitting ? 'Creating…' : 'Create account'}
            </button>

            <div className="flex items-center justify-between text-sm text-luxury-smoke pt-2">
              <Link href="/account/login" className="hover:text-luxury-cream transition-colors">
                Sign in
              </Link>
              <Link href="/collections" className="hover:text-luxury-cream transition-colors">
                Shop
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

