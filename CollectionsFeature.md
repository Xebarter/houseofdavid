# Collections Feature Documentation

## Overview

The collections feature enhances the perfume store by allowing administrators to curate specific groups of products into collections. Unlike the simple category-based grouping, this feature enables fine-grained control over which products appear in which collections.

## Implementation Details

### Database Structure

The implementation adds a junction table `product_collections` to create a many-to-many relationship between products and collections (categories):

```sql
CREATE TABLE product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);
```

### Enhanced Collections Table

Additional fields were added to the categories table to support enhanced functionality:

- `image_url`: URL for collection banner image
- `featured`: Boolean flag to mark featured collections
- `sort_order`: Integer for custom ordering

### Functions

Two helper functions are provided for easier querying:

1. `get_collection_products(collection_id)`: Returns all products in a collection
2. `get_product_collections(product_id)`: Returns all collections containing a product

## How to Set Up

1. Run the `collections_setup.sql` script in your Supabase SQL editor
2. Replace `'admin@yourdomain.com'` with your actual admin email in the RLS policies
3. Restart your development server to ensure the new database structure is loaded

## How to Use

### Creating Collections

1. Navigate to `/admin/collections`
2. Click "New Collection"
3. Fill in the collection details:
   - Name (required)
   - Slug (required, for URLs)
   - Description
   - Image URL (optional)
   - Featured flag (to show in the main collections view)
   - Sort order (for custom ordering)

### Assigning Products to Collections

1. In the collections management page, click the package icon next to a collection
2. In the modal that appears, you'll see two panels:
   - Left: Products currently in the collection
   - Right: Available products not yet assigned
3. To add a product to the collection, click the "+" button next to it
4. To remove a product from the collection, click the "X" button next to it
5. Close the modal when finished

### Viewing Collections on the Frontend

1. Visit `/collections` to see the collections page
2. Only featured collections appear in the navigation tabs
3. Each collection displays only products explicitly assigned to it
4. Products not assigned to any collection won't appear in any collection view

## Technical Notes

### Supabase Queries

To manually query products in a collection:

```javascript
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    product_collections(category_id)
  `)
  .eq('product_collections.category_id', CATEGORY_ID);
```

To manually assign a product to a collection:

```javascript
const { error } = await supabase
  .from('product_collections')
  .insert([
    {
      product_id: PRODUCT_ID,
      category_id: CATEGORY_ID
    }
  ]);
```

To manually remove a product from a collection:

```javascript
const { error } = await supabase
  .from('product_collections')
  .delete()
  .match({
    product_id: PRODUCT_ID,
    category_id: CATEGORY_ID
  });
```

## Troubleshooting

### Products Not Showing in Collections

Ensure that:
1. The product has been explicitly assigned to the collection via the admin panel
2. The collection is marked as "featured" if you want it to appear in the main navigation
3. The database schema has been properly updated with the `product_collections` table

### Permission Errors

Make sure the RLS policies in `collections_setup.sql` have been updated with your actual admin email address.

## Future Enhancements

Possible improvements to consider:
1. Drag-and-drop interface for assigning products to collections
2. Bulk assignment operations
3. Collection-level metadata (SEO fields, custom banners, etc.)
4. Scheduled publishing for collections