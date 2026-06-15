'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, X, Star } from 'lucide-react';
import { AdminProgressRing } from '@/components/admin/ui/AdminUI';
import { isPlaceholderImage } from './productFormUtils';
import type { ImageVariants } from '@/lib/images/types';
import type { UploadProgressCallback } from '@/lib/upload';

export type ImageSlot = {
  id: string;
  previewUrl: string;
  remoteUrl?: string;
  progress: number | null;
  phase?: string;
  error?: string;
  intent: 'primary' | 'gallery';
};

type ProductImageZoneProps = {
  primaryUrl: string;
  galleryUrls: string[];
  onPrimaryChange: (url: string, variants?: ImageVariants | null) => void;
  onGalleryChange: (urls: string[]) => void;
  onGalleryItemAdd?: (url: string, variants: ImageVariants) => void;
  onUpload: (file: File, onProgress: UploadProgressCallback) => Promise<{ url: string; variants: ImageVariants }>;
  onUploadStateChange?: (uploading: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
};

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

function createSlot(file: File, intent: ImageSlot['intent']): ImageSlot {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    previewUrl: URL.createObjectURL(file),
    progress: 0,
    intent,
  };
}

function resolvePrimaryDisplay(primaryUrl: string, slots: ImageSlot[]): string {
  const normalizedPrimary = isPlaceholderImage(primaryUrl) ? '' : primaryUrl.trim();
  if (normalizedPrimary) return normalizedPrimary;

  const primarySlot = slots.find((s) => s.intent === 'primary');
  if (primarySlot?.remoteUrl) return primarySlot.remoteUrl;
  if (primarySlot?.previewUrl) return primarySlot.previewUrl;

  return '';
}

