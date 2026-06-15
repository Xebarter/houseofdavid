import { createHash } from 'crypto';
import sharp from 'sharp';
import type { Bucket, File } from '@google-cloud/storage';
import { IMAGE_CONFIG } from './config';
import type { ImageVariants } from './types';
import { buildVariantUrl } from './urls';

export function hashImageBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 20);
}

async function fileExists(file: File): Promise<boolean> {
  const [exists] = await file.exists();
  return exists;
}

async function readManifest(bucket: Bucket, hash: string): Promise<ImageVariants | null> {
  const manifestFile = bucket.file(`${IMAGE_CONFIG.storagePrefix}/${hash}/manifest.json`);
  if (!(await fileExists(manifestFile))) return null;
  const [contents] = await manifestFile.download();
  return JSON.parse(contents.toString('utf8')) as ImageVariants;
}

async function writeManifest(bucket: Bucket, hash: string, variants: ImageVariants): Promise<void> {
  const manifestFile = bucket.file(`${IMAGE_CONFIG.storagePrefix}/${hash}/manifest.json`);
  await manifestFile.save(JSON.stringify(variants), {
    metadata: {
      contentType: 'application/json',
      cacheControl: IMAGE_CONFIG.cacheControl,
    },
  });
  await manifestFile.makePublic();
}

export async function processAndStoreImage(
  bucket: Bucket,
  buffer: Buffer,
  bucketName: string
): Promise<{ variants: ImageVariants; deduplicated: boolean }> {
  const hash = hashImageBuffer(buffer);
  const existing = await readManifest(bucket, hash);
  if (existing) {
    return { variants: existing, deduplicated: true };
  }

  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const sourceWidth = metadata.width ?? IMAGE_CONFIG.maxDimension;
  const sourceHeight = metadata.height ?? IMAGE_CONFIG.maxDimension;

  const widths: number[] = [...IMAGE_CONFIG.variantWidths.filter((w) => w <= sourceWidth)];
  const maxVariant = IMAGE_CONFIG.variantWidths[IMAGE_CONFIG.variantWidths.length - 1]!;
  const cappedWidth = Math.min(sourceWidth, maxVariant);
  if (!widths.includes(cappedWidth)) {
    widths.push(cappedWidth);
  }
  const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);

  const basePath = `https://storage.googleapis.com/${bucketName}/${IMAGE_CONFIG.storagePrefix}/${hash}`;
  const folder = `${IMAGE_CONFIG.storagePrefix}/${hash}`;

  const placeholderBuf = await sharp(buffer)
    .rotate()
    .resize(IMAGE_CONFIG.placeholderWidth, null, { withoutEnlargement: true })
    .webp({ quality: IMAGE_CONFIG.placeholderQuality })
    .toBuffer();
  const placeholder = `data:image/webp;base64,${placeholderBuf.toString('base64')}`;

  await Promise.all(
    uniqueWidths.flatMap((width) => [
      (async () => {
        const avifBuf = await sharp(buffer)
          .rotate()
          .resize(width, null, { withoutEnlargement: true, fit: 'inside' })
          .avif({ quality: IMAGE_CONFIG.avifQuality, effort: IMAGE_CONFIG.avifEffort })
          .toBuffer();
        const ref = bucket.file(`${folder}/${width}w.avif`);
        await ref.save(avifBuf, {
          metadata: {
            contentType: 'image/avif',
            cacheControl: IMAGE_CONFIG.cacheControl,
          },
        });
        await ref.makePublic();
      })(),
      (async () => {
        const webpBuf = await sharp(buffer)
          .rotate()
          .resize(width, null, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: IMAGE_CONFIG.webpQuality, smartSubsample: true })
          .toBuffer();
        const ref = bucket.file(`${folder}/${width}w.webp`);
        await ref.save(webpBuf, {
          metadata: {
            contentType: 'image/webp',
            cacheControl: IMAGE_CONFIG.cacheControl,
          },
        });
        await ref.makePublic();
      })(),
    ])
  );

  const primaryWidth = uniqueWidths.find((w) => w >= 1280) ?? uniqueWidths[uniqueWidths.length - 1]!;
  const primary = buildVariantUrl(basePath, primaryWidth, 'webp');

  const variants: ImageVariants = {
    id: hash,
    width: sourceWidth,
    height: sourceHeight,
    aspectRatio: sourceWidth / sourceHeight,
    placeholder,
    primary,
    widths: uniqueWidths,
    basePath,
  };

  await writeManifest(bucket, hash, variants);
  return { variants, deduplicated: false };
}
