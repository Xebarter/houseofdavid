/*
  SQL SNIPPET TO ADD DEFAULT VALUE TO volume_ml COLUMN IN order_items TABLE
  
  WARNING: This is a workaround and not the recommended solution.
  The proper fix is to ensure the application provides the volume_ml value when inserting order items,
  which has already been implemented in the Checkout.tsx component.
  
  This approach uses a trigger to automatically populate the volume_ml field from the products table
  when it's not explicitly provided during insert.
*/

-- First, add a default value (0) to the column to allow inserts without specifying volume_ml
ALTER TABLE order_items 
ALTER COLUMN volume_ml SET DEFAULT 0;

-- Then create a function to automatically populate volume_ml from the products table
CREATE OR REPLACE FUNCTION populate_order_item_volume_ml()
RETURNS TRIGGER AS $$
BEGIN
  -- If volume_ml is not provided (or is the default 0), fetch it from the products table
  IF NEW.volume_ml IS NULL OR NEW.volume_ml = 0 THEN
    SELECT volume_ml INTO NEW.volume_ml
    FROM products
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function before each insert
CREATE OR REPLACE TRIGGER order_items_volume_ml_trigger
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION populate_order_item_volume_ml();

/*
  To revert these changes and go back to the strict schema:
  
  DROP TRIGGER IF EXISTS order_items_volume_ml_trigger ON order_items;
  DROP FUNCTION IF EXISTS populate_order_item_volume_ml();
  ALTER TABLE order_items ALTER COLUMN volume_ml DROP DEFAULT;
*/