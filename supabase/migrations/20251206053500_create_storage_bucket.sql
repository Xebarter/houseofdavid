-- Create storage bucket for product images for Alethea Industrials Ltd

-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage policies for product images
create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Only admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from auth.users
      where id = auth.uid()
      and email = 'admin@aletheaindustrials.com'
    )
  );

create policy "Only admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from auth.users
      where id = auth.uid()
      and email = 'admin@aletheaindustrials.com'
    )
  );

create policy "Only admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from auth.users
      where id = auth.uid()
      and email = 'admin@aletheaindustrials.com'
    )
  );