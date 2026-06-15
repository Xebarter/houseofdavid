/*
  CORRECT & SECURE STORAGE SETUP FOR YOUR LUXURY PERFUME STORE
  Bucket: perfume-images
  Public read — Admin-only write
  Run this once in Supabase SQL Editor (with service_role key recommended)
*/

-- 1. Create the public bucket (if not already done)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'perfume-images',
  'perfume-images',
  true,                              -- public = true → files readable without auth
  10 * 1024 * 1024,                  -- 10 MB max per file (adjust as needed)
  '{image/jpeg,image/png,image/webp}' -- only images allowed
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS (this is already true by default, but just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop any old/conflicting policies on this bucket (safe to run multiple times)
DROP POLICY IF EXISTS "Public read perfume images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload perfume images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update perfume images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete perfume images" ON storage.objects;

-- 4. NEW CLEAN POLICIES

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
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'  -- recommended way
    -- Alternative if you use user email instead:
    -- AND (auth.jwt() ->> 'email') = 'you@yourperfumestore.com'
  );

-- Only admins can update (replace) images
CREATE POLICY "Admin update perfume images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Only admins can delete images
CREATE POLICY "Admin delete perfume images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Optional: Allow admins to see the full list in Supabase dashboard
CREATE POLICY "Admin list perfume images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'perfume-images'
    AND auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );