'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, Clock, ArrowRight, Tag, BookOpen } from 'lucide-react';
import { getDashboardStats, getRecentOrderSummaries } from '@/lib/firestore';
import { formatCurrency } from '@/lib/format';
import type { OrderSummary } from '@/lib/types';
import {
  AdminPage,
  AdminPageHeader,
  AdminLoading,
  AdminStatCard,
  AdminCard,
  StatusBadge,
} from '@/components/admin/ui/AdminUI';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const quickActions = [
  {
    title: 'Manage Products',
    description: 'Add, edit, or remove products from your inventory',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Process Orders',
    description: 'View and update order statuses',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Manage Categories',
    description: 'Organize products into collections',
    href: '/admin/categories',
    icon: Tag,
  },
  {
    title: 'Journal Posts',
    description: 'Create and publish editorial content',
    href: '/admin/journal',
    icon: BookOpen,
  },
];

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsData, ordersData] = await Promise.all([
        getDashboardStats(),
        getRecentOrderSummaries(5),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return <AdminLoading label="Loading dashboard..." />;
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Overview"
        description="Monitor your store performance at a glance"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <AdminStatCard label="Total Products" value={stats.totalProducts} icon={Package} />
        <AdminStatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} />
        <AdminStatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue, 'UGX')}
          icon={DollarSign}
        />
        <AdminStatCard
          label="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          trend={stats.pendingOrders > 0 ? 'Requires attention' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <h2 className="text-base font-semibold text-stone-100 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(({ title, description, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-800 hover:border-amber-800/50 hover:bg-gray-800/50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-gray-800 border border-gray-700 group-hover:border-amber-800/40 transition-colors">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-stone-100">{title}</h3>
                  <p className="text-xs text-gray-500 truncate">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-100">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
            >
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-800"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-100 truncate">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()} ·{' '}
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </AdminPage>
  );
}
