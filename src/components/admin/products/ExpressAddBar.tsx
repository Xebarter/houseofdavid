'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { Sparkles, Command } from 'lucide-react';
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminProgressRing,
} from '@/components/admin/ui/AdminUI';
import { ProductImageZone } from './ProductImageZone';

type CategoryOption = { id: string; name: string };

type ExpressAddBarProps = {
  form: { name: string; price: string; stock: string; category_id: string; image_url: string };
  onChange: (patch: Partial<ExpressAddBarProps['form']>) => void;
  categoryOptions: CategoryOption[];
  saveProgress: number | null;
  disabled: boolean;
  imageUploading: boolean;
  onSubmit: () => void;
  onOpenComposer: () => void;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<string>;
  onUploadStateChange: (uploading: boolean) => void;
};

export function ExpressAddBar({
  form,
  onChange,
  categoryOptions,
  saveProgress,
  disabled,
  imageUploading,
  onSubmit,
  onOpenComposer,
  onUpload,
  onUploadStateChange,
}: ExpressAddBarProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gray-800/90 bg-gradient-to-br from-gray-900/95 via-gray-900/80 to-gray-950 shadow-lg"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/30">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-100">Express Publish</h2>
            <p className="text-xs text-gray-500">Add a product in seconds — full details available anytime</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-wider">
            <Command className="h-3 w-3" />
            <span>↵ to publish</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-1 flex justify-center lg:justify-start">
            <ProductImageZone
              compact
              primaryUrl={form.image_url}
              galleryUrls={[]}
              onPrimaryChange={(url) => onChange({ image_url: url })}
              onGalleryChange={() => {}}
              onUpload={onUpload}
              onUploadStateChange={onUploadStateChange}
              disabled={disabled}
            />
          </div>

          <div className="lg:col-span-4">
            <AdminInput
              ref={nameRef}
              placeholder="Product name"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              disabled={disabled}
              className="bg-gray-950/60"
            />
          </div>

          <div className="lg:col-span-2">
            <AdminInput
              type="number"
              placeholder="Price (UGX)"
              min="1"
              step="1"
              value={form.price}
              onChange={(e) => onChange({ price: e.target.value })}
              disabled={disabled}
              className="bg-gray-950/60"
            />
          </div>

          <div className="lg:col-span-2">
            <AdminSelect
              value={form.category_id}
              onChange={(e) => onChange({ category_id: e.target.value })}
              disabled={disabled}
              className="bg-gray-950/60"
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </AdminSelect>
          </div>

          <div className="lg:col-span-1">
            <AdminInput
              type="number"
              placeholder="Stock"
              min="0"
              value={form.stock}
              onChange={(e) => onChange({ stock: e.target.value })}
              disabled={disabled}
              className="bg-gray-950/60"
            />
          </div>

          <div className="lg:col-span-2 flex gap-2">
            <AdminButton
              type="button"
              onClick={onSubmit}
              disabled={disabled || imageUploading}
              className="flex-1 whitespace-nowrap"
              icon={
                saveProgress !== null ? (
                  <AdminProgressRing progress={saveProgress} size={18} strokeWidth={2} />
                ) : undefined
              }
            >
              {saveProgress !== null
                ? saveProgress >= 100
                  ? 'Published'
                  : `${saveProgress}%`
                : imageUploading
                  ? 'Uploading…'
                  : 'Publish'}
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={onOpenComposer}
              disabled={disabled}
              className="px-3"
              title="Open full editor"
            >
              ···
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
