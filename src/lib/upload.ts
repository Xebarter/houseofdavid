import type { ImageVariants, UploadImageResult, UploadProgressCallback } from '@/lib/images/types';
import { optimizeImageForUpload } from '@/lib/images/optimize-client';

export type { UploadImageResult, ImageVariants, UploadProgressCallback };

export async function uploadImage(
  file: File,
  idToken: string,
  _prefix = '',
  onProgress?: UploadProgressCallback
): Promise<UploadImageResult> {
  onProgress?.(2, 'optimizing');

  const optimized = await optimizeImageForUpload(file, (percent, label) => {
    onProgress?.(Math.round(percent * 0.35), 'optimizing');
    void label;
  });

  onProgress?.(38, 'uploading');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', optimized.file);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const uploadPct = Math.round((event.loaded / event.total) * 52);
        onProgress(38 + uploadPct, 'uploading');
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          onProgress?.(95, 'processing');
          const data = JSON.parse(xhr.responseText) as UploadImageResult;
          onProgress?.(100, 'done');
          URL.revokeObjectURL(optimized.previewUrl);
          resolve(data);
        } catch {
          reject(new Error('Invalid upload response'));
        }
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText);
        reject(new Error(data.error || 'Upload failed'));
      } catch {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', '/api/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    xhr.send(formData);
  });
}
