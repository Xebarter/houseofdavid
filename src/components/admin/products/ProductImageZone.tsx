'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { ImagePlus, X, Star } from 'lucide-react';
import { AdminProgressRing } from '@/components/admin/ui/AdminUI';
import { DEFAULT_IMAGE } from './productFormUtils';

export type ImageSlot = {
  id: string;
  previewUrl: string;
  remoteUrl?: string;
  progress: number | null;
  error?: string;
};

type ProductImageZoneProps = {
  primaryUrl: string;
  galleryUrls: string[];
  onPrimaryChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<string>;
  onUploadStateChange?: (uploading: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
};

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

function createSlot(file: File): ImageSlot {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    previewUrl: URL.createObjectURL(file),
    progress: 0,
  };
}

export function ProductImageZone({
  primaryUrl,
  galleryUrls,
  onPrimaryChange,
  onGalleryChange,
  onUpload,
  onUploadStateChange,
  disabled = false,
  compact = false,
}: ProductImageZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [slots, setSlots] = useState<ImageSlot[]>([]);

  const displayPrimary = primaryUrl || slots.find((s) => s.remoteUrl)?.remoteUrl || slots[0]?.previewUrl || '';
  const isUploading = slots.some((s) => s.progress !== null && s.progress < 100);

  useEffect(() => {
    onUploadStateChange?.(isUploading);
  }, [isUploading, onUploadStateChange]);

  const updateSlot = useCallback((id: string, patch: Partial<ImageSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const processFile = useCallback(
    async (file: File, setAsPrimary: boolean) => {
      const slot = createSlot(file);
      setSlots((prev) => [...prev, slot]);
      const shouldSetPrimary = setAsPrimary || !primaryUrl;

      try {
        const remoteUrl = await onUpload(file, (percent) => {
          updateSlot(slot.id, { progress: percent });
        });
        updateSlot(slot.id, { remoteUrl, progress: 100 });

        if (shouldSetPrimary) {
          onPrimaryChange(remoteUrl);
        } else {
          onGalleryChange([...galleryUrls, remoteUrl]);
        }

        setTimeout(() => {
          setSlots((prev) => prev.filter((s) => s.id !== slot.id));
        }, 500);
      } catch (err) {
        updateSlot(slot.id, {
          progress: null,
          error: err instanceof Error ? err.message : 'Upload failed',
        });
      }
    },
    [galleryUrls, onGalleryChange, onPrimaryChange, onUpload, primaryUrl, updateSlot]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (!list.length) return;
      list.forEach((file, i) => {
        processFile(file, i === 0 && !primaryUrl);
      });
    },
    [disabled, primaryUrl, processFile]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePrimary = () => {
    onPrimaryChange('');
    if (galleryUrls.length) {
      onPrimaryChange(galleryUrls[0]);
      onGalleryChange(galleryUrls.slice(1));
    }
  };

  const promoteGalleryImage = (url: string) => {
    const rest = galleryUrls.filter((u) => u !== url);
    if (primaryUrl) rest.unshift(primaryUrl);
    onPrimaryChange(url);
    onGalleryChange(rest);
  };

  const removeGalleryImage = (url: string) => {
    onGalleryChange(galleryUrls.filter((u) => u !== url));
  };

  const activeUpload = slots.find((s) => s.progress !== null && s.progress < 100);

  if (compact) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative h-12 w-12 rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${
            dragging ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-gray-600 hover:border-emerald-500/40 bg-gray-800/40'
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
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
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
            <p className="text-xs text-gray-400">Uploading image…</p>
          </div>
        ) : displayPrimary ? (
          <div className="relative aspect-[4/3] group">
            <img
              src={displayPrimary}
              alt="Product"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <p className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Click or drop to replace
              </p>
            </div>
            {displayPrimary && displayPrimary !== DEFAULT_IMAGE && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePrimary(); }}
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
          {slots.filter((s) => s.error).map((s) => (
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
