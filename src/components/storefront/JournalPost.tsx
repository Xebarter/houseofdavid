'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { getJournalPostBySlug, getJournalCategoryById } from '@/lib/firestore';
import type { JournalCategory, JournalPost } from '@/lib/types';
import { Header } from './Header';
import { Footer } from './Footer';
import { Cart } from './Cart';

export function JournalPost() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const router = useRouter();
  const [post, setPost] = useState<JournalPost | null>(null);
  const [category, setCategory] = useState<JournalCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  async function loadPost() {
    try {
      setLoading(true);
      setError(null);

      const postData = await getJournalPostBySlug(slug);
      if (!postData) throw new Error('Post not found');

      setPost(postData);

      if (postData.category_id) {
        const categoryData = await getJournalCategoryById(postData.category_id);
        if (categoryData) setCategory(categoryData);
      }
    } catch (err: unknown) {
      console.error('Error loading post:', err);
      setError('Failed to load journal post: ' + (err instanceof Error ? err.message : 'Post not found'));
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">
            {error ? 'Error Loading Post' : 'Post Not Found'}
          </h2>
          <p className="text-amber-200 mb-6">{error || "The journal post you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push('/journal')}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header onCartClick={() => setShowCart(true)} />

      <main className="flex-grow pt-16">
        <section className="py-12 bg-gradient-to-r from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link href="/journal" className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal
              </Link>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {category && (
                  <span className="flex items-center text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30 text-amber-300">
                    <Tag className="h-4 w-4 mr-1" />
                    {category.name}
                  </span>
                )}
                {post.published_at && (
                  <span className="flex items-center text-sm text-amber-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                {post.author && (
                  <span className="flex items-center text-sm text-amber-400">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-amber-50 mb-6">{post.title}</h1>
              {post.excerpt && <p className="text-xl text-amber-200">{post.excerpt}</p>}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="w-full h-96 object-cover rounded-xl mb-12" />
              )}
              <div
                className="prose prose-lg prose-invert max-w-none text-amber-100
                  prose-headings:text-amber-50 prose-p:text-amber-100
                  prose-a:text-amber-500 hover:prose-a:text-amber-400
                  prose-blockquote:border-l-amber-600 prose-li:text-amber-100
                  prose-strong:text-amber-50 prose-em:text-amber-100
                  prose-code:text-amber-100 prose-pre:bg-gray-800
                  prose-pre:text-amber-50 prose-table:text-amber-50
                  prose-table-row:border-amber-800 prose-hr:border-amber-700"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} onCheckout={() => {}} />
    </div>
  );
}
