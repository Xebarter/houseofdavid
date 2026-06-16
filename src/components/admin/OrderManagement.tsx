'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Phone, MapPin, Mail, CreditCard, Package, Truck, CheckCircle2 } from 'lucide-react';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import type { OrderWithDetails, OrderStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import {
  AdminPage,
  AdminPageHeader,
  AdminLoading,
  AdminAlert,
  AdminTableWrapper,
  AdminTable,
  AdminTableHead,
  AdminTh,
  AdminTableBody,
  AdminTr,
  AdminTd,
  AdminEmptyState,
  AdminInput,
  AdminSelect,
  AdminModal,
  AdminModalBody,
  AdminCard,
  AdminButton,
  StatusBadge,
} from '@/components/admin/ui/AdminUI';

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'] as const;

const ROW_STATUS_STYLES: Record<string, string> = {
  pending: 'border-l-amber-500/70 bg-amber-950/10 hover:bg-amber-950/20',
  paid: 'border-l-emerald-500/70 bg-emerald-950/10 hover:bg-emerald-950/20',
  processing: 'border-l-blue-500/70 bg-blue-950/10 hover:bg-blue-950/20',
  shipped: 'border-l-purple-500/70 bg-purple-950/10 hover:bg-purple-950/20',
  delivered: 'border-l-emerald-400/70 bg-emerald-950/15 hover:bg-emerald-950/25',
  cancelled: 'border-l-red-500/70 bg-red-950/10 hover:bg-red-950/20',
  failed: 'border-l-red-600/70 bg-red-950/15 hover:bg-red-950/25',
  refunded: 'border-l-gray-500/70 bg-gray-800/30 hover:bg-gray-800/50',
  completed: 'border-l-emerald-400/70 bg-emerald-950/15 hover:bg-emerald-950/25',
};

const EXECUTION_ACTIONS: Record<string, { label: string; status: OrderStatus; icon: typeof Package }[]> = {
  pending: [
    { label: 'Confirm payment', status: 'paid', icon: CreditCard },
    { label: 'Mark failed', status: 'failed', icon: Package },
    { label: 'Cancel order', status: 'cancelled', icon: Package },
  ],
  paid: [
    { label: 'Start processing', status: 'processing', icon: Package },
    { label: 'Cancel order', status: 'cancelled', icon: Package },
  ],
  processing: [
    { label: 'Mark as shipped', status: 'shipped', icon: Truck },
    { label: 'Cancel order', status: 'cancelled', icon: Package },
  ],
  shipped: [{ label: 'Mark as delivered', status: 'delivered', icon: CheckCircle2 }],
  failed: [{ label: 'Retry — mark pending', status: 'pending', icon: Package }],
  cancelled: [{ label: 'Reopen — mark pending', status: 'pending', icon: Package }],
};

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function customerLocation(order: OrderWithDetails) {
  const { address, city } = order.customer;
  if (address && city && address !== city) return `${address}, ${city}`;
  return address || city || '—';
}

function rowStatusClass(status: string) {
  return ROW_STATUS_STYLES[status] || 'border-l-gray-600/50 bg-gray-900/20 hover:bg-gray-800/40';
}

