-- ============================================
-- INVENTORY AUDIT QUERIES
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Total product count by category
SELECT 
  category, 
  COUNT(*) AS product_count,
  SUM(CASE WHEN is_available THEN 1 ELSE 0 END) AS available_count,
  SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) AS with_images
FROM public.products 
GROUP BY category 
ORDER BY product_count DESC NULLS LAST;

-- 2. Products without images
SELECT 
  category,
  COUNT(*) AS missing_images
FROM public.products
WHERE image_url IS NULL
GROUP BY category
ORDER BY missing_images DESC;

-- 3. Out of stock products
SELECT 
  category,
  COUNT(*) AS out_of_stock
FROM public.products
WHERE stock_quantity = 0 OR NOT is_available
GROUP BY category
ORDER BY out_of_stock DESC;

-- 4. Products with Clover ID (synced with POS)
SELECT 
  COUNT(*) AS total_products,
  SUM(CASE WHEN clover_id IS NOT NULL THEN 1 ELSE 0 END) AS with_clover_id,
  SUM(CASE WHEN clover_id IS NULL THEN 1 ELSE 0 END) AS without_clover_id
FROM public.products;

-- 5. Price range by category
SELECT 
  category,
  COUNT(*) AS products,
  MIN(price) AS min_price,
  MAX(price) AS max_price,
  ROUND(AVG(price)::numeric, 2) AS avg_price
FROM public.products
WHERE price > 0
GROUP BY category
ORDER BY avg_price DESC;

-- 6. Recently updated products (last 24 hours)
SELECT 
  name,
  category,
  price,
  stock_quantity,
  is_available,
  updated_at
FROM public.products
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC
LIMIT 20;

-- 7. Top 20 most expensive products
SELECT 
  name,
  category,
  price,
  stock_quantity,
  CASE WHEN image_url IS NOT NULL THEN '✓' ELSE '✗' END AS has_image
FROM public.products
WHERE price > 0
ORDER BY price DESC
LIMIT 20;

-- 8. Products that need attention (no price or no stock)
SELECT 
  name,
  category,
  price,
  stock_quantity,
  is_available,
  clover_id
FROM public.products
WHERE price = 0 OR stock_quantity = 0 OR NOT is_available
ORDER BY category, name
LIMIT 50;

-- 9. Complete inventory summary
SELECT 
  'Total Products' AS metric,
  COUNT(*)::text AS value
FROM public.products
UNION ALL
SELECT 
  'Available Products',
  COUNT(*)::text
FROM public.products
WHERE is_available = true
UNION ALL
SELECT 
  'Products with Images',
  COUNT(*)::text
FROM public.products
WHERE image_url IS NOT NULL
UNION ALL
SELECT 
  'Products with Clover ID',
  COUNT(*)::text
FROM public.products
WHERE clover_id IS NOT NULL
UNION ALL
SELECT 
  'Average Price',
  '$' || ROUND(AVG(price)::numeric, 2)::text
FROM public.products
WHERE price > 0
UNION ALL
SELECT 
  'Total Inventory Value',
  '$' || ROUND(SUM(price * stock_quantity)::numeric, 2)::text
FROM public.products;

-- 10. Products by first letter (for alphabet browsing)
SELECT 
  LEFT(name, 1) AS first_letter,
  COUNT(*) AS product_count
FROM public.products
GROUP BY LEFT(name, 1)
ORDER BY first_letter;
