import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage, verifyAdminToken } from '@/lib/firebase-admin';
import { IMAGE_CONFIG } from '@/lib/images/config';
import { processAndStoreImage } from '@/lib/images/process-server';
import type { UploadImageResult } from '@/lib/images/types';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const isAdmin = await verifyAdminToken(token);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > IMAGE_CONFIG.maxOptimizedBytes) {
      return NextResponse.json(
        { error: `Optimized file too large (max ${Math.round(IMAGE_CONFIG.maxOptimizedBytes / 1024 / 1024)}MB)` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = getAdminStorage().bucket();
    const { variants, deduplicated } = await processAndStoreImage(bucket, buffer, bucket.name);

    const result: UploadImageResult = {
      url: variants.primary,
      variants,
      deduplicated,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
