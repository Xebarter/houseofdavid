import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  documentId,
  getCountFromServer,
  getAggregateFromServer,
  sum,
} from 'firebase/firestore';
import { db } from './firebase';
import { getCached, setCache, invalidateCache, cachedFetch } from './admin-cache';
import type {
  Product,
  Category,
  Brand,
  ProductNote,
  Customer,
  Order,
  OrderItem,
  JournalCategory,
  JournalPost,
  OrderWithDetails,
  OrderSummary,
  CreateOrderInput,
} from './types';

const COLLECTIONS = {
  categories: 'categories',
  brands: 'brands',
  products: 'products',
  productNotes: 'product_notes',
  customers: 'customers',
  orders: 'orders',
  orderItems: 'order_items',
  journalCategories: 'journal_categories',
  journalPosts: 'journal_posts',
} as const;

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

function docToData<T extends { id: string }>(
  id: string,
  data: Record<string, unknown>
): T {
  const result: Record<string, unknown> = { id };
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function fetchDocsByIds<T extends { id: string }>(
  collectionName: string,
  ids: string[]
): Promise<Map<string, T>> {
  const map = new Map<string, T>();
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return map;

  await Promise.all(
    chunkArray(uniqueIds, 30).map(async (chunkIds) => {
      const snap = await getDocs(
        query(collection(db, collectionName), where(documentId(), 'in', chunkIds))
      );
      snap.docs.forEach((d) => {
        map.set(d.id, docToData<T>(d.id, d.data()));
      });
    })
  );
  return map;
}

function unknownCustomer(customerId: string): Customer {
  return {
    id: customerId,
    email: '',
    name: 'Unknown',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    created_at: '',
  };
}

function unknownProduct(item: OrderItem): Product {
  return {
    id: item.product_id,
    name: 'Unknown Product',
    slug: '',
    brand_id: '',
    category_id: '',
    description: '',
    short_description: '',
    concentration: '',
    year_launched: null,
    perfumer: null,
    price: item.price,
    compare_at_price: null,
    volume_ml: item.volume_ml,
    stock: 0,
    featured: false,
    is_new: false,
    is_limited: false,
    image_url: '',
    gallery_urls: [],
    created_at: '',
    updated_at: '',
  };
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return cachedFetch('products', async () => {
    const q = query(collection(db, COLLECTIONS.products), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToData<Product>(d.id, d.data()));
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.products, id));
  if (!snap.exists()) return null;
  return docToData<Product>(snap.id, snap.data());
}

export async function createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COLLECTIONS.products), {
    ...data,
    gallery_urls: data.gallery_urls || [],
    created_at: now,
    updated_at: now,
  });
  invalidateCache('products');
  invalidateCache('storefront');
  return { id: ref.id, ...data, gallery_urls: data.gallery_urls || [], created_at: now, updated_at: now };
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.products, id), {
    ...data,
    updated_at: new Date().toISOString(),
  });
  invalidateCache('products');
  invalidateCache('storefront');
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.products, id));
  invalidateCache('products');
  invalidateCache('storefront');
}

// ─── Categories ───────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return cachedFetch('categories', async () => {
    const q = query(collection(db, COLLECTIONS.categories), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToData<Category>(d.id, d.data()));
  });
}

export async function getStorefrontCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  return cachedFetch('storefront:catalog', async () => {
    const [productsSnap, categoriesSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.products), orderBy('created_at', 'desc'))),
      getDocs(query(collection(db, COLLECTIONS.categories), orderBy('name'))),
    ]);
    const products = productsSnap.docs.map((d) => docToData<Product>(d.id, d.data()));
    const categories = categoriesSnap.docs.map((d) => docToData<Category>(d.id, d.data()));
    setCache('products', products);
    setCache('categories', categories);
    return { products, categories };
  });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.categories, id));
  if (!snap.exists()) return null;
  return docToData<Category>(snap.id, snap.data());
}

export async function createCategory(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COLLECTIONS.categories), { ...data, created_at: now });
  invalidateCache('categories');
  invalidateCache('storefront');
  return { id: ref.id, ...data, created_at: now };
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.categories, id), data);
  invalidateCache('categories');
  invalidateCache('storefront');
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.categories, id));
  invalidateCache('categories');
  invalidateCache('storefront');
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const q = query(collection(db, COLLECTIONS.products), where('category_id', '==', categoryId), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToData<Product>(d.id, d.data()));
}

// ─── Brands ─────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
  return cachedFetch('brands', async () => {
    const q = query(collection(db, COLLECTIONS.brands), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToData<Brand>(d.id, d.data()));
  });
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.brands, id));
  if (!snap.exists()) return null;
  return docToData<Brand>(snap.id, snap.data());
}

// ─── Product Notes ──────────────────────────────────────────────────────────

export async function getProductNotes(productId: string): Promise<ProductNote[]> {
  const q = query(
    collection(db, COLLECTIONS.productNotes),
    where('product_id', '==', productId),
    orderBy('layer')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToData<ProductNote>(d.id, d.data()));
}

// ─── Customers ──────────────────────────────────────────────────────────────

export async function upsertCustomer(input: CreateOrderInput['customer']): Promise<Customer> {
  const q = query(collection(db, COLLECTIONS.customers), where('email', '==', input.email), limit(1));
  const snapshot = await getDocs(q);
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

  if (!snapshot.empty) {
    const existing = snapshot.docs[0];
    await updateDoc(existing.ref, customerData);
    return docToData<Customer>(existing.id, { ...existing.data(), ...customerData });
  }

  const ref = await addDoc(collection(db, COLLECTIONS.customers), {
    ...customerData,
    created_at: now,
  });
  return { id: ref.id, ...customerData, created_at: now };
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function createOrderWithItems(input: CreateOrderInput): Promise<Order> {
  const customer = await upsertCustomer(input.customer);
  const now = new Date().toISOString();

  const orderRef = await addDoc(collection(db, COLLECTIONS.orders), {
    customer_id: customer.id,
    total_amount: input.total_amount,
    status: 'pending',
    currency: 'UGX',
    payment_intent_id: null,
    created_at: now,
    updated_at: now,
  });

  const batch = writeBatch(db);
  for (const item of input.items) {
    const itemRef = doc(collection(db, COLLECTIONS.orderItems));
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

  invalidateCache('orders');
  invalidateCache('dashboard');

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
  await updateDoc(doc(db, COLLECTIONS.orders, orderId), {
    status,
    updated_at: new Date().toISOString(),
  });
  invalidateCache('orders');
  invalidateCache('dashboard');
}

export async function updateOrderPaymentIntent(
  orderId: string,
  paymentIntentId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.orders, orderId), {
    payment_intent_id: paymentIntentId,
    updated_at: new Date().toISOString(),
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.orders, orderId));
  if (!snap.exists()) return null;
  return docToData<Order>(snap.id, snap.data());
}

export async function getOrderSummaries(): Promise<OrderSummary[]> {
  const cached = getCached<OrderSummary[]>('orders:summaries');
  if (cached) return cached;

  const ordersSnap = await getDocs(
    query(collection(db, COLLECTIONS.orders), orderBy('created_at', 'desc'))
  );
  const orders = ordersSnap.docs.map((d) => docToData<Order>(d.id, d.data()));
  const customers = await fetchDocsByIds<Customer>(
    COLLECTIONS.customers,
    orders.map((o) => o.customer_id)
  );

  const summaries = orders.map((order) => ({
    ...order,
    customer: customers.get(order.customer_id) ?? unknownCustomer(order.customer_id),
  }));

  setCache('orders:summaries', summaries);
  return summaries;
}

export async function getRecentOrderSummaries(limitCount = 5): Promise<OrderSummary[]> {
  const cacheKey = `orders:recent:${limitCount}`;
  const cached = getCached<OrderSummary[]>(cacheKey);
  if (cached) return cached;

  const ordersSnap = await getDocs(
    query(
      collection(db, COLLECTIONS.orders),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    )
  );
  const orders = ordersSnap.docs.map((d) => docToData<Order>(d.id, d.data()));
  const customers = await fetchDocsByIds<Customer>(
    COLLECTIONS.customers,
    orders.map((o) => o.customer_id)
  );

  const summaries = orders.map((order) => ({
    ...order,
    customer: customers.get(order.customer_id) ?? unknownCustomer(order.customer_id),
  }));

  setCache(cacheKey, summaries, 30_000);
  return summaries;
}

export async function getOrderWithDetails(orderId: string): Promise<OrderWithDetails | null> {
  const orderSnap = await getDoc(doc(db, COLLECTIONS.orders, orderId));
  if (!orderSnap.exists()) return null;

  const order = docToData<Order>(orderSnap.id, orderSnap.data());

  const [customerSnap, itemsSnap] = await Promise.all([
    getDoc(doc(db, COLLECTIONS.customers, order.customer_id)),
    getDocs(
      query(collection(db, COLLECTIONS.orderItems), where('order_id', '==', orderId))
    ),
  ]);

  const customer = customerSnap.exists()
    ? docToData<Customer>(customerSnap.id, customerSnap.data())
    : unknownCustomer(order.customer_id);

  const items = itemsSnap.docs.map((d) => docToData<OrderItem>(d.id, d.data()));
  const products = await fetchDocsByIds<Product>(
    COLLECTIONS.products,
    items.map((i) => i.product_id)
  );

  return {
    ...order,
    customer,
    items: items.map((item) => ({
      ...item,
      product: products.get(item.product_id) ?? unknownProduct(item),
    })),
  };
}

