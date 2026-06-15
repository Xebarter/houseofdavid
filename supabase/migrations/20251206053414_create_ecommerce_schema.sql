/*
  # Create E-commerce Schema for Alethea Industrials Ltd

  ## Overview
  Complete database schema for an e-commerce footwear store with customer orders and admin management capabilities.

  ## New Tables
  
  ### 1. `categories`
  Product categories for organizing footwear
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name (e.g., "Sneakers", "Boots")
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `products`
  Industrial products available for purchase
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `category_id` (uuid, foreign key) - Links to categories
  - `image_url` (text) - Product image URL
  - `sizes` (text[]) - Available sizes
  - `colors` (text[]) - Available colors
  - `stock` (integer) - Available stock quantity
  - `featured` (boolean) - Whether product is featured
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `customers`
  Customer information
  - `id` (uuid, primary key)
  - `email` (text, unique) - Customer email
  - `name` (text) - Customer full name
  - `phone` (text) - Phone number
  - `address` (text) - Shipping address
  - `city` (text) - City
  - `postal_code` (text) - Postal code
  - `country` (text) - Country
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `orders`
  Customer orders
  - `id` (uuid, primary key)
  - `customer_id` (uuid, foreign key) - Links to customers
  - `status` (text) - Order status (pending, processing, shipped, delivered, cancelled)
  - `total_amount` (decimal) - Total order amount
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `order_items`
  Individual items within orders
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - Links to orders
  - `product_id` (uuid, foreign key) - Links to products
  - `quantity` (integer) - Quantity ordered
  - `price` (decimal) - Price at time of order
  - `size` (text) - Selected size
  - `color` (text) - Selected color
  - `created_at` (timestamptz) - Creation timestamp

  ## Storage
  - Create 'images' storage bucket for product images
  - Configure bucket for public read access

  ## Notes
  
  - All tables use UUID primary keys with automatic generation
  - Foreign key constraints ensure data integrity
  - Timestamps track creation and updates where applicable
  - Stock management included for inventory tracking
  - Order status tracking for fulfillment workflow
  - No RLS policies for simplified development
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  country text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) DEFAULT 0 CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  size text DEFAULT '',
  color text DEFAULT '',
  created_at timestamptz DEFAULT now()
);


-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Sneakers', 'Casual and athletic sneakers for everyday wear'),
  ('Boots', 'Sturdy and stylish boots for all seasons'),
  ('Sandals', 'Comfortable sandals for warm weather'),
  ('Heels', 'Elegant heels for special occasions'),
  ('Flats', 'Comfortable flat shoes for daily wear'),
  ('Athletic', 'Performance footwear for sports and fitness')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, sizes, colors, stock, featured) VALUES
  (
    'Classic Canvas Sneakers',
    'Timeless canvas sneakers with a comfortable fit, perfect for everyday wear',
    59.99,
    (SELECT id FROM categories WHERE name = 'Sneakers'),
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['White', 'Black', 'Navy', 'Red'],
    150,
    true
  ),
  (
    'Running Pro Elite',
    'High-performance running shoes with advanced cushioning technology',
    129.99,
    (SELECT id FROM categories WHERE name = 'Athletic'),
    'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['Blue', 'Black', 'Grey'],
    80,
    true
  ),
  (
    'Leather Combat Boots',
    'Durable leather boots with a rugged style and superior comfort',
    159.99,
    (SELECT id FROM categories WHERE name = 'Boots'),
    'https://images.pexels.com/photos/1476209/pexels-photo-1476209.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['Brown', 'Black'],
    60,
    true
  ),
  (
    'Summer Breeze Sandals',
    'Lightweight and breathable sandals for hot summer days',
    39.99,
    (SELECT id FROM categories WHERE name = 'Sandals'),
    'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11'],
    ARRAY['Tan', 'Black', 'White'],
    120,
    false
  ),
  (
    'Elegant Evening Heels',
    'Sophisticated heels perfect for formal events and special occasions',
    89.99,
    (SELECT id FROM categories WHERE name = 'Heels'),
    'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['5', '6', '7', '8', '9', '10'],
    ARRAY['Black', 'Red', 'Silver', 'Gold'],
    45,
    false
  ),
  (
    'Comfort Ballet Flats',
    'Stylish and comfortable flats for all-day wear',
    49.99,
    (SELECT id FROM categories WHERE name = 'Flats'),
    'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['5', '6', '7', '8', '9', '10'],
    ARRAY['Black', 'Beige', 'Pink', 'Navy'],
    90,
    false
  ),
  (
    'Trail Blazer Hiking Boots',
    'Waterproof hiking boots built for challenging terrain',
    179.99,
    (SELECT id FROM categories WHERE name = 'Boots'),
    'https://images.pexels.com/photos/1476209/pexels-photo-1476209.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['Brown', 'Green', 'Grey'],
    55,
    true
  ),
  (
    'Urban Street Sneakers',
    'Modern street-style sneakers with premium materials',
    99.99,
    (SELECT id FROM categories WHERE name = 'Sneakers'),
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['White', 'Black', 'Grey', 'Blue'],
    110,
    true
  )
ON CONFLICT DO NOTHING;

-- Enable uuid-ossp extension for UUID generation
create extension if not exists "uuid-ossp";

-- Create ecommerce schema
create schema if not exists ecommerce;

-- Products table
create table if not exists ecommerce.products (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table if not exists ecommerce.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name varchar(255) not null,
  customer_email varchar(255) not null,
  customer_phone varchar(50),
  shipping_address text not null,
  total_amount decimal(10,2) not null,
  status varchar(50) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order items table
create table if not exists ecommerce.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references ecommerce.orders(id) on delete cascade,
  product_id uuid references ecommerce.products(id),
  quantity integer not null,
  price decimal(10,2) not null
);

-- Insert sample products
insert into ecommerce.products (name, description, price, image_url) values
  ('Industrial Safety Boots', 'Premium quality safety boots for industrial use', 89.99, 'https://images.unsplash.com/photo-1584192382484-8f78dea0d165?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'),
  ('Heavy-Duty Work Gloves', 'Durable work gloves for heavy-duty tasks', 24.99, 'https://images.unsplash.com/photo-1604977096125-6b6aa81cbbaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'),
  ('Tool Kit Set', 'Complete tool kit for industrial applications', 149.99, 'https://images.unsplash.com/photo-1586390940930-1ac51ca1c9d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'),
  ('Protective Eyewear', 'Safety glasses for industrial environments', 39.99, 'https://images.unsplash.com/photo-1611832388266-8a6dcd0ec385?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80');
