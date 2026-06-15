/*
  COMPLETE DATABASE & STORAGE SETUP FOR LUXURY PERFUME STORE
  ========================================================
  
  This script creates:
  1. Full application database schema (brands, categories, products, customers, orders)
  2. Storage bucket for perfume images
  3. Security policies for public read and admin-only write access
  4. Sample data for testing
  
  Run this in Supabase SQL Editor with a service_role key for best results.
*/

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create schema
create schema if not exists ecommerce;
set search_path = ecommerce, public;

-- ============================================================================ --
-- APPLICATION DATABASE                                                         --
-- ============================================================================ --

-- Perfume categories (e.g., Floral, Woody, Oriental, Fresh, etc.)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Brands (Creed, Amouage, Roja Dove, etc.)
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Main products table – tailored for luxury fragrances
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                    -- e.g. "Aventus", "Oud Wood Intense"
  slug text UNIQUE NOT NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  
  description text DEFAULT '',
  short_description text DEFAULT '',
  
  -- Perfume-specific fields
  concentration text CHECK (concentration IN ('Extrait de Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Parfum')), 
  year_launched integer,
  perfumer text,                         -- e.g. "Olivier Creed", "Dominique Ropion"
  
  -- Pricing & inventory
  price decimal(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price decimal(12,2),        -- for showing discounts
  volume_ml integer NOT NULL,            -- 50, 100, 200 etc.
  stock integer DEFAULT 0 CHECK (stock >= 0),
  
  -- Visuals & SEO
  featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_limited boolean DEFAULT false,
  image_url text DEFAULT '',             -- main bottle image
  gallery_urls text[] DEFAULT '{}',      -- additional lifestyle / detail shots
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notes pyramid (Top, Heart, Base notes)
CREATE TABLE IF NOT EXISTS product_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  layer text NOT NULL CHECK (layer IN ('top', 'heart', 'base')),
  note text NOT NULL,                    -- e.g. "Bergamot", "Oud", "Vanilla"
  created_at timestamptz DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  country text DEFAULT 'France',
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' 
    CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount decimal(12,2) DEFAULT 0 CHECK (total_amount >= 0),
  currency text DEFAULT 'EUR',
  payment_intent_id text,                -- Stripe, PayPal, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items (one perfume per line – no size/color)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(12,2) NOT NULL CHECK (price >= 0),  -- price at time of purchase
  volume_ml integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================ --
-- DATABASE INDEXES                                                             --
-- ============================================================================ --

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_notes_product ON product_notes(product_id);

-- ============================================================================ --
-- IMAGE STORAGE                                                                --
-- ============================================================================ --

-- Create the public bucket for perfume images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'perfume-images',
  'perfume-images',
  true,                              -- public = true → files readable without auth
  10 * 1024 * 1024,                  -- 10 MB max per file (adjust as needed)
  '{image/jpeg,image/png,image/webp}' -- only images allowed
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (this is already true by default, but just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================ --
-- STORAGE POLICIES                                                             --
-- ============================================================================ --

-- Drop any old/conflicting policies on this bucket (safe to run multiple times)
DROP POLICY IF EXISTS "Public read perfume images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload perfume images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update perfume images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete perfume images" ON storage.objects;
DROP POLICY IF EXISTS "Admin list perfume images" ON storage.objects;

-- Anyone (even anonymous) can view images
CREATE POLICY "Public read perfume images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'perfume-images');

-- Only authenticated admins can upload
CREATE POLICY "Admin upload perfume images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    -- Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Only admins can update (replace) images
CREATE POLICY "Admin update perfume images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    -- Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Only admins can delete images
CREATE POLICY "Admin delete perfume images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    -- Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Optional: Allow admins to see the full list in Supabase dashboard
CREATE POLICY "Admin list perfume images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    -- Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Apply policies to storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================ --
-- SAMPLE DATA                                                                  --
-- ============================================================================ --

-- Categories
INSERT INTO categories (name, slug, description) VALUES
  ('Floral', 'floral', 'Delicate and romantic bouquets of flowers'),
  ('Woody', 'woody', 'Rich, warm woods and resins'),
  ('Oriental', 'oriental', 'Exotic spices, vanilla and amber'),
  ('Fresh', 'fresh', 'Citrus, aquatic and green fragrances'),
  ('Oud', 'oud', 'Precious agarwood compositions'),
  ('Niche', 'niche', 'Artisanal and avant-garde creations')
ON CONFLICT (name) DO NOTHING;

-- Brands
INSERT INTO brands (name, slug, description, logo_url) VALUES
  ('Creed', 'creed', 'Historic French perfume house since 1760', ''),
  ('Amouage', 'amouage', 'Omani luxury fragrance house', ''),
  ('Roja Dove', 'roja-dove', 'British master perfumer', ''),
  ('Byredo', 'byredo', 'Modern minimalist luxury', ''),
  ('Maison Francis Kurkdjian', 'mfk', 'Contemporary Parisian elegance', ''),
  ('Clive Christian', 'clive-christian', 'The world''s most expensive perfumes', ''),
  ('Initio', 'initio', 'Luxury niche fragrance house with magnetic compositions', '')
ON CONFLICT (name) DO NOTHING;

-- Sample luxury perfumes
INSERT INTO products (
  name, slug, brand_id, category_id, description, short_description,
  concentration, year_launched, perfumer, price, volume_ml, stock, featured, is_new, is_limited,
  image_url
) VALUES
  (
    'Aventus', 'aventus', 
    (SELECT id FROM brands WHERE name = 'Creed'),
    (SELECT id FROM categories WHERE name = 'Fresh'),
    'The bestselling men''s fragrance in the history of The House of Creed, Aventus celebrates strength, vision and success.',
    'Iconic pineapple & birch masterpiece',
    'Eau de Parfum', 2010, 'Olivier Creed',
    325.00, 100, 42, true, false, false,
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800'
  ),
  (
    'Interlude Man', 'interlude-man',
    (SELECT id FROM brands WHERE name = 'Amouage'),
    (SELECT id FROM categories WHERE name = 'Woody'),
    'A spicy and woody masterpiece that depicts an emotive journey of a soul seeking tranquility amidst chaos.',
    'Smoky oregano & incense bomb',
    'Eau de Parfum', 2012, 'Pierre Negrin',
    380.00, 100, 18, true, false, true,
    'https://images.unsplash.com/photo-1622473596120-3b1b7fc2e4e5?w=800'
  ),
  (
    'Baccarat Rouge 540', 'baccarat-rouge-540',
    (SELECT id FROM brands WHERE name = 'Maison Francis Kurkdjian'),
    (SELECT id FROM categories WHERE name = 'Oriental'),
    'A poetic alchemy where amber and woody notes meet saffron and jasmine.',
    'The most complimented fragrance in the world',
    'Extrait de Parfum', 2015, 'Francis Kurkdjian',
    465.00, 70, 8, true, true, true,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
  ),
  (
    'Oud for Greatness', 'oud-for-greatness',
    (SELECT id FROM brands WHERE name = 'Initio'),
    (SELECT id FROM categories WHERE name = 'Oud'),
    'A mystical oud composition with saffron, nutmeg and lavender.',
    'Dark, regal oud masterpiece',
    'Extrait de Parfum', 2018, null,
    395.00, 90, 25, true, false, false,
    'https://images.unsplash.com/photo-1579636056487-2ff66db2c2cc?w=800'
  ),
  (
    'Enigma Pour Homme', 'enigma-pour-homme',
    (SELECT id FROM brands WHERE name = 'Roja Dove'),
    (SELECT id FROM categories WHERE name = 'Oriental'),
    'A rich cognac and tobacco creation of unparalleled luxury.',
    'The ultimate cognac & vanilla scent',
    'Parfum', 2019, 'Roja Dove',
    1450.00, 100, 3, true, false, true,
    'https://images.unsplash.com/photo-1541643600928-6363a7ec2dc7?w=800'
  )
ON CONFLICT (slug) DO NOTHING;

-- Sample notes for Aventus
INSERT INTO product_notes (product_id, layer, note) VALUES
  ((SELECT id FROM products WHERE name = 'Aventus'), 'top', 'Pineapple'),
  ((SELECT id FROM products WHERE name = 'Aventus'), 'top', 'Bergamot'),
  ((SELECT id FROM products WHERE name = 'Aventus'), 'top', 'Black Currant'),
  ((SELECT id FROM products WHERE name = 'Aventus'), 'heart', 'Birch'),
  ((SELECT id FROM products WHERE name = 'Aventus'), 'heart', 'Patchouli'),
  ((SELECT id FROM products WHERE name = 'Aventus'), 'base', 'Musk'),
  ((SELECT id FROM products WHERE name = 'Aventus'), 'base', 'Oakmoss'),
  ((SELECT id FROM products WHERE name = 'Aventus'), 'base', 'Vanilla');

-- ============================================================================ --
-- SETUP COMPLETE                                                               --
-- ============================================================================ --

/*
  WHAT THIS SCRIPT DOES:
  =====================
  
  1. Creates a fully-functional database schema for a luxury perfume store:
     - Brand and category management
     - Detailed product catalog with perfume-specific attributes
     - Customer records and order management
     - Fragrance notes pyramid (top/heart/base notes)
     
  2. Sets up secure image storage:
     - Public read access for all users (including anonymous)
     - Admin-only write/update/delete access
     - MIME type restrictions (only images allowed)
     - File size limits (10MB per file)
     
  3. Includes sample data for immediate testing:
     - 7 popular perfume brands
     - 6 major fragrance categories
     - 5 premium perfumes with full details
     - Notes information for one perfume

  USAGE INSTRUCTIONS:
  ==================
  
  1. Replace 'admin@yourdomain.com' with your actual admin email in all policies
  2. Run this script in Supabase SQL Editor
  3. Upload images to the 'perfume-images' bucket via dashboard or API
  4. Access images publicly via:
     https://YOUR_SUPABASE_PROJECT.supabase.co/storage/v1/object/public/perfume-images/FILENAME.jpg
*/