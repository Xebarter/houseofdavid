'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { getOrderSummaries, getOrderWithDetails, updateOrderStatus } from '@/lib/firestore';
import type { OrderSummary, OrderWithDetails, OrderStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import {
  AdminPage,
  AdminPageHeader,
  AdminLoading,
  AdminAlert,
  AdminIconButton,
  AdminTableWrapper,
  AdminTable,
  AdminTableHead,
  AdminTh,
  AdminTableBody,
  AdminTr,
  AdminTd,
  AdminEmptyState,
  AdminModal,
  AdminModalBody,
  AdminCard,
  AdminButton,
  StatusBadge,
} from '@/components/admin/ui/AdminUI';

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await getOrderSummaries();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function viewOrderDetails(order: OrderSummary) {
    setShowDetails(true);
    setSelectedOrder(null);
    setLoadingDetails(true);
    setError(null);
    try {
      const details = await getOrderWithDetails(order.id);
      setSelectedOrder(details);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError('Failed to load order details');
      setShowDetails(false);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleUpdateStatus(orderId: string, status: string) {
    try {
      setUpdating(true);
      setError(null);
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status as OrderStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: status as OrderStatus } : null));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <AdminLoading label="Loading orders..." />;
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
      />

      {error && !showDetails && <AdminAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <AdminTableWrapper>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Order ID</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Date</AdminTh>
            <AdminTh>Total</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Actions</AdminTh>
          </AdminTableHead>
          <AdminTableBody>
            {orders.map((order) => (
              <AdminTr key={order.id}>
                <AdminTd>
                  <span className="font-mono text-xs text-gray-400">{order.id.substring(0, 8)}…</span>
                </AdminTd>
                <AdminTd>
                  <div className="font-medium text-stone-100">{order.customer.name}</div>
                  <div className="text-xs text-gray-500">{order.customer.email}</div>
                </AdminTd>
                <AdminTd className="text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </AdminTd>
                <AdminTd className="font-medium">{formatCurrency(order.total_amount)}</AdminTd>
                <AdminTd>
                  <StatusBadge status={order.status} />
                </AdminTd>
                <AdminTd>
                  <AdminIconButton label="View order details" variant="primary" onClick={() => viewOrderDetails(order)}>
                    <Eye className="h-4 w-4" />
                  </AdminIconButton>
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTableBody>
        </AdminTable>
        {orders.length === 0 && (
          <AdminEmptyState message="No orders yet. They will appear here when customers place orders." />
        )}
      </AdminTableWrapper>

      {showDetails && (
        <AdminModal title="Order Details" onClose={() => setShowDetails(false)} size="xl">
          <AdminModalBody className="space-y-6">
            {loadingDetails ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600/30 border-t-amber-500" />
              </div>
            ) : selectedOrder ? (
              <>
                {error && <AdminAlert type="error" message={error} />}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <AdminCard>
                    <h3 className="text-sm font-semibold text-stone-100 mb-3">Customer</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="text-stone-200 text-right">{selectedOrder.customer.name}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Email</dt>
                        <dd className="text-stone-200 text-right truncate">{selectedOrder.customer.email}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Phone</dt>
                        <dd className="text-stone-200 text-right">{selectedOrder.customer.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 mb-1">Address</dt>
                        <dd className="text-stone-200">{selectedOrder.customer.address}</dd>
                      </div>
                    </dl>
                  </AdminCard>

                  <AdminCard>
                    <h3 className="text-sm font-semibold text-stone-100 mb-3">Order Info</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Order ID</dt>
                        <dd className="text-stone-200 font-mono text-xs">{selectedOrder.id}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Date</dt>
                        <dd className="text-stone-200">{new Date(selectedOrder.created_at).toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Total</dt>
                        <dd className="text-stone-100 font-semibold">{formatCurrency(selectedOrder.total_amount)}</dd>
                      </div>
                      <div className="flex justify-between gap-4 items-center">
                        <dt className="text-gray-500">Status</dt>
                        <dd><StatusBadge status={selectedOrder.status} /></dd>
                      </div>
                    </dl>
                  </AdminCard>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-stone-100 mb-3">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 rounded-lg bg-gray-800/50 border border-gray-800"
                      >
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-stone-100">{item.product.name}</h4>
                          <p className="text-xs text-gray-500">
                            {item.volume_ml}ml · Qty {item.quantity}
                          </p>
                          <p className="text-sm text-amber-400 mt-0.5">{formatCurrency(item.price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-stone-100 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((status) => {
                      const isCurrent = selectedOrder.status === status;
                      return (
                        <AdminButton
                          key={status}
                          variant={isCurrent ? 'primary' : 'secondary'}
                          disabled={updating || isCurrent}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          className="capitalize"
                        >
                          {status}
                        </AdminButton>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </AdminModalBody>
        </AdminModal>
      )}
    </AdminPage>
  );
}
