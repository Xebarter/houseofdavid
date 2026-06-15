/*
  # Create Journal Tables for Perfume Blog

  ## Overview
  Database tables for managing a perfume journal/blog section.

  ## New Tables
  
  ### 1. `journal_categories`
  Categories for journal posts
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name (e.g., "Reviews", "Guides")
  - `slug` (text, unique) - URL-friendly version of name
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `journal_posts`
  Journal/blog posts
  - `id` (uuid, primary key)
  - `title` (text) - Post title
  - `slug` (text, unique) - URL-friendly version of title
  - `excerpt` (text) - Short excerpt/summary
  - `content` (text) - Full post content
  - `image_url` (text) - Featured image URL
  - `category_id` (uuid, foreign key) - Links to categories
  - `author` (text) - Author name
  - `published` (boolean) - Whether post is published
  - `published_at` (timestamptz) - Publication timestamp
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
*/

-- Create journal_categories table
CREATE TABLE IF NOT EXISTS journal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create journal_posts table
CREATE TABLE IF NOT EXISTS journal_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text NOT NULL,
  image_url text DEFAULT '',
  category_id uuid REFERENCES journal_categories(id) ON DELETE SET NULL,
  author text DEFAULT '',
  published boolean DEFAULT false,
  published_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_posts_category ON journal_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_journal_posts_published ON journal_posts(published);
CREATE INDEX IF NOT EXISTS idx_journal_posts_published_at ON journal_posts(published_at DESC);

-- Insert sample journal categories
INSERT INTO journal_categories (name, slug, description) VALUES
  ('Reviews', 'reviews', 'Perfume reviews and ratings'),
  ('Guides', 'guides', 'Fragrance buying guides and tips'),
  ('History', 'history', 'History of perfumery and iconic fragrances'),
  ('Interviews', 'interviews', 'Interviews with perfumers and industry experts')
ON CONFLICT (name) DO NOTHING;

-- Grant permissions for authenticated users
GRANT SELECT ON journal_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON journal_posts TO authenticated;

-- Grant permissions for anon users (for public access)
GRANT SELECT ON journal_categories TO anon;
GRANT SELECT ON journal_posts TO anon;

-- Enable Row Level Security
ALTER TABLE journal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_categories (public read, authenticated users full access)
CREATE POLICY "journal_categories_public_read" ON journal_categories
  FOR SELECT USING (true);

CREATE POLICY "journal_categories_authenticated_full_access" ON journal_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for journal_posts (public read published only, authenticated users full access)
CREATE POLICY "journal_posts_public_read" ON journal_posts
  FOR SELECT USING (published = true);

CREATE POLICY "journal_posts_authenticated_full_access" ON journal_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);