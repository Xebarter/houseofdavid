'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { BRAND_NAME } from '@/lib/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { MobileNavDrawer } from './MobileNavDrawer';

interface HeaderProps {
  onCartClick: () => void;
}

const navItems = [{ name: 'Collections', path: '/collections' }];

export function Header({ onCartClick }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (path: string, hash?: string) => {
    if (hash && pathname === '/') {
      document.getElementById(hash.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
    } else if (hash) {
      router.push(`/${hash}`);
    } else {
      router.push(path);
    }
    setMobileMenuOpen(false);
  };

  const headerSolid = scrolled || mobileMenuOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          headerSolid
            ? 'bg-luxury-black/95 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => router.push('/')}
              className="hover:opacity-90 transition-opacity"
              aria-label={`${BRAND_NAME} home`}
            >
              <BrandLogo size="md" showName className="sm:gap-3" nameClassName="text-xl sm:text-2xl" priority />
            </button>

            <nav className="hidden md:flex items-center gap-10">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="text-xs uppercase tracking-wideish text-luxury-cream/70 hover:text-luxury-cream transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4 sm:gap-5">
              <button
                onClick={() => router.push('/account')}
                aria-label="Account"
                className="text-luxury-cream/80 hover:text-luxury-cream transition-colors p-1"
              >
                <User size={20} strokeWidth={1.25} />
              </button>

              <button
                onClick={onCartClick}
                aria-label="Open cart"
                className="relative text-luxury-cream/80 hover:text-luxury-cream transition-colors p-1"
              >
                <ShoppingBag size={20} strokeWidth={1.25} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-luxury-gold text-luxury-black text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className={`md:hidden w-10 h-10 flex items-center justify-center border transition-colors duration-300 ${
                  mobileMenuOpen
                    ? 'border-luxury-gold/30 text-luxury-cream bg-luxury-black/50'
                    : 'border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/25'
                }`}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};
