/**
 * Client-side image optimization before upload.
 * Strips EXIF by re-encoding through canvas, resizes, converts to WebP/AVIF.
 */

import { IMAGE_CONFIG } from './config';

export type ClientOptimizeResult = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  optimizedBytes: number;
  format: 'image/avif' | 'image/webp';
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image file'));
    };
    img.src = url;
  });
}

function computeTargetDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const scale = maxDimension / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/** Adaptive quality — slightly higher for smaller outputs */
function adaptiveWebpQuality(pixels: number): number {
  if (pixels > 4_000_000) return IMAGE_CONFIG.clientWebpQuality - 0.06;
  if (pixels > 1_500_000) return IMAGE_CONFIG.clientWebpQuality;
  return Math.min(0.92, IMAGE_CONFIG.clientWebpQuality + 0.04);
}

function adaptiveAvifQuality(pixels: number): number {
  if (pixels > 4_000_000) return IMAGE_CONFIG.clientAvifQuality - 0.04;
  return IMAGE_CONFIG.clientAvifQuality;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function supportsAvifEncoding(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const blob = await canvasToBlob(canvas, 'image/avif', 0.5);
  return blob !== null && blob.size > 0;
}

export async function optimizeImageForUpload(
  file: File,
  onProgress?: (percent: number, label?: string) => void
): Promise<ClientOptimizeResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  if (file.size > IMAGE_CONFIG.maxInputBytes) {
    throw new Error(`Image too large (max ${Math.round(IMAGE_CONFIG.maxInputBytes / 1024 / 1024)}MB)`);
  }

  onProgress?.(5, 'Reading image…');
  const img = await loadImageFromFile(file);
  const { width, height } = computeTargetDimensions(
    img.naturalWidth,
    img.naturalHeight,
    IMAGE_CONFIG.maxDimension
  );

  onProgress?.(25, 'Optimizing…');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas not supported');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const pixels = width * height;
  const useAvif = await supportsAvifEncoding();
  const mime = useAvif ? 'image/avif' : 'image/webp';
  const quality = useAvif ? adaptiveAvifQuality(pixels) : adaptiveWebpQuality(pixels);
  const ext = useAvif ? 'avif' : 'webp';

  onProgress?.(55, 'Compressing…');
  let blob = await canvasToBlob(canvas, mime, quality);

  if (!blob) {
    blob = await canvasToBlob(canvas, 'image/webp', adaptiveWebpQuality(pixels));
    if (!blob) throw new Error('Image compression failed');
  }

  if (blob.size > IMAGE_CONFIG.maxOptimizedBytes) {
    const reduced = await canvasToBlob(canvas, 'image/webp', 0.72);
    if (reduced && reduced.size < blob.size) blob = reduced;
  }

  onProgress?.(85, 'Finalizing…');
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  const optimizedFile = new File([blob], `${baseName}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  });

  const previewUrl = URL.createObjectURL(blob);
  onProgress?.(100, 'Ready to upload');

  return {
    file: optimizedFile,
    previewUrl,
    width,
    height,
    originalBytes: file.size,
    optimizedBytes: blob.size,
    format: blob.type as 'image/avif' | 'image/webp',
  };
}

export function formatBytesSaved(original: number, optimized: number): string {
  if (optimized >= original) return '0%';
  const pct = Math.round((1 - optimized / original) * 100);
  return `${pct}%`;
}
