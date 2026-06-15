'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Brand, Category, Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import {
  AdminSlideOver,
  AdminFormSection,
  AdminButton,
  AdminLabel,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminProgressRing,
} from '@/components/admin/ui/AdminUI';
import { ProductImageZone } from './ProductImageZone';
import {
  type ProductFormData,
  CONCENTRATIONS,
  slugify,
  formToPreviewProduct,
} from './productFormUtils';

type CategoryOption = { id: string; name: string };

type ProductComposerProps = {
  open: boolean;
  editingProduct: Product | null;
  form: ProductFormData;
  galleryUrls: string[];
  categories: Category[];
  brands: Brand[];
  categoryOptions: CategoryOption[];
  saveProgress: number | null;
  busy: boolean;
  imageUploading: boolean;
  onClose: () => void;
  onChange: (patch: Partial<ProductFormData>) => void;
  onGalleryChange: (urls: string[]) => void;
  onSave: (addAnother?: boolean) => void;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<string>;
  onUploadStateChange: (uploading: boolean) => void;
  getCategoryName: (id: string) => string;
};

function ProductLivePreview({
  product,
  categoryName,
  brandName,
}: {
  product: Product;
  categoryName: string;
  brandName?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-800/80 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Storefront preview</span>
        <span className="text-[10px] text-emerald-500/80">Live</span>
      </div>
      <div className="p-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-800 border border-white/5 mb-4">
          <img
            src={product.image_url}
            alt={product.name || 'Product preview'}
            className="w-full h-full object-cover"
          />
          {(product.featured || product.is_new || product.is_limited) && (
            <span className="absolute top-3 left-3 text-[9px] uppercase tracking-wider text-amber-400 border border-amber-500/30 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded">
              {product.is_limited ? 'Limited' : product.is_new ? 'New' : 'Featured'}
            </span>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          {brandName ? `${brandName} · ` : ''}{categoryName}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-amber-500/70 mb-2">
          {product.concentration} · {product.volume_ml}ml
        </p>
        <h3 className="text-base font-medium text-stone-100 line-clamp-2 mb-2">
          {product.name || 'Product name'}
        </h3>
        {product.short_description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.short_description}</p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-stone-200">
            {product.price > 0 ? formatCurrency(product.price) : '—'}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-gray-500 line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  );
}

export function ProductComposer({
  open,
  editingProduct,
  form,
  galleryUrls,
  brands,
  categoryOptions,
  saveProgress,
  busy,
  imageUploading,
  onClose,
  onChange,
  onGalleryChange,
  onSave,
  onUpload,
  onUploadStateChange,
  getCategoryName,
}: ProductComposerProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(false);
  const isBusy = busy || imageUploading;

  useEffect(() => {
    if (open && !editingProduct) {
      setTimeout(() => nameRef.current?.focus(), 120);
      slugTouched.current = false;
    }
  }, [open, editingProduct]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isBusy) {
        e.preventDefault();
        onSave(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, isBusy, onSave]);

  const handleNameChange = useCallback(
    (name: string) => {
      const patch: Partial<ProductFormData> = { name };
      if (!slugTouched.current && !editingProduct) {
        patch.slug = slugify(name);
      }
      onChange(patch);
    },
    [editingProduct, onChange]
  );

  const preview = formToPreviewProduct(form, galleryUrls);
  const brandName = brands.find((b) => b.id === form.brand_id)?.name;

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      <AdminButton type="button" variant="secondary" onClick={onClose} disabled={isBusy} className="sm:w-auto">
        Cancel
      </AdminButton>
      {!editingProduct && (
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => onSave(true)}
          disabled={isBusy}
          className="flex-1"
          icon={saveProgress !== null ? <AdminProgressRing progress={saveProgress} size={18} strokeWidth={2} /> : undefined}
        >
          {saveProgress !== null ? `Saving ${saveProgress}%` : 'Save & add another'}
        </AdminButton>
      )}
      <AdminButton
        type="button"
        onClick={() => onSave(false)}
        disabled={isBusy}
        className="flex-1"
        icon={saveProgress !== null ? <AdminProgressRing progress={saveProgress} size={18} strokeWidth={2} /> : undefined}
      >
        {saveProgress !== null
          ? saveProgress >= 100
            ? 'Saved'
            : `Publishing ${saveProgress}%`
          : editingProduct
            ? 'Update product'
            : 'Publish product'}
      </AdminButton>
    </div>
  );

  return (
    <AdminSlideOver
      open={open}
      title={editingProduct ? 'Edit product' : 'New product'}
      subtitle={editingProduct ? `Editing ${editingProduct.name}` : 'Complete catalog entry with live preview'}
      onClose={onClose}
      busy={isBusy}
      footer={footer}
      size="2xl"
    >
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-0 xl:gap-0 min-h-full">
        {/* Form column */}
        <div className="xl:col-span-3 p-6 space-y-8 border-b xl:border-b-0 xl:border-r border-gray-800/80">
          <AdminFormSection title="Essentials" description="Core details shoppers see first">
            <div className="space-y-4">
              <div>
                <AdminLabel required>Name</AdminLabel>
                <AdminInput
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={isBusy}
                  placeholder="e.g. Oud Royale"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <AdminLabel required>Price (UGX)</AdminLabel>
                  <AdminInput
                    type="number"
                    min="1"
                    step="1"
                    value={form.price}
                    onChange={(e) => onChange({ price: e.target.value })}
                    disabled={isBusy}
                    placeholder="150000"
                  />
                </div>
                <div>
                  <AdminLabel>Compare at price</AdminLabel>
                  <AdminInput
                    type="number"
                    min="0"
                    step="1"
                    value={form.compare_at_price}
                    onChange={(e) => onChange({ compare_at_price: e.target.value })}
                    disabled={isBusy}
                    placeholder="Optional sale anchor"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <AdminLabel required>Category</AdminLabel>
                  <AdminSelect
                    value={form.category_id}
                    onChange={(e) => onChange({ category_id: e.target.value })}
                    disabled={isBusy}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </AdminSelect>
                </div>
                <div>
                  <AdminLabel>Brand</AdminLabel>
                  <AdminSelect
                    value={form.brand_id}
                    onChange={(e) => onChange({ brand_id: e.target.value })}
                    disabled={isBusy}
                  >
                    <option value="">No brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </AdminSelect>
                </div>
                <div>
                  <AdminLabel>Stock</AdminLabel>
                  <AdminInput
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => onChange({ stock: e.target.value })}
                    disabled={isBusy}
                  />
                </div>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Media" description="Drag & drop — uploads run in the background">
            <ProductImageZone
              primaryUrl={form.image_url}
              galleryUrls={galleryUrls}
              onPrimaryChange={(url) => onChange({ image_url: url })}
              onGalleryChange={onGalleryChange}
              onUpload={onUpload}
              onUploadStateChange={onUploadStateChange}
              disabled={isBusy}
            />
          </AdminFormSection>

          <AdminFormSection title="Description" description="Rich copy for product pages and search">
            <div className="space-y-4">
              <div>
                <AdminLabel>Short description</AdminLabel>
                <AdminInput
                  value={form.short_description}
                  onChange={(e) => onChange({ short_description: e.target.value })}
                  disabled={isBusy}
                  placeholder="One-line hook for cards and listings"
                />
              </div>
              <div>
                <AdminLabel>Full description</AdminLabel>
                <AdminTextarea
                  value={form.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  disabled={isBusy}
                  rows={4}
                  placeholder="Notes, story, and wearing occasions"
                />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Fragrance profile">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AdminLabel>Concentration</AdminLabel>
                <AdminSelect
                  value={form.concentration}
                  onChange={(e) => onChange({ concentration: e.target.value })}
                  disabled={isBusy}
                >
                  {CONCENTRATIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </AdminSelect>
              </div>
              <div>
                <AdminLabel>Volume (ml)</AdminLabel>
                <AdminInput
                  type="number"
                  min="1"
                  value={form.volume_ml}
                  onChange={(e) => onChange({ volume_ml: e.target.value })}
                  disabled={isBusy}
                />
              </div>
              <div>
                <AdminLabel>Perfumer</AdminLabel>
                <AdminInput
                  value={form.perfumer}
                  onChange={(e) => onChange({ perfumer: e.target.value })}
                  disabled={isBusy}
                  placeholder="Optional"
                />
              </div>
              <div>
                <AdminLabel>Year launched</AdminLabel>
                <AdminInput
                  type="number"
                  min="1900"
                  max="2100"
                  value={form.year_launched}
                  onChange={(e) => onChange({ year_launched: e.target.value })}
                  disabled={isBusy}
                  placeholder="e.g. 2024"
                />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Visibility & merchandising">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AdminLabel>URL slug</AdminLabel>
                <AdminInput
                  value={form.slug}
                  onChange={(e) => {
                    slugTouched.current = true;
                    onChange({ slug: e.target.value });
                  }}
                  disabled={isBusy}
                  placeholder="auto-generated-from-name"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              {([
                { key: 'featured' as const, label: 'Featured', desc: 'Highlight on homepage' },
                { key: 'is_new' as const, label: 'New arrival', desc: 'Show new badge' },
                { key: 'is_limited' as const, label: 'Limited edition', desc: 'Scarcity badge' },
              ]).map(({ key, label, desc }) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors flex-1 min-w-[140px] ${
                    form[key]
                      ? 'border-emerald-700/50 bg-emerald-950/20'
                      : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => onChange({ [key]: e.target.checked })}
                    disabled={isBusy}
                    className="mt-0.5 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500/40"
                  />
                  <span>
                    <span className="block text-sm font-medium text-stone-200">{label}</span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </AdminFormSection>
        </div>

        {/* Preview column */}
        <div className="xl:col-span-2 p-6 bg-gray-900/30 xl:sticky xl:top-0 xl:self-start">
          <ProductLivePreview
            product={preview}
            categoryName={getCategoryName(form.category_id)}
            brandName={brandName}
          />
          <p className="text-[11px] text-gray-600 mt-4 text-center">
            ⌘/Ctrl + Enter to publish · Esc to close
          </p>
        </div>
      </div>
    </AdminSlideOver>
  );
}
