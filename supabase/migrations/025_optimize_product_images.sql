-- Migration: Optimize Product Images
-- Description: Ensure image_url column exists with proper defaults and indexes
-- Date: 2025-01-07

-- Ensure image_url column exists on products table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        COMMENT ON COLUMN products.image_url IS 'URL to product image (Unsplash, Clover, or custom)';
    END IF;
END $$;

-- Add index for faster image queries
CREATE INDEX IF NOT EXISTS idx_products_image_url 
ON products(image_url) 
WHERE image_url IS NOT NULL;

-- Add index for category-based queries (used for category image fallbacks)
CREATE INDEX IF NOT EXISTS idx_products_category 
ON products(category);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_available 
ON products(category, is_available);

-- Update statistics for query planner
ANALYZE products;

-- Grant necessary permissions
GRANT SELECT ON products TO anon, authenticated;
GRANT UPDATE (image_url) ON products TO authenticated;

-- Add helpful view for products without images (for admin dashboard)
CREATE OR REPLACE VIEW products_without_images AS
SELECT 
    id,
    name,
    category,
    price,
    stock_quantity,
    is_available,
    created_at
FROM products
WHERE image_url IS NULL OR image_url LIKE '%placeholder%'
ORDER BY category, name;

GRANT SELECT ON products_without_images TO authenticated;

COMMENT ON VIEW products_without_images IS 'Products that need image generation';
