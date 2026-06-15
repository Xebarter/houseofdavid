import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/admin-request';
import { serializeFirestoreDoc } from '@/lib/firestore-serialize';
import type { Brand, Category, Product } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdminRequest(request))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getAdminDb();
    const [productsSnap, categoriesSnap, brandsSnap] = await Promise.all([
      db.collection('products').orderBy('created_at', 'desc').get(),
      db.collection('categories').orderBy('name').get(),
      db.collection('brands').orderBy('name').get(),
    ]);

    const products = productsSnap.docs.map((doc) =>
      serializeFirestoreDoc<Product>(doc.id, doc.data())
    );
    const categories = categoriesSnap.docs.map((doc) =>
      serializeFirestoreDoc<Category>(doc.id, doc.data())
    );
    const brands = brandsSnap.docs.map((doc) =>
      serializeFirestoreDoc<Brand>(doc.id, doc.data())
    );

    return NextResponse.json({ products, categories, brands });
  } catch (error) {
    console.error('Admin catalog load error:', error);
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
