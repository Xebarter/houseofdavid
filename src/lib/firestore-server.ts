import { getAdminDb } from '@/lib/firebase-admin';
import type { CreateOrderInput, Customer, Order } from '@/lib/types';

const COLLECTIONS = {
  customers: 'customers',
  orders: 'orders',
  orderItems: 'order_items',
} as const;

async function upsertCustomer(input: CreateOrderInput['customer']): Promise<Customer> {
  const db = getAdminDb();
  const now = new Date().toISOString();
  const customerData = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    city: input.city,
    postal_code: input.postalCode,
    country: input.country,
  };

  const existing = await db
    .collection(COLLECTIONS.customers)
    .where('email', '==', input.email)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    await doc.ref.update(customerData);
    return { id: doc.id, ...doc.data(), ...customerData, created_at: doc.data().created_at ?? now } as Customer;
  }

  const ref = await db.collection(COLLECTIONS.customers).add({
    ...customerData,
    created_at: now,
  });

  return { id: ref.id, ...customerData, created_at: now };
}

export async function createOrderWithItems(input: CreateOrderInput): Promise<Order> {
  const db = getAdminDb();
  const customer = await upsertCustomer(input.customer);
  const now = new Date().toISOString();

  const orderRef = await db.collection(COLLECTIONS.orders).add({
    customer_id: customer.id,
    total_amount: input.total_amount,
    status: 'pending',
    currency: 'UGX',
    payment_intent_id: null,
    created_at: now,
    updated_at: now,
  });

  const batch = db.batch();
  for (const item of input.items) {
    const itemRef = db.collection(COLLECTIONS.orderItems).doc();
    batch.set(itemRef, {
      order_id: orderRef.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      volume_ml: item.product.volume_ml,
      created_at: now,
    });
  }
  await batch.commit();

  return {
    id: orderRef.id,
    customer_id: customer.id,
    total_amount: input.total_amount,
    status: 'pending',
    currency: 'UGX',
    payment_intent_id: null,
    created_at: now,
    updated_at: now,
  };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await getAdminDb().collection(COLLECTIONS.orders).doc(orderId).update({
    status,
    updated_at: new Date().toISOString(),
  });
}

export async function updateOrderPaymentIntent(
  orderId: string,
  paymentIntentId: string
): Promise<void> {
  await getAdminDb().collection(COLLECTIONS.orders).doc(orderId).update({
    payment_intent_id: paymentIntentId,
    updated_at: new Date().toISOString(),
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snap = await getAdminDb().collection(COLLECTIONS.orders).doc(orderId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
}
