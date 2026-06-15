'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { BRAND_NAME } from '@/lib/brand';

interface HeaderProps {
  onCartClick: () => void;
}

const navItems = [
  { name: 'Collection', path: '/', hash: '#collection' },
  { name: 'About', path: '/about' },
  { name: 'Journal', path: '/journal' },
];

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-luxury-black/95 backdrop-blur-md border-b border-white/5 py-0'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => router.push('/')}
            className="font-display text-xl sm:text-2xl font-medium tracking-wide text-luxury-cream hover:text-luxury-gold-light transition-colors"
          >
            {BRAND_NAME}
          </button>

          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path, item.hash)}
                className="text-xs uppercase tracking-wideish text-luxury-cream/70 hover:text-luxury-cream transition-colors"
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              onClick={onCartClick}
              aria-label="Open cart"
              className="relative text-luxury-cream/80 hover:text-luxury-cream transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.25} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-luxury-gold text-luxury-black text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-luxury-cream/80 hover:text-luxury-cream transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={1.25} /> : <Menu size={22} strokeWidth={1.25} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-luxury-black/98 backdrop-blur-lg border-b border-white/5">
          <nav className="px-6 py-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path, item.hash)}
                className="block w-full text-left py-3 text-sm uppercase tracking-wideish text-luxury-cream/70 hover:text-luxury-cream border-b border-white/5 transition-colors"
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
