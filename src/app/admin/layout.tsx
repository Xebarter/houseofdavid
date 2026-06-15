'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && pathname !== '/admin/login') {
      if (!user || !isAdmin) {
        router.replace('/admin/login');
      }
    }
  }, [user, isAdmin, loading, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <div className="hidden lg:block w-64 bg-gray-900 border-r border-gray-800" />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-600/30 border-t-amber-500" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
