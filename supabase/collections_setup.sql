/*
  COLLECTIONS EXTENSION FOR LUXURY PERFUME STORE
  =============================================
  
  This script adds advanced collections functionality to the existing database schema.
  It allows assigning specific products to specific collections, rather than just 
  grouping by category.
  
  Features:
  1. Junction table for many-to-many relationship between products and collections
  2. Enhanced collections with metadata
  3. Functions for easy management
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set schema
SET search_path = ecommerce, public;

-- ============================================================================ --
-- PRODUCT-COLLECTION JUNCTION TABLE                                            --
-- ============================================================================ --

-- Create the junction table for product-collection relationships
CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a product can only be added to a collection once
  UNIQUE(product_id, category_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_collections_product ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_category ON product_collections(category_id);

-- ============================================================================ --
-- ENHANCED COLLECTIONS TABLE                                                   --
-- ============================================================================ --

-- Add additional fields to categories (collections) table for enhanced functionality
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ============================================================================ --
-- HELPER FUNCTIONS                                                             --
-- ============================================================================ --

-- Function to get all products in a collection
CREATE OR REPLACE FUNCTION get_collection_products(collection_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  brand_id UUID,
  category_id UUID,
  description TEXT,
  short_description TEXT,
  concentration TEXT,
  year_launched INTEGER,
  perfumer TEXT,
  price DECIMAL(12,2),
  compare_at_price DECIMAL(12,2),
  volume_ml INTEGER,
  stock INTEGER,
  featured BOOLEAN,
  is_new BOOLEAN,
  is_limited BOOLEAN,
  image_url TEXT,
  gallery_urls TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM products p
  INNER JOIN product_collections pc ON p.id = pc.product_id
  WHERE pc.category_id = collection_id
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all collections that contain a product
CREATE OR REPLACE FUNCTION get_product_collections(product_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  featured BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug, c.description, c.image_url, c.featured, c.sort_order, c.created_at
  FROM categories c
  INNER JOIN product_collections pc ON c.id = pc.category_id
  WHERE pc.product_id = product_id
  ORDER BY c.sort_order, c.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================ --
-- SAMPLE DATA                                                                  --
-- ============================================================================ --

-- Example of how to assign products to collections:
/*
INSERT INTO product_collections (product_id, category_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN categories c
WHERE c.name = 'Woody' AND p.name IN ('Aventus', 'Oud Wood');

INSERT INTO product_collections (product_id, category_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN categories c
WHERE c.name = 'Oriental' AND p.name IN ('Baccarat Rouge 540', 'Enigma Pour Homme');
*/

-- ============================================================================ --
-- RLS POLICIES                                                                 --
-- ============================================================================ --

-- Enable RLS on the junction table
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (admins)
CREATE POLICY "Admins can manage product collections"
ON product_collections
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email = 'admin@yourdomain.com'
  )
);

CREATE POLICY "Product collections are viewable by everyone"
ON product_collections
FOR SELECT
USING (true);

-- ============================================================================ --
-- SETUP COMPLETE                                                               --
-- ============================================================================ --

/*
  HOW TO USE THIS SCRIPT:
  ======================
  
  1. Replace 'admin@yourdomain.com' with your actual admin email
  2. Run this script in Supabase SQL Editor
  3. Use the junction table product_collections to assign products to collections:
     
     -- Add a product to a collection
     INSERT INTO product_collections (product_id, category_id)
     VALUES ('[PRODUCT_UUID]', '[CATEGORY_UUID]');
     
     -- Remove a product from a collection
     DELETE FROM product_collections
     WHERE product_id = '[PRODUCT_UUID]' AND category_id = '[CATEGORY_UUID]';
     
     -- Get all products in a collection
     SELECT * FROM get_collection_products('[CATEGORY_UUID]');
     
     -- Get all collections for a product
     SELECT * FROM get_product_collections('[PRODUCT_UUID]');
     
  4. Query products in a collection:
     SELECT p.* 
     FROM products p
     INNER JOIN product_collections pc ON p.id = pc.product_id
     WHERE pc.category_id = '[CATEGORY_UUID]';
*/