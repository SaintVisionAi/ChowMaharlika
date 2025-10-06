-- ================================================
-- SAINTATHEN FEATURES - Enhanced Product Schema
-- Adds deal tracking, search optimization, and more
-- ================================================

-- Add new columns to products table for SaintAthena features
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS on_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS daily_special BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS search_keywords TEXT[], -- Array of search terms
ADD COLUMN IF NOT EXISTS alternative_names TEXT[], -- Filipino/Asian names
ADD COLUMN IF NOT EXISTS best_deal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bulk_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS bulk_quantity INTEGER,
ADD COLUMN IF NOT EXISTS featured_today BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS freshness_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS origin_country TEXT,
ADD COLUMN IF NOT EXISTS preparation_tips TEXT;

-- Create index for faster search queries
CREATE INDEX IF NOT EXISTS idx_products_search_keywords ON public.products USING GIN (search_keywords);
CREATE INDEX IF NOT EXISTS idx_products_alternative_names ON public.products USING GIN (alternative_names);
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON public.products (on_sale) WHERE on_sale = true;
CREATE INDEX IF NOT EXISTS idx_products_daily_special ON public.products (daily_special) WHERE daily_special = true;
CREATE INDEX IF NOT EXISTS idx_products_best_deal ON public.products (best_deal) WHERE best_deal = true;
CREATE INDEX IF NOT EXISTS idx_products_category_price ON public.products (category, price);

-- Create a view for SaintAthena to easily query best deals
CREATE OR REPLACE VIEW public.saint_athena_deals AS
SELECT 
  p.*,
  CASE 
    WHEN p.on_sale AND p.sale_price IS NOT NULL 
    THEN ROUND(((p.price - p.sale_price) / p.price * 100)::numeric, 2)
    ELSE 0
  END as discount_percentage,
  CASE 
    WHEN p.on_sale AND p.sale_price IS NOT NULL THEN p.sale_price
    ELSE p.price
  END as effective_price
FROM public.products p
WHERE p.is_available = true
ORDER BY discount_percentage DESC, p.price ASC;

-- Grant permissions for the view
GRANT SELECT ON public.saint_athena_deals TO authenticated;
GRANT SELECT ON public.saint_athena_deals TO anon;

-- Create a function to get daily specials
CREATE OR REPLACE FUNCTION public.get_daily_specials()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  category TEXT,
  image_url TEXT,
  discount_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.sale_price,
    p.category,
    p.image_url,
    ROUND(((p.price - COALESCE(p.sale_price, p.price)) / p.price * 100)::numeric, 2) as discount_percentage
  FROM public.products p
  WHERE p.is_available = true 
    AND (p.daily_special = true OR p.featured_today = true)
  ORDER BY discount_percentage DESC, p.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to find product replacements
