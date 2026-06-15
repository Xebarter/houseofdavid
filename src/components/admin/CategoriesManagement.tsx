'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} from '@/lib/firestore';
import type { Category } from '@/lib/types';
import {
  AdminPage,
  AdminPageHeader,
  AdminLoading,
  AdminAlert,
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
  AdminModal,
  AdminModalBody,
  AdminModalFooter,
  AdminLabel,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/ui/AdminUI';

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err: unknown) {
      setError('Failed to load categories: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug || '', description: category.description || '' });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim(),
    };

    try {
      setError(null);
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        setSuccess('Category updated successfully!');
      } else {
        await createCategory(categoryData);
        setSuccess('Category added successfully!');
      }
      setTimeout(() => { setShowModal(false); setSuccess(null); }, 1500);
      loadData();
    } catch (err: unknown) {
      setError('Failed to save category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const products = await getProductsByCategory(id);
      if (products.length > 0) {
        setError('Cannot delete category because it is assigned to one or more products.');
        return;
      }
      await deleteCategory(id);
      setSuccess('Category deleted successfully!');
      loadData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: unknown) {
      setError('Failed to delete category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  if (loading) {
    return <AdminLoading label="Loading categories..." />;
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
        action={
          <AdminButton onClick={openAddModal} icon={<Plus className="h-4 w-4" />}>
            Add Category
          </AdminButton>
        }
      />

      {error && !showModal && <AdminAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && !showModal && <AdminAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      <AdminTableWrapper>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Name</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>Description</AdminTh>
            <AdminTh>Actions</AdminTh>
          </AdminTableHead>
          <AdminTableBody>
            {categories.map((category) => (
              <AdminTr key={category.id}>
                <AdminTd className="font-medium text-stone-100">{category.name}</AdminTd>
                <AdminTd className="font-mono text-xs text-gray-400">{category.slug}</AdminTd>
                <AdminTd className="text-gray-400 max-w-xs truncate">
                  {category.description || '—'}
                </AdminTd>
                <AdminTd>
                  <div className="flex gap-1">
                    <AdminIconButton label="Edit category" variant="primary" onClick={() => openEditModal(category)}>
                      <Edit className="h-4 w-4" />
                    </AdminIconButton>
                    <AdminIconButton label="Delete category" variant="danger" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </AdminIconButton>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTableBody>
        </AdminTable>
        {categories.length === 0 && (
          <AdminEmptyState message="No categories found. Add your first category to get started." />
        )}
      </AdminTableWrapper>

      {showModal && (
        <AdminModal
          title={editingCategory ? 'Edit Category' : 'Add Category'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <AdminModalBody>
              {error && <AdminAlert type="error" message={error} />}
              {success && <AdminAlert type="success" message={success} />}

              <div>
                <AdminLabel required>Name</AdminLabel>
                <AdminInput
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <AdminLabel>Slug</AdminLabel>
                <AdminInput
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated from name"
                />
              </div>
              <div>
                <AdminLabel>Description</AdminLabel>
                <AdminTextarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </AdminModalBody>

            <div className="px-6 pb-6">
              <AdminModalFooter>
                <AdminButton type="submit" className="flex-1">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </AdminButton>
                <AdminButton type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </AdminButton>
              </AdminModalFooter>
            </div>
          </form>
        </AdminModal>
      )}
    </AdminPage>
  );
}
