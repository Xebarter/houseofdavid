'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AlertCircle, Lock } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { BRAND_NAME } from '@/lib/brand';
import { AdminInput, AdminLabel, AdminButton } from '@/components/admin/ui/AdminUI';

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked. Please allow pop-ups and try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was interrupted. Please try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      default:
        break;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Login failed';
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle, user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isAdmin) {
      router.replace('/admin');
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.replace('/admin');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isBusy = loading || googleLoading;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center font-bold text-xl text-white mx-auto mb-4 shadow-lg shadow-amber-900/30">
            H
          </div>
          <h1 className="text-2xl font-semibold text-stone-100">{BRAND_NAME}</h1>
          <p className="text-gray-500 text-sm mt-1">Administration Portal</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 text-gray-400">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Sign in to continue</span>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-950/50 border border-red-800/50 text-red-200 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              loading={googleLoading}
              disabled={isBusy}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-gray-900 text-gray-500 uppercase tracking-wider">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <AdminLabel htmlFor="email">Email</AdminLabel>
                <AdminInput
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBusy}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <AdminLabel htmlFor="password">Password</AdminLabel>
                <AdminInput
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBusy}
                />
              </div>
              <AdminButton type="submit" disabled={isBusy} className="w-full py-2.5">
                {loading ? 'Signing in...' : 'Sign In'}
              </AdminButton>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
