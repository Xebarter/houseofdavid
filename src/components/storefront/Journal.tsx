'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getJournalCategories, getPublishedJournalPosts } from '@/lib/firestore';
import type { JournalCategory, JournalPost } from '@/lib/types';
import { BRAND_NAME } from '@/lib/brand';
import { Header } from './Header';
import { Footer } from './Footer';
import { Cart } from './Cart';

export function Journal() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  async function loadData() {
    try {
      setLoading(true);
      const categoriesData = await getJournalCategories();
      setCategories(categoriesData);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading data:', err);
      setError('Failed to load journal categories: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      loadPosts();
    }
  }

  async function loadPosts() {
    try {
      const data = await getPublishedJournalPosts(
        selectedCategory !== 'all' ? selectedCategory : undefined
      );
      setPosts(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading posts:', err);
      setError('Failed to load journal posts: ' + (err instanceof Error ? err.message : 'Unknown error'));
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

  function getCategoryName(id: string): string {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.name : 'Uncategorized';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header onCartClick={() => setShowCart(true)} />

      <main className="flex-grow pt-16">
        <section className="py-16 bg-gradient-to-r from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-50 mb-4">{BRAND_NAME} Journal</h1>
              <p className="text-xl text-amber-100 mb-8">
                Discover the art and science of perfumery through our curated collection of articles,
                guides, and stories.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-amber-200 hover:bg-gray-600'
                }`}
              >
                All Posts
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-amber-200 hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-8">
                <p>{error}</p>
              </div>
            )}

            {posts.length === 0 && !error ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-medium text-amber-50 mb-2">No posts found</h3>
                <p className="text-amber-200">Check back later for new journal entries.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto justify-items-center">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-md"
                  >
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="bg-gray-700 h-48 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-amber-500 opacity-50" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-900/30 text-amber-300">
                          {getCategoryName(post.category_id)}
                        </span>
                        <span className="text-sm text-amber-400">{formatDate(post.published_at)}</span>
                      </div>

                      <h2 className="text-xl font-bold text-amber-50 mb-3 line-clamp-2">{post.title}</h2>

                      <p className="text-amber-100 mb-4 line-clamp-3">
                        {post.excerpt || post.content.substring(0, 100) + '...'}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-400">
                          {post.author && `By ${post.author}`}
                        </span>
                        <Link
                          href={`/journal/${post.slug}`}
                          className="text-amber-500 hover:text-amber-400 font-medium text-sm flex items-center"
                        >
                          Read more
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} onCheckout={() => {}} />
    </div>
  );
}
