/*
  # Update E-commerce Schema for Luxury Perfume Store

  ## Changes
  - Remove shoe-specific columns (sizes, colors) from products table
  - Add perfume-specific columns (concentration, volume_ml, etc.) to products table
  - Add brands table for perfume brands
  - Add product_notes table for fragrance notes pyramid
  - Add additional fields to support perfume-specific features
*/

-- Create extension if not exists
create extension if not exists "uuid-ossp";

-- Set schema
set search_path = ecommerce, public;

-- Add brands table for perfume brands
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Add columns for perfume-specific data to products table
ALTER TABLE products 
  DROP COLUMN IF EXISTS sizes,
  DROP COLUMN IF EXISTS colors,
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS short_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS concentration text CHECK (concentration IN ('Extrait de Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Parfum')),
  ADD COLUMN IF NOT EXISTS year_launched integer,
  ADD COLUMN IF NOT EXISTS perfumer text,
  ADD COLUMN IF NOT EXISTS compare_at_price decimal(12,2),
  ADD COLUMN IF NOT EXISTS volume_ml integer,
  ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_limited boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';

-- Create product_notes table for fragrance notes pyramid
CREATE TABLE IF NOT EXISTS product_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  layer text NOT NULL CHECK (layer IN ('top', 'heart', 'base')),
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_product_notes_product ON product_notes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_notes_layer ON product_notes(layer);

-- Update order_items table to remove shoe-specific columns
ALTER TABLE order_items
  DROP COLUMN IF EXISTS size,
  DROP COLUMN IF EXISTS color,
  ADD COLUMN IF NOT EXISTS volume_ml integer;

-- Update storage bucket for perfume images
INSERT INTO storage.buckets (id, name, public)
VALUES ('perfume-images', 'perfume-images', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for perfume categories
INSERT INTO categories (name, slug, description) VALUES
  ('Floral', 'floral', 'Delicate and romantic bouquets of flowers'),
  ('Woody', 'woody', 'Rich, warm woods and resins'),
  ('Oriental', 'oriental', 'Exotic spices, vanilla and amber'),
  ('Fresh', 'fresh', 'Citrus, aquatic and green fragrances'),
  ('Oud', 'oud', 'Precious agarwood compositions'),
  ('Niche', 'niche', 'Artisanal and avant-garde creations')
ON CONFLICT (name) DO NOTHING;

-- Sample brands
INSERT INTO brands (name, slug, description) VALUES
  ('Creed', 'creed', 'Historic French perfume house since 1760'),
  ('Amouage', 'amouage', 'Omani luxury fragrance house'),
  ('Tom Ford', 'tom-ford', 'American luxury fashion and fragrance'),
  ('Maison Margiela', 'maison-margiela', 'Belgian avant-garde fashion house')
ON CONFLICT (name) DO NOTHING;