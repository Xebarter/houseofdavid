export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  featured?: boolean;
  sort_order?: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  created_at: string;
}

export interface ProductNote {
  id: string;
  product_id: string;
  layer: 'top' | 'heart' | 'base';
  note: string;
  created_at: string;
}

import type { ImageVariants } from './images/types';

export type { ImageVariants };

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  description: string;
  short_description: string;
  concentration: string;
  year_launched: number | null;
  perfumer: string | null;
  price: number;
  compare_at_price: number | null;
  volume_ml: number;
  stock: number;
  featured: boolean;
  is_new: boolean;
  is_limited: boolean;
  image_url: string;
  image_variants?: ImageVariants | null;
  gallery_urls: string[];
  gallery_image_variants?: (ImageVariants | null)[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'completed'
  | 'failed';

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  volume_ml: number;
  created_at: string;
}

export interface JournalCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: string;
  author: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  customer: Customer;
  items: Array<OrderItem & { product: Product }>;
}

export interface OrderSummary extends Order {
  customer: Customer;
}

export interface CheckoutCustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderInput {
  customer: CheckoutCustomerInput;
  items: Array<{ product: Product; quantity: number }>;
  total_amount: number;
}
