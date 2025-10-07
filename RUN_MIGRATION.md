# 🚀 Run Supabase Migration - EASY GUIDE

## Step 1: Open Supabase Dashboard

**Get your project URL:**
```bash
# Run this command to get your Supabase project URL
grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2 | xargs -I {} echo "Open: https://supabase.com/dashboard/project/{}" | sed 's|https://||' | sed 's|.supabase.co.*|/sql|' | xargs -I {} echo "https://supabase.com/dashboard/project/{}"
```

Or manually:
1. Go to https://supabase.com/dashboard
2. Click on your ChowMaharlika project
3. Click "SQL Editor" in the left sidebar

## Step 2: Copy the Migration SQL

**The SQL is shown below** - copy EVERYTHING from the line of dashes to the end:

```sql
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
```

## Step 3: Run the Migration

1. In Supabase Dashboard SQL Editor:
   - Click **"New Query"**
   - **Paste** the SQL from above
   - Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

2. You should see: **"Success. No rows returned"**

## Step 4: Verify It Worked

### Check 1: Verify image_url Column
1. Go to **Table Editor** in Supabase
2. Click on **products** table
3. You should see **image_url** column

### Check 2: Verify View Created
1. Go to **Database** → **Views**
2. You should see **products_without_images** view

### Check 3: Verify Indexes
1. In SQL Editor, run:
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'products' 
AND indexname LIKE 'idx_products_%';
```

You should see:
- `idx_products_image_url`
- `idx_products_category`
- `idx_products_category_available`

## ✅ Done!

Your Supabase database is now optimized for the category image system!

## What This Migration Does

✓ **Ensures image_url column exists** - Stores product images  
✓ **Creates 3 indexes** - Makes image queries super fast  
✓ **Creates admin view** - Shows products needing images  
✓ **Sets permissions** - Allows app to read/update images  
✓ **100% safe** - Uses IF NOT EXISTS, won't break existing data  

## Troubleshooting

### "Column already exists"
✅ **This is fine!** The migration uses `IF NOT EXISTS` so it won't create duplicates.

### "Permission denied"
- Make sure you're logged into Supabase dashboard
- You need to be the project owner/admin
- Try refreshing the page and running again

### "Syntax error"
- Make sure you copied ALL the SQL including the DO $$ block
- Copy from the first `--` comment to the last semicolon `;`

## Need Help?

Run the interactive script:
```bash
./scripts/run-image-migration.sh
```

Or check: `PRODUCTION_DEPLOYMENT.md`
