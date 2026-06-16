import type { CreateOrderInput } from './types';

const PAYTOTA_BASE_URL = process.env.PAYTOTA_BASE_URL || 'https://gate.paytota.com';
const PAYTOTA_SECRET_KEY = process.env.PAYTOTA_SECRET_KEY || '';
const PAYTOTA_BRAND_ID = process.env.PAYTOTA_BRAND_ID || '';
const PAYTOTA_CURRENCY = process.env.PAYTOTA_CURRENCY || 'UGX';

export interface PaytotaPurchaseResponse {
  id: string;
  status: string;
  checkout_url: string;
  reference: string;
  event_type?: string;
}

export interface PaytotaPurchaseStatus {
  id: string;
  status: string;
  reference: string;
  event_type?: string;
}

function getAuthHeaders(): HeadersInit {
  if (!PAYTOTA_SECRET_KEY) {
    throw new Error('PAYTOTA_SECRET_KEY is not configured');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PAYTOTA_SECRET_KEY}`,
  };
}

function mapCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    kenya: 'KE',
    uganda: 'UG',
    tanzania: 'TZ',
    rwanda: 'RW',
    ethiopia: 'ET',
    usa: 'US',
    'united states': 'US',
    'united kingdom': 'GB',
    uk: 'GB',
    nigeria: 'NG',
    ghana: 'GH',
  };
  const lower = country.toLowerCase().trim();
  if (countryMap[lower]) return countryMap[lower];
  if (lower.length === 2) return lower.toUpperCase();
  return 'UG';
}

export function mapPaytotaStatus(status: string): string {
  switch (status) {
    case 'paid':
      return 'paid';
    case 'error':
    case 'payment_failure':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    case 'created':
    case 'pending':
    case 'pending_execute':
      return 'pending';
    default:
      return 'pending';
  }
}

function normalizePhoneForPaytota(phone: string, country: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return phone;

  const countryCode = mapCountryCode(country);
  if (countryCode === 'UG' && digits.startsWith('0')) {
    return `256${digits.slice(1)}`;
  }
  if (digits.startsWith('256') || digits.startsWith('254') || digits.startsWith('251')) {
    return digits;
  }
  if (countryCode === 'UG') return `256${digits}`;
  if (countryCode === 'KE') return `254${digits}`;
  if (countryCode === 'ET') return `251${digits}`;
  return digits;
}

export function isPaytotaStatusPending(status: string): boolean {
  return ['created', 'pending', 'pending_execute', 'pending_charge', 'viewed'].includes(status);
}

export function buildPurchasePayload(
  order: { id: string; total_amount: number },
  input: CreateOrderInput,
  origin: string
) {
  if (!PAYTOTA_BRAND_ID) {
    throw new Error('PAYTOTA_BRAND_ID is not configured');
  }

  const { customer, items } = input;
  const country = mapCountryCode(customer.country);
  const returnRedirect = `${origin}/payment-result?order_id=${order.id}`;

  return {
    client: {
      email: customer.email,
      phone: normalizePhoneForPaytota(customer.phone, customer.country),
      country,
      full_name: customer.name,
      city: customer.city,
      street_address: customer.address,
      zip_code: customer.postalCode,
      state: customer.city,
    },
    purchase: {
      currency: PAYTOTA_CURRENCY,
      products: items.map((item) => ({
        name: item.product.name,
        price: Math.round(item.product.price * item.quantity),
      })),
    },
    reference: order.id,
    skip_capture: false,
    brand_id: PAYTOTA_BRAND_ID,
    success_redirect: returnRedirect,
    failure_redirect: returnRedirect,
    cancel_redirect: returnRedirect,
  };
}

export function isPaytotaPaymentSuccessful(status: string): boolean {
  return status === 'paid';
}

export async function createPurchase(
  order: { id: string; total_amount: number },
  input: CreateOrderInput,
  origin: string
): Promise<PaytotaPurchaseResponse> {
  const payload = buildPurchasePayload(order, input, origin);

  const response = await fetch(`${PAYTOTA_BASE_URL}/api/v1/purchases/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Paytota purchase failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

export async function getPurchaseStatus(purchaseId: string): Promise<PaytotaPurchaseStatus> {
  const response = await fetch(`${PAYTOTA_BASE_URL}/api/v1/purchases/${purchaseId}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Paytota status check failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

export async function getPublicKey(): Promise<string> {
  const response = await fetch(`${PAYTOTA_BASE_URL}/api/v1/public_key/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Paytota public key: ${response.status}`);
  }

  const data = await response.json();
  return typeof data === 'string' ? data : data.public_key || data.key || '';
}
