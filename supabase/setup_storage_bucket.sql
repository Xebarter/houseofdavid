/*
  Setup script for perfume-images storage bucket
  Run this script in Supabase SQL Editor to create the storage bucket
  and set up the necessary policies for the perfume store.
*/

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
    -- IMPORTANT: Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Only admins can update (replace) images
CREATE POLICY "Admin update perfume images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    -- IMPORTANT: Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Only admins can delete images
CREATE POLICY "Admin delete perfume images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    -- IMPORTANT: Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Optional: Allow admins to see the full list in Supabase dashboard
CREATE POLICY "Admin list perfume images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    -- IMPORTANT: Replace 'admin@yourdomain.com' with your actual admin email
    AND (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
  );

-- Make sure RLS is enabled (it should be by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;