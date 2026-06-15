'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProducts,
  getCategories,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/firestore';
import type { Product, Category, Brand } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { uploadImage } from '@/lib/upload';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import {
  AdminPage,
  AdminPageHeader,
  AdminLoading,
  AdminButton,
  AdminIconButton,
  AdminTableWrapper,
  AdminTable,
  AdminTableHead,
  AdminTh,
  AdminTableBody,
  AdminTr,
  AdminTd,
  AdminEmptyState,
  AdminInput,
  StatusBadge,
} from '@/components/admin/ui/AdminUI';
import { ExpressAddBar } from '@/components/admin/products/ExpressAddBar';
import { ProductComposer } from '@/components/admin/products/ProductComposer';
import { AdminToastStack, useAdminToast } from '@/components/admin/products/AdminToast';
import {
  PERFUME_CATEGORIES,
  DEFAULT_IMAGE,
  type ProductFormData,
  makeEmptyForm,
  productToForm,
  buildProductPayload,
  validateProductForm,
  startSaveProgressTicker,
} from '@/components/admin/products/productFormUtils';

export function ProductManagement() {
  const { getIdToken } = useAuth();
  const { toasts, toast, dismiss } = useAdminToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(makeEmptyForm(''));
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [saveProgress, setSaveProgress] = useState<number | null>(null);

  const [expressForm, setExpressForm] = useState({
    name: '',
    price: '',
    stock: '10',
    category_id: '',
    image_url: '',
  });
  const [expressSaveProgress, setExpressSaveProgress] = useState<number | null>(null);
  const [expressImageUploading, setExpressImageUploading] = useState(false);
  const [composerImageUploading, setComposerImageUploading] = useState(false);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories.map((c) => ({ id: c.id, name: c.name }));
    return PERFUME_CATEGORIES;
  }, [categories]);

  const defaultCategoryId = useCallback(() => {
    return categoryOptions[0]?.id || '';
  }, [categoryOptions]);

  const getCategoryName = useCallback(
    (categoryId: string) => {
      const fromDb = categories.find((c) => c.id === categoryId);
      if (fromDb) return fromDb.name;
      return PERFUME_CATEGORIES.find((c) => c.id === categoryId)?.name || 'Uncategorized';
    },
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        getCategoryName(p.category_id).toLowerCase().includes(q)
    );
  }, [products, search, getCategoryName]);

  const isComposerBusy = saveProgress !== null || composerImageUploading;
  const isExpressBusy = expressSaveProgress !== null || expressImageUploading;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const id = defaultCategoryId();
    if (!id) return;
    setExpressForm((prev) => (prev.category_id ? prev : { ...prev, category_id: id }));
    setFormData((prev) => (prev.category_id ? prev : { ...prev, category_id: id }));
  }, [defaultCategoryId]);

  async function loadData() {
    try {
      setLoading(true);
      const [productsData, categoriesData, brandsData] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (err: unknown) {
      toast('error', 'Failed to load catalog: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const uploadProductImage = useCallback(
    async (file: File, onProgress: (percent: number) => void) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Use JPEG, PNG, GIF, or WebP');
      }
      if (file.size > 5_000_000) {
        throw new Error('Max file size is 5MB');
      }
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');
      onProgress(2);
      return uploadImage(file, token, '', onProgress);
    },
    [getIdToken]
  );

  function openComposer(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setFormData(productToForm(product, defaultCategoryId(), brands[0]?.id || ''));
      setGalleryUrls(product.gallery_urls || []);
    } else {
      setEditingProduct(null);
      setFormData(makeEmptyForm(defaultCategoryId(), brands[0]?.id || ''));
      setGalleryUrls([]);
    }
    setComposerOpen(true);
  }

  function openComposerFromExpress() {
    setEditingProduct(null);
    setFormData({
      ...makeEmptyForm(expressForm.category_id || defaultCategoryId(), brands[0]?.id || ''),
      name: expressForm.name,
      price: expressForm.price,
      stock: expressForm.stock || '10',
      image_url: expressForm.image_url,
    });
    setGalleryUrls([]);
    setComposerOpen(true);
  }

  function closeComposer() {
    if (saveProgress !== null) return;
    setComposerOpen(false);
    setEditingProduct(null);
  }

  async function persistProduct(
    form: ProductFormData,
    galleryUrls: string[],
    options: {
      setProgress: React.Dispatch<React.SetStateAction<number | null>>;
      editingProduct?: Product | null;
      addAnother?: boolean;
      onSuccess?: () => void;
      blockIfUploading?: boolean;
    }
  ) {
    const {
      setProgress,
      editingProduct: editTarget = null,
      addAnother = false,
      onSuccess,
      blockIfUploading = false,
    } = options;

    if (blockIfUploading && (expressImageUploading || composerImageUploading)) {
      toast('error', 'Wait for image upload to finish');
      return null;
    }

    const validationError = validateProductForm(form);
    if (validationError) {
      toast('error', validationError);
      return null;
    }

    const payload = buildProductPayload(form, galleryUrls);
    setProgress(5);
    const ticker = startSaveProgressTicker(setProgress);
    const now = new Date().toISOString();

    try {
      setProgress(25);

      if (editTarget) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editTarget.id
              ? { ...p, ...payload, id: editTarget.id, updated_at: now }
              : p
          )
        );

        await updateProduct(editTarget.id, payload);
        setProgress(100);
        toast('success', `"${payload.name}" updated`);
        setComposerOpen(false);
        setEditingProduct(null);
        return editTarget;
      }

      const tempId = `optimistic-${Date.now()}`;
      const optimistic: Product = {
        id: tempId,
        ...payload,
        gallery_urls: payload.gallery_urls || [],
        created_at: now,
        updated_at: now,
      };
      setProducts((prev) => [optimistic, ...prev]);
      setProgress(55);

      const created = await createProduct(payload);
      setProducts((prev) => prev.map((p) => (p.id === tempId ? created : p)));
      setProgress(100);
      toast('success', `"${created.name}" published to catalog`);

      onSuccess?.();

      if (addAnother) {
        setFormData(makeEmptyForm(defaultCategoryId(), brands[0]?.id || ''));
        setGalleryUrls([]);
        setEditingProduct(null);
      } else {
        setComposerOpen(false);
      }

      return created;
    } catch (err: unknown) {
      if (editTarget) {
        await loadData();
      } else {
        setProducts((prev) => prev.filter((p) => !p.id.startsWith('optimistic-')));
      }
      toast('error', 'Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return null;
    } finally {
      clearInterval(ticker);
      setTimeout(() => setProgress(null), 350);
    }
  }

  async function handleComposerSave(addAnother = false) {
    await persistProduct(formData, galleryUrls, {
      setProgress: setSaveProgress,
      editingProduct,
      addAnother,
      blockIfUploading: true,
    });
  }

  async function handleExpressPublish() {
    const draft: ProductFormData = {
      ...makeEmptyForm(expressForm.category_id || defaultCategoryId(), brands[0]?.id || ''),
      name: expressForm.name,
      price: expressForm.price,
      stock: expressForm.stock || '10',
      image_url: expressForm.image_url,
    };

    await persistProduct(draft, [], {
      setProgress: setExpressSaveProgress,
      editingProduct: null,
      blockIfUploading: true,
      onSuccess: () => {
        setExpressForm({
          name: '',
          price: '',
          stock: '10',
          category_id: expressForm.category_id || defaultCategoryId(),
          image_url: '',
        });
      },
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product from the catalog?')) return;
    const removed = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProduct(id);
      toast('success', 'Product removed');
    } catch (err: unknown) {
      if (removed) setProducts((prev) => [removed, ...prev]);
      toast('error', 'Delete failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  if (loading) {
    return <AdminLoading label="Loading catalog…" />;
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Products"
        description={`${products.length} SKU${products.length !== 1 ? 's' : ''} · Express publish or full editor`}
        action={
          <AdminButton onClick={() => openComposer()} icon={<Plus className="h-4 w-4" />}>
            New product
          </AdminButton>
        }
      />

      <div className="mb-6">
        <ExpressAddBar
          form={expressForm}
          onChange={(patch) => setExpressForm((prev) => ({ ...prev, ...patch }))}
          categoryOptions={categoryOptions}
          saveProgress={expressSaveProgress}
          disabled={isExpressBusy}
          imageUploading={expressImageUploading}
          onSubmit={handleExpressPublish}
          onOpenComposer={openComposerFromExpress}
          onUpload={uploadProductImage}
          onUploadStateChange={setExpressImageUploading}
        />
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <AdminInput
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900/60"
        />
      </div>

      <AdminTableWrapper>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Product</AdminTh>
            <AdminTh>Category</AdminTh>
            <AdminTh>Price</AdminTh>
            <AdminTh>Stock</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </AdminTableHead>
          <AdminTableBody>
            {filteredProducts.map((product) => (
              <AdminTr key={product.id}>
                <AdminTd>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url || DEFAULT_IMAGE}
                      alt=""
                      className="h-11 w-11 object-cover rounded-lg border border-gray-700/80 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-stone-100 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {product.concentration} · {product.volume_ml}ml
                      </p>
                    </div>
                  </div>
                </AdminTd>
                <AdminTd className="text-gray-400">{getCategoryName(product.category_id)}</AdminTd>
                <AdminTd className="font-medium tabular-nums">{formatCurrency(product.price)}</AdminTd>
                <AdminTd>
                  <span
                    className={
                      product.stock <= 0
                        ? 'text-red-400'
                        : product.stock <= 5
                          ? 'text-amber-400'
                          : 'text-stone-200'
                    }
                  >
                    {product.stock}
                  </span>
                </AdminTd>
                <AdminTd>
                  <div className="flex flex-wrap gap-1">
                    {product.featured && <StatusBadge status="featured" label="Featured" />}
                    {product.is_new && <StatusBadge status="published" label="New" />}
                    {product.is_limited && <StatusBadge status="pending" label="Limited" />}
                    {!product.featured && !product.is_new && !product.is_limited && (
                      <StatusBadge status="regular" label="Active" />
                    )}
                  </div>
                </AdminTd>
                <AdminTd>
                  <div className="flex gap-1 justify-end">
                    <AdminIconButton label="Edit" variant="primary" onClick={() => openComposer(product)}>
                      <Edit className="h-4 w-4" />
                    </AdminIconButton>
                    <AdminIconButton label="Delete" variant="danger" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </AdminIconButton>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTableBody>
        </AdminTable>
        {filteredProducts.length === 0 && (
          <AdminEmptyState
            message={
              search
                ? 'No products match your search.'
                : 'Catalog is empty. Use Express Publish above to add your first product.'
            }
          />
        )}
      </AdminTableWrapper>

      <ProductComposer
        open={composerOpen}
        editingProduct={editingProduct}
        form={formData}
        galleryUrls={galleryUrls}
        categories={categories}
        brands={brands}
        categoryOptions={categoryOptions}
        saveProgress={saveProgress}
        busy={saveProgress !== null}
        imageUploading={composerImageUploading}
        onClose={closeComposer}
        onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
        onGalleryChange={setGalleryUrls}
        onSave={handleComposerSave}
        onUpload={uploadProductImage}
        onUploadStateChange={setComposerImageUploading}
        getCategoryName={getCategoryName}
      />

      <AdminToastStack toasts={toasts} onDismiss={dismiss} />
    </AdminPage>
  );
}