/** @deprecated Prefer getOrderSummaries + getOrderWithDetails for admin */
export async function getOrders(): Promise<OrderWithDetails[]> {
  const ordersSnap = await getDocs(
    query(collection(db, COLLECTIONS.orders), orderBy('created_at', 'desc'))
  );
  const orders = ordersSnap.docs.map((d) => docToData<Order>(d.id, d.data()));

  const [customers, itemsByOrder] = await Promise.all([
    fetchDocsByIds<Customer>(COLLECTIONS.customers, orders.map((o) => o.customer_id)),
    (async () => {
      const map = new Map<string, OrderItem[]>();
      orders.forEach((o) => map.set(o.id, []));
      const orderIds = orders.map((o) => o.id);
      await Promise.all(
        chunkArray(orderIds, 30).map(async (chunkIds) => {
          const snap = await getDocs(
            query(collection(db, COLLECTIONS.orderItems), where('order_id', 'in', chunkIds))
          );
          snap.docs.forEach((d) => {
            const item = docToData<OrderItem>(d.id, d.data());
            map.get(item.order_id)?.push(item);
          });
        })
      );
      return map;
    })(),
  ]);

  const allItems = [...itemsByOrder.values()].flat();
  const products = await fetchDocsByIds<Product>(
    COLLECTIONS.products,
    allItems.map((i) => i.product_id)
  );

  return orders.map((order) => ({
    ...order,
    customer: customers.get(order.customer_id) ?? unknownCustomer(order.customer_id),
    items: (itemsByOrder.get(order.id) ?? []).map((item) => ({
      ...item,
      product: products.get(item.product_id) ?? unknownProduct(item),
    })),
  }));
}

export async function getDashboardStats() {
  const cached = getCached<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  }>('dashboard:stats');
  if (cached) return cached;

  try {
    const [productsCount, ordersCount, pendingCount, revenueAgg] = await Promise.all([
      getCountFromServer(collection(db, COLLECTIONS.products)),
      getCountFromServer(collection(db, COLLECTIONS.orders)),
      getCountFromServer(
        query(collection(db, COLLECTIONS.orders), where('status', '==', 'pending'))
      ),
      getAggregateFromServer(collection(db, COLLECTIONS.orders), {
        totalRevenue: sum('total_amount'),
      }),
    ]);

    const stats = {
      totalProducts: productsCount.data().count,
      totalOrders: ordersCount.data().count,
      totalRevenue: revenueAgg.data().totalRevenue ?? 0,
      pendingOrders: pendingCount.data().count,
    };
    setCache('dashboard:stats', stats, 30_000);
    return stats;
  } catch {
    const [productsSnap, ordersSnap, pendingSnap] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.products)),
      getDocs(collection(db, COLLECTIONS.orders)),
      getDocs(query(collection(db, COLLECTIONS.orders), where('status', '==', 'pending'))),
    ]);

    const totalRevenue = ordersSnap.docs.reduce((sum, d) => {
      const amount = d.data().total_amount;
      return sum + (typeof amount === 'number' ? amount : Number(amount) || 0);
    }, 0);

    const stats = {
      totalProducts: productsSnap.size,
      totalOrders: ordersSnap.size,
      totalRevenue,
      pendingOrders: pendingSnap.size,
    };
    setCache('dashboard:stats', stats, 30_000);
    return stats;
  }
}

// ─── Journal ────────────────────────────────────────────────────────────────

export async function getJournalCategories(): Promise<JournalCategory[]> {
  const cached = getCached<JournalCategory[]>('journal:categories');
  if (cached) return cached;

  const q = query(collection(db, COLLECTIONS.journalCategories), orderBy('name'));
  const snapshot = await getDocs(q);
  const categories = snapshot.docs.map((d) => docToData<JournalCategory>(d.id, d.data()));
  setCache('journal:categories', categories);
  return categories;
}

export async function getJournalCategoryById(id: string): Promise<JournalCategory | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.journalCategories, id));
  if (!snap.exists()) return null;
  return docToData<JournalCategory>(snap.id, snap.data());
}

export async function getPublishedJournalPosts(categoryId?: string): Promise<JournalPost[]> {
  let q = query(
    collection(db, COLLECTIONS.journalPosts),
    where('published', '==', true),
    orderBy('published_at', 'desc')
  );

  if (categoryId && categoryId !== 'all') {
    q = query(
      collection(db, COLLECTIONS.journalPosts),
      where('published', '==', true),
      where('category_id', '==', categoryId),
      orderBy('published_at', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToData<JournalPost>(d.id, d.data()));
}

export async function getAllJournalPosts(): Promise<JournalPost[]> {
  const cached = getCached<JournalPost[]>('journal:posts');
  if (cached) return cached;

  const q = query(collection(db, COLLECTIONS.journalPosts), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map((d) => docToData<JournalPost>(d.id, d.data()));
  setCache('journal:posts', posts);
  return posts;
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  const q = query(
    collection(db, COLLECTIONS.journalPosts),
    where('slug', '==', slug),
    where('published', '==', true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return docToData<JournalPost>(d.id, d.data());
}

export async function createJournalPost(
  data: Omit<JournalPost, 'id' | 'created_at' | 'updated_at'>
): Promise<JournalPost> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COLLECTIONS.journalPosts), {
    ...data,
    created_at: now,
    updated_at: now,
  });
  invalidateCache('journal');
  return { id: ref.id, ...data, created_at: now, updated_at: now };
}

export async function updateJournalPost(id: string, data: Partial<JournalPost>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.journalPosts, id), {
    ...data,
    updated_at: new Date().toISOString(),
  });
  invalidateCache('journal');
}

export async function deleteJournalPost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.journalPosts, id));
  invalidateCache('journal');
}

export { timestampToIso };
