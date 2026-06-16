'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Package,
  User as UserIcon,
  Bell,
  LogOut,
  Home,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Footer } from '@/components/storefront/Footer';
import { Header } from '@/components/storefront/Header';
import { Cart } from '@/components/storefront/Cart';
import { Checkout } from '@/components/storefront/Checkout';

const NAV = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/notifications', label: 'Notifications', icon: Bell },
  { href: '/account/profile', label: 'Profile', icon: UserIcon },
] as const;

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const signingOutRef = useRef(false);

  const isAuthRoute = pathname === '/account/login' || pathname === '/account/register';

  useEffect(() => {
    if (isAuthRoute || signingOutRef.current) return;
    if (!loading && !user) {
      router.replace('/account/login');
    }
  }, [loading, user, router, isAuthRoute]);

  if (isAuthRoute) {
    return (
      <>
        {children}
        <Cart
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />
        <Checkout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black">
        <Header onCartClick={() => setShowCart(true)} />
        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="grid lg:grid-cols-[280px_1fr] gap-10">
            <div className="hidden lg:block border border-white/5 bg-luxury-charcoal/40 h-[520px]" />
            <div className="border border-white/5 bg-luxury-charcoal/40 h-[520px] animate-pulse" />
          </div>
        </main>
        <Footer />
        <Cart
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />
        <Checkout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-luxury-black">
      <Header onCartClick={() => setShowCart(true)} />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="mb-8 sm:mb-10">
          <p className="luxury-label mb-3">Account</p>
          <div className="flex items-center gap-2 text-sm text-luxury-smoke">
            <Link href="/" className="hover:text-luxury-cream transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 opacity-60" />
            <span className="text-luxury-cream">Your Hub</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <aside className="border border-white/5 bg-luxury-charcoal/30 backdrop-blur-sm">
            <div className="p-6 border-b border-white/5">
              <p className="text-xs text-luxury-smoke">Signed in as</p>
              <p className="text-sm text-luxury-cream mt-1 line-clamp-1">{user.email}</p>
            </div>
            <nav className="p-2">
              {NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      active
                        ? 'bg-luxury-black/50 text-luxury-gold border border-luxury-gold/25'
                        : 'text-luxury-cream/80 hover:text-luxury-cream hover:bg-luxury-black/30'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-2 pt-2 border-t border-white/5">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-luxury-cream/80 hover:text-luxury-cream hover:bg-luxury-black/30 transition-colors"
                >
                  <Home className="w-4.5 h-4.5" />
                  Home
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    signingOutRef.current = true;
                    router.replace('/');
                    await signOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-luxury-cream/80 hover:text-luxury-cream hover:bg-luxury-black/30 transition-colors"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Sign out
                </button>
              </div>
            </nav>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </main>
      <Footer />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
      />
      <Checkout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}

