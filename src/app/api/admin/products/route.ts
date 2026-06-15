import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/admin-request';
import { sanitizeProductWriteData, type ProductWritePayload } from '@/lib/product-data';
import type { Product } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdminRequest(request))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as ProductWritePayload;
    const now = new Date().toISOString();
    const doc = sanitizeProductWriteData({
      ...body,
      gallery_urls: body.gallery_urls || [],
      created_at: now,
      updated_at: now,
    });

    const ref = await getAdminDb().collection('products').add(doc);
    const product: Product = {
      id: ref.id,
      ...(doc as Omit<Product, 'id'>),
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await verifyAdminRequest(request))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as { id: string } & Partial<ProductWritePayload>;
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
    }

    const doc = sanitizeProductWriteData({
      ...updates,
      updated_at: new Date().toISOString(),
    });

    await getAdminDb().collection('products').doc(id).update(doc);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAdminRequest(request))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
    }

    await getAdminDb().collection('products').doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