function ProductThumbnails({ order, size = 'sm' }: { order: OrderWithDetails; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';

  if (order.items.length === 0) {
    return <div className={`${dim} rounded-lg bg-gray-800 border border-gray-700 shrink-0`} />;
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {order.items.slice(0, 3).map((item) => (
        <img
          key={item.id}
          src={item.product.image_url || DEFAULT_PRODUCT_IMAGE}
          alt={item.product.name}
          title={item.product.name}
          className={`${dim} rounded-lg border border-gray-700 object-cover bg-gray-800`}
        />
      ))}
      {order.items.length > 3 && (
        <span className="text-xs text-gray-500 font-medium px-1">+{order.items.length - 3}</span>
      )}
    </div>
  );
}

function ItemsSummary({ order }: { order: OrderWithDetails }) {
  if (order.items.length === 0) return <span className="text-gray-500">—</span>;

  const preview = order.items[0];
  const extra = order.items.length - 1;

  return (
    <div className="min-w-0">
      <p className="text-sm text-stone-100 truncate">{preview.product.name}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        {preview.volume_ml}ml × {preview.quantity}
        {extra > 0 ? ` · +${extra} more` : ''}
      </p>
    </div>
  );
}

function OrderDetailDialog({
  order,
  updating,
  onClose,
  onStatusChange,
}: {
  order: OrderWithDetails;
  updating: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
}) {
  const actions = EXECUTION_ACTIONS[order.status] || [];
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AdminModal
      title={`Order ${order.id.slice(0, 8)}…`}
      onClose={onClose}
      size="xl"
    >
      <AdminModalBody className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="text-sm text-gray-400">{formatOrderDate(order.created_at)}</span>
          <span className="text-sm font-mono text-gray-500">{order.id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard>
            <h3 className="text-sm font-semibold text-stone-100 mb-3">Customer</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 mb-0.5">Name</dt>
                <dd className="text-stone-100 font-medium">{order.customer.name}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                <a href={`tel:${order.customer.phone}`} className="text-amber-400 hover:text-amber-300">
                  {order.customer.phone || '—'}
                </a>
              </div>
              {order.customer.email && !order.customer.email.includes('@houseofdavid.ug') && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                  <a href={`mailto:${order.customer.email}`} className="text-stone-200 truncate">
                    {order.customer.email}
                  </a>
                </div>
              )}
            </dl>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-stone-100 mb-3">Delivery</h3>
            <div className="flex gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-stone-200">{customerLocation(order)}</p>
            </div>
            {order.customer.country && (
              <p className="text-xs text-gray-500 mt-2">{order.customer.country}</p>
            )}
          </AdminCard>
        </div>

        <AdminCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-stone-100">Order items</h3>
            <span className="text-xs text-gray-500">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 border border-gray-800"
              >
                <img
                  src={item.product.image_url || DEFAULT_PRODUCT_IMAGE}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg border border-gray-700 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-100">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.volume_ml}ml · Qty {item.quantity} · {formatCurrency(item.price)} each
                  </p>
                </div>
                <p className="text-sm font-semibold text-amber-300 shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
            {order.items.length === 0 && (
              <p className="text-sm text-gray-500">No items on this order.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
            <span className="text-sm text-gray-400">Order total</span>
            <span className="text-lg font-semibold text-stone-100">{formatCurrency(order.total_amount)}</span>
          </div>
        </AdminCard>

        {(order.payment_intent_id || order.currency) && (
          <AdminCard>
            <h3 className="text-sm font-semibold text-stone-100 mb-3">Payment</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Currency</dt>
                <dd className="text-stone-200">{order.currency}</dd>
              </div>
              {order.payment_intent_id && (
                <div>
                  <dt className="text-gray-500 mb-1">Paytota reference</dt>
                  <dd className="text-stone-200 font-mono text-xs break-all">{order.payment_intent_id}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Last updated</dt>
                <dd className="text-stone-200">{formatOrderDate(order.updated_at)}</dd>
              </div>
            </dl>
          </AdminCard>
        )}

        <AdminCard className="border-amber-900/30 bg-amber-950/10">
          <h3 className="text-sm font-semibold text-stone-100 mb-1">Execute order</h3>
          <p className="text-xs text-gray-500 mb-4">
            Move this order through fulfillment. Choose a quick action or set any status below.
          </p>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {actions.map(({ label, status, icon: Icon }) => (
                <AdminButton
                  key={status}
                  variant={status === 'cancelled' || status === 'failed' ? 'danger' : 'primary'}
                  disabled={updating || order.status === status}
                  onClick={() => onStatusChange(order.id, status)}
                  icon={<Icon className="h-4 w-4" />}
                  className="text-sm"
                >
                  {label}
                </AdminButton>
              ))}
            </div>
          )}

          {order.status === 'delivered' && (
            <p className="text-sm text-emerald-400/90 mb-4">This order has been delivered. No further action needed.</p>
          )}

          <div>
            <label htmlFor="order-status-select" className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Set status
            </label>
            <AdminSelect
              id="order-status-select"
              value={order.status}
              disabled={updating}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="max-w-xs"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </AdminSelect>
          </div>
        </AdminCard>
      </AdminModalBody>
    </AdminModal>
  );
}

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(orderId: string, status: string) {
    try {
      setUpdatingId(orderId);
      setError(null);
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status as OrderStatus } : o))
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (!query) return true;

      const haystack = [
        order.id,
        order.customer.name,
        order.customer.phone,
        order.customer.address,
        order.customer.city,
        ...order.items.map((item) => item.product.name),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return <AdminLoading label="Loading orders..." />;
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} order${orders.length !== 1 ? 's' : ''} total · click a row for full details`}
      />

      {error && <AdminAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <AdminInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="pl-10"
          />
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </AdminSelect>
      </div>

      <AdminTableWrapper>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Products</AdminTh>
            <AdminTh>Date</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Delivery</AdminTh>
            <AdminTh>Items</AdminTh>
            <AdminTh>Total</AdminTh>
            <AdminTh>Status</AdminTh>
          </AdminTableHead>
          <AdminTableBody>
            {filteredOrders.map((order) => (
              <AdminTr
                key={order.id}
                className={`align-top cursor-pointer border-l-4 transition-colors ${rowStatusClass(order.status)}`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <AdminTd className="w-[120px]">
                  <ProductThumbnails order={order} />
                </AdminTd>
                <AdminTd className="whitespace-nowrap text-gray-400">
                  <div>{formatOrderDate(order.created_at)}</div>
                  <div className="text-xs text-gray-600 font-mono mt-1">{order.id.slice(0, 8)}…</div>
                </AdminTd>
                <AdminTd>
                  <div className="font-medium text-stone-100">{order.customer.name}</div>
                  <a
                    href={`tel:${order.customer.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-gray-500 hover:text-amber-400 transition-colors mt-0.5 inline-block"
                  >
                    {order.customer.phone || '—'}
                  </a>
                </AdminTd>
                <AdminTd className="text-gray-400 max-w-[180px]">
                  <span className="line-clamp-2">{customerLocation(order)}</span>
                </AdminTd>
                <AdminTd className="min-w-[160px] max-w-[240px]">
                  <ItemsSummary order={order} />
                </AdminTd>
                <AdminTd className="font-medium whitespace-nowrap">
                  {formatCurrency(order.total_amount)}
                </AdminTd>
                <AdminTd className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={order.status} />
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTableBody>
        </AdminTable>
        {filteredOrders.length === 0 && (
          <AdminEmptyState
            message={
              orders.length === 0
                ? 'No orders yet. They will appear here when customers place orders.'
                : 'No orders match your search or filter.'
            }
          />
        )}
      </AdminTableWrapper>

      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          updating={updatingId === selectedOrder.id}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={handleUpdateStatus}
        />
      )}
    </AdminPage>
  );
}
