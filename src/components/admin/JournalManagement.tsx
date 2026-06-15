'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import {
  getAllJournalPosts,
  getJournalCategories,
  createJournalPost,
  updateJournalPost,
  deleteJournalPost,
} from '@/lib/firestore';
import type { JournalCategory, JournalPost } from '@/lib/types';
import { uploadImage } from '@/lib/upload';
import { useAuth } from '@/contexts/AuthContext';
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
  AdminSelect,
  AdminTextarea,
  StatusBadge,
} from '@/components/admin/ui/AdminUI';

export function JournalManagement() {
  const { getIdToken } = useAuth();
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', image_url: '',
    category_id: '', author: '', published: false,
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        getAllJournalPosts(),
        getJournalCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err: unknown) {
      setError('Failed to load journal data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingPost(null);
    setFormData({ title: '', slug: '', excerpt: '', content: '', image_url: '', category_id: categories[0]?.id || '', author: '', published: false });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  function openEditModal(post: JournalPost) {
    setEditingPost(post);
    setFormData({
      title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
      image_url: post.image_url, category_id: post.category_id || categories[0]?.id || '',
      author: post.author, published: post.published,
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  function generateSlug(title: string): string {
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null);
      if (!e.target.files?.length) return;
      const file = e.target.files[0];
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');
      setUploading(true);
      const imageUrl = await uploadImage(file, token, 'journal-');
      setFormData({ ...formData, image_url: imageUrl });
      setSuccess('Image uploaded successfully!');
      e.target.value = '';
    } catch (err: unknown) {
      setError('Failed to upload image: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      setError('Title, content, and category are required');
      return;
    }

    const postData = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || generateSlug(formData.title),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      image_url: formData.image_url.trim(),
      category_id: formData.category_id,
      author: formData.author.trim(),
      published: formData.published,
      published_at: formData.published ? (editingPost?.published_at || new Date().toISOString()) : null,
    };

    try {
      setError(null);
      if (editingPost) {
        await updateJournalPost(editingPost.id, postData);
        setSuccess('Journal post updated successfully!');
      } else {
        await createJournalPost(postData as Omit<JournalPost, 'id' | 'created_at' | 'updated_at'>);
        setSuccess('Journal post added successfully!');
      }
      setTimeout(() => { setShowModal(false); setSuccess(null); }, 1500);
      loadData();
    } catch (err: unknown) {
      setError('Failed to save journal post: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this journal post?')) return;
    try {
      await deleteJournalPost(id);
      setSuccess('Journal post deleted successfully!');
      loadData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: unknown) {
      setError('Failed to delete journal post: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  if (loading) {
    return <AdminLoading label="Loading journal posts..." />;
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Journal"
        description={`${posts.length} post${posts.length !== 1 ? 's' : ''}`}
        action={
          <AdminButton onClick={openAddModal} icon={<Plus className="h-4 w-4" />}>
            Add Post
          </AdminButton>
        }
      />

      {error && !showModal && <AdminAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && !showModal && <AdminAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      <AdminTableWrapper>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Title</AdminTh>
            <AdminTh>Category</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Actions</AdminTh>
          </AdminTableHead>
          <AdminTableBody>
            {posts.map((post) => {
              const category = categories.find((cat) => cat.id === post.category_id);
              return (
                <AdminTr key={post.id}>
                  <AdminTd>
                    <span className="font-medium text-stone-100">{post.title}</span>
                    {post.author && (
                      <p className="text-xs text-gray-500 mt-0.5">by {post.author}</p>
                    )}
                  </AdminTd>
                  <AdminTd className="text-gray-400">{category?.name || 'Uncategorized'}</AdminTd>
                  <AdminTd>
                    <StatusBadge
                      status={post.published ? 'published' : 'draft'}
                      label={post.published ? 'Published' : 'Draft'}
                    />
                  </AdminTd>
                  <AdminTd>
                    <div className="flex gap-1">
                      <AdminIconButton label="Edit post" variant="primary" onClick={() => openEditModal(post)}>
                        <Edit className="h-4 w-4" />
                      </AdminIconButton>
                      <AdminIconButton label="Delete post" variant="danger" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </AdminIconButton>
                    </div>
                  </AdminTd>
                </AdminTr>
              );
            })}
          </AdminTableBody>
        </AdminTable>
        {posts.length === 0 && (
          <AdminEmptyState message="No journal posts found. Create your first post to get started." />
        )}
      </AdminTableWrapper>

      {showModal && (
        <AdminModal
          title={editingPost ? 'Edit Journal Post' : 'Add Journal Post'}
          onClose={() => setShowModal(false)}
          size="xl"
        >
          <form onSubmit={handleSubmit}>
            <AdminModalBody>
              {error && <AdminAlert type="error" message={error} />}
              {success && <AdminAlert type="success" message={success} />}

              <div>
                <AdminLabel required>Title</AdminLabel>
                <AdminInput
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <AdminLabel required>Content</AdminLabel>
                <AdminTextarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                />
              </div>

              <div>
                <AdminLabel>Excerpt</AdminLabel>
                <AdminTextarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  placeholder="Short summary for listings"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <AdminLabel required>Category</AdminLabel>
                  <AdminSelect
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </AdminSelect>
                </div>
                <div>
                  <AdminLabel>Author</AdminLabel>
                  <AdminInput
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <AdminLabel>Cover Image</AdminLabel>
                <div className="flex gap-2">
                  <AdminInput
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="URL or upload"
                    className="flex-1"
                  />
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <AdminButton
                    type="button"
                    variant="secondary"
                    disabled={uploading}
                    icon={<Upload className="h-4 w-4" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </AdminButton>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-800 text-amber-600 focus:ring-amber-500/40"
                />
                Publish immediately
              </label>
            </AdminModalBody>

            <div className="px-6 pb-6">
              <AdminModalFooter>
                <AdminButton type="submit" disabled={uploading} className="flex-1">
                  {editingPost ? 'Update Post' : 'Add Post'}
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