export function ProductImageZone({
  primaryUrl,
  galleryUrls,
  onPrimaryChange,
  onGalleryChange,
  onGalleryItemAdd,
  onUpload,
  onUploadStateChange,
  disabled = false,
  compact = false,
}: ProductImageZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef(galleryUrls);
  const [dragging, setDragging] = useState(false);
  const [slots, setSlots] = useState<ImageSlot[]>([]);

  galleryRef.current = galleryUrls;

  const displayPrimary = resolvePrimaryDisplay(primaryUrl, slots);
  const isUploading = slots.some((s) => s.progress !== null && s.progress < 100);

  useEffect(() => {
    onUploadStateChange?.(isUploading);
  }, [isUploading, onUploadStateChange]);

  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  useEffect(() => {
    return () => {
      slotsRef.current.forEach((slot) => {
        if (slot.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(slot.previewUrl);
        }
      });
    };
  }, []);

  const updateSlot = useCallback((id: string, patch: Partial<ImageSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const removeSlot = useCallback((id: string) => {
    setSlots((prev) => {
      const slot = prev.find((s) => s.id === id);
      if (slot?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(slot.previewUrl);
      }
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const processFile = useCallback(
    async (file: File, intent: ImageSlot['intent']) => {
      const slot = createSlot(file, intent);
      setSlots((prev) => [...prev, slot]);

      try {
        const result = await onUpload(file, (percent, phase) => {
          updateSlot(slot.id, { progress: percent, phase: phase ?? 'uploading' });
        });
        updateSlot(slot.id, { remoteUrl: result.url, progress: 100, phase: 'done' });

        if (intent === 'primary') {
          onPrimaryChange(result.url, result.variants);
        } else {
          const nextGallery = [...galleryRef.current];
          if (!nextGallery.includes(result.url)) {
            nextGallery.push(result.url);
          }
          onGalleryChange(nextGallery);
          onGalleryItemAdd?.(result.url, result.variants);
        }

        setTimeout(() => removeSlot(slot.id), 400);
      } catch (err) {
        updateSlot(slot.id, {
          progress: null,
          error: err instanceof Error ? err.message : 'Upload failed',
        });
      }
    },
    [galleryUrls, onGalleryChange, onGalleryItemAdd, onPrimaryChange, onUpload, removeSlot, updateSlot]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (!list.length) return;

      const hasPrimary = !isPlaceholderImage(primaryUrl);
      const replacePrimary = compact || (hasPrimary && list.length === 1);

      list.forEach((file, index) => {
        let intent: ImageSlot['intent'];
        if (compact) {
          intent = 'primary';
        } else if (replacePrimary && index === 0) {
          intent = 'primary';
        } else if (!hasPrimary && index === 0) {
          intent = 'primary';
        } else {
          intent = 'gallery';
        }
        void processFile(file, intent);
      });
    },
    [compact, disabled, primaryUrl, processFile]
  );

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
    resetInput();
  };

  const removePrimary = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrimaryChange('');
    if (galleryUrls.length) {
      onPrimaryChange(galleryUrls[0]);
      onGalleryChange(galleryUrls.slice(1));
    }
  };

  const promoteGalleryImage = (url: string) => {
    const rest = galleryUrls.filter((u) => u !== url);
    if (!isPlaceholderImage(primaryUrl)) rest.unshift(primaryUrl);
    onPrimaryChange(url);
    onGalleryChange(rest);
  };

  const removeGalleryImage = (url: string) => {
    onGalleryChange(galleryUrls.filter((u) => u !== url));
  };

  const activeUpload = slots.find((s) => s.progress !== null && s.progress < 100);
  const uploadLabel =
    activeUpload?.phase === 'optimizing'
      ? 'Optimizing…'
      : activeUpload?.phase === 'uploading'
        ? 'Uploading…'
        : 'Processing…';
  const hasRemovablePrimary = Boolean(displayPrimary);

  if (compact) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            resetInput();
          }}
        />
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative h-12 w-12 rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${
            dragging
              ? 'border-emerald-500/60 bg-emerald-950/20'
              : 'border-gray-600 hover:border-emerald-500/40 bg-gray-800/40'
          } disabled:opacity-50`}
          title="Drop or click to upload"
        >
          {activeUpload ? (
            <AdminProgressRing progress={activeUpload.progress ?? 0} size={40} strokeWidth={3} />
          ) : displayPrimary ? (
            <img src={displayPrimary} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          resetInput();
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          dragging
            ? 'border-emerald-500/70 bg-emerald-950/15'
            : 'border-gray-700 hover:border-emerald-500/40 bg-gray-900/50'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {activeUpload ? (
          <div className="aspect-[4/3] flex flex-col items-center justify-center gap-3 bg-gray-900/80">
            <AdminProgressRing progress={activeUpload.progress ?? 0} size={72} strokeWidth={4} />
            <p className="text-xs text-gray-400">{uploadLabel}</p>
          </div>
        ) : displayPrimary ? (
          <div className="relative aspect-[4/3] group">
            <img src={displayPrimary} alt="Product" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <p className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Click or drop to replace
              </p>
            </div>
            {hasRemovablePrimary && (
              <button
                type="button"
                onClick={removePrimary}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-gray-300 hover:text-white hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="p-3 rounded-full bg-gray-800/80 border border-gray-700">
              <ImagePlus className="h-6 w-6 text-emerald-400/80" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-200">Drop images here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse · JPEG, PNG, WebP · max 5MB</p>
            </div>
          </div>
        )}
      </div>

      {(galleryUrls.length > 0 || slots.some((s) => s.error)) && (
        <div className="flex flex-wrap gap-2">
          {galleryUrls.map((url) => (
            <div key={url} className="relative group h-16 w-16 rounded-lg overflow-hidden border border-gray-700">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => promoteGalleryImage(url)}
                  className="p-1 rounded bg-gray-900/80 text-amber-400 hover:text-amber-300"
                  title="Set as primary"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="p-1 rounded bg-gray-900/80 text-gray-300 hover:text-red-400"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {slots
            .filter((s) => s.error)
            .map((s) => (
              <div
                key={s.id}
                className="h-16 w-16 rounded-lg border border-red-800/50 bg-red-950/30 flex items-center justify-center p-1"
                title={s.error}
              >
                <span className="text-[9px] text-red-400 text-center leading-tight">Failed</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
