'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BookOpen,
  LogOut,
  Tag,
  Menu,
  X,
  Home,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND_NAME, BRAND_SIDEBAR_LOGO_SRC } from '@/lib/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'products', label: 'Products', icon: Package, href: '/admin/products' },
  { id: 'categories', label: 'Categories', icon: Tag, href: '/admin/categories' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'journal', label: 'Journal', icon: BookOpen, href: '/admin/journal' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const activeItem =
    navItems.find((item) =>
      item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href)
    ) || navItems[0];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-14 gap-3">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5 shrink">
            <BrandLogo size="sm" src={BRAND_SIDEBAR_LOGO_SRC} framed className="shrink-0" />
            <p className="text-sm font-semibold text-stone-100 truncate">{activeItem.label}</p>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-stone-200 hover:bg-gray-800 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <Link
          href="/admin"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 px-4 pt-14 pb-4 lg:pt-4 lg:px-5 lg:pb-5 border-b border-gray-800 shrink-0 hover:bg-gray-800/40 transition-colors"
        >
          <BrandLogo
            size="md"
            src={BRAND_SIDEBAR_LOGO_SRC}
            framed
            priority
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-100 leading-snug">{BRAND_NAME}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">Admin</p>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto admin-scrollbar">
          {navItems.map(({ id, label, icon: Icon, href }) => {
            const isActive = activeItem.id === id;
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-950/50 text-amber-200 border border-amber-800/40'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-stone-200 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                {label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto text-amber-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-stone-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Store
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">
        <header className="hidden lg:flex items-center justify-between bg-gray-900/50 border-b border-gray-800 px-8 py-4 flex-shrink-0">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Admin</p>
            <h2 className="text-xl font-semibold text-stone-100">{activeItem.label}</h2>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-sm text-stone-200">{user.displayName || 'Administrator'}</p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</p>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto admin-scrollbar bg-gray-950">{children}</main>
      </div>
    </div>
  );
}