CREATE OR REPLACE FUNCTION public.find_replacement_products(
  product_category TEXT,
  max_price DECIMAL(10, 2),
  exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  category TEXT,
  stock_quantity INTEGER,
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.sale_price,
    p.category,
    p.stock_quantity,
    CASE 
      WHEN p.category = product_category THEN 100
      WHEN p.price <= max_price THEN 80
      ELSE 50
    END as match_score
  FROM public.products p
  WHERE p.is_available = true 
    AND p.stock_quantity > 0
    AND (exclude_id IS NULL OR p.id != exclude_id)
    AND (p.category = product_category OR p.price <= max_price)
  ORDER BY match_score DESC, p.price ASC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get best deals by category
CREATE OR REPLACE FUNCTION public.get_best_deals_by_category(category_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  category TEXT,
  image_url TEXT,
  discount_percentage NUMERIC,
  stock_quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.sale_price,
    p.category,
    p.image_url,
    ROUND(((p.price - COALESCE(p.sale_price, p.price)) / p.price * 100)::numeric, 2) as discount_percentage,
    p.stock_quantity
  FROM public.products p
  WHERE p.is_available = true 
    AND p.stock_quantity > 0
    AND (p.on_sale = true OR p.best_deal = true)
    AND (category_filter IS NULL OR p.category = category_filter)
  ORDER BY discount_percentage DESC, p.price ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data: Update existing products with SaintAthena features
-- Mark some items as daily specials with sale prices
UPDATE public.products 
SET 
  on_sale = true,
  sale_price = price * 0.85, -- 15% off
  daily_special = true,
  search_keywords = ARRAY['fresh', 'seafood', 'premium'],
  best_deal = true
WHERE category = 'seafood' 
  AND is_available = true
LIMIT 3;

-- Add search keywords and alternative names to help SaintAthena find products
UPDATE public.products
SET 
  search_keywords = ARRAY['shrimp', 'prawn', 'hipon', 'seafood', 'shellfish'],
  alternative_names = ARRAY['hipon', 'sugpo', 'prawn']
WHERE LOWER(name) LIKE '%shrimp%';

UPDATE public.products
SET 
  search_keywords = ARRAY['salmon', 'fish', 'isda', 'seafood', 'pink'],
  alternative_names = ARRAY['salmon', 'isda']
WHERE LOWER(name) LIKE '%salmon%';

UPDATE public.products
SET 
  search_keywords = ARRAY['crab', 'alimasag', 'seafood', 'shellfish'],
  alternative_names = ARRAY['alimasag', 'alimango']
WHERE LOWER(name) LIKE '%crab%';

UPDATE public.products
SET 
  search_keywords = ARRAY['rice', 'kanin', 'grain', 'staple', 'bigas'],
  alternative_names = ARRAY['kanin', 'bigas']
WHERE LOWER(name) LIKE '%rice%';

UPDATE public.products
SET 
  search_keywords = ARRAY['soy sauce', 'toyo', 'seasoning', 'sauce'],
  alternative_names = ARRAY['toyo']
WHERE LOWER(name) LIKE '%soy%sauce%';

-- Add comment for documentation
COMMENT ON COLUMN public.products.on_sale IS 'Flag indicating if product is currently on sale';
COMMENT ON COLUMN public.products.sale_price IS 'Discounted price when on_sale is true';
COMMENT ON COLUMN public.products.daily_special IS 'Featured as todays special by SaintAthena';
COMMENT ON COLUMN public.products.search_keywords IS 'Array of search terms for fuzzy matching';
COMMENT ON COLUMN public.products.alternative_names IS 'Filipino/Asian alternative names for product';
COMMENT ON COLUMN public.products.best_deal IS 'Manually flagged as best deal by admin';
COMMENT ON COLUMN public.products.bulk_price IS 'Price per unit when buying in bulk';
COMMENT ON COLUMN public.products.bulk_quantity IS 'Minimum quantity for bulk pricing';

-- Create audit log for tracking SaintAthena interactions
CREATE TABLE IF NOT EXISTS public.saint_athena_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  interaction_type TEXT NOT NULL, -- 'search', 'list_processing', 'deal_recommendation', 'replacement_suggestion'
  query_text TEXT,
  products_found INTEGER DEFAULT 0,
  deals_suggested INTEGER DEFAULT 0,
  conversion_success BOOLEAN DEFAULT false,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_saint_athena_interactions_user ON public.saint_athena_interactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saint_athena_interactions_type ON public.saint_athena_interactions (interaction_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.saint_athena_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own interactions
CREATE POLICY "Users can view their own SaintAthena interactions" ON public.saint_athena_interactions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policy: System can insert interactions
CREATE POLICY "System can insert SaintAthena interactions" ON public.saint_athena_interactions
  FOR INSERT WITH CHECK (true);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_daily_specials() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_specials() TO anon;
GRANT EXECUTE ON FUNCTION public.find_replacement_products(TEXT, DECIMAL, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_replacement_products(TEXT, DECIMAL, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_best_deals_by_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_best_deals_by_category(TEXT) TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ SaintAthena database features installed successfully!';
  RAISE NOTICE '📊 New columns added: on_sale, sale_price, daily_special, search_keywords, alternative_names';
  RAISE NOTICE '🔍 Search indexes created for optimized queries';
  RAISE NOTICE '💰 Deal tracking views and functions ready';
  RAISE NOTICE '📝 Interaction analytics table created';
END $$;
