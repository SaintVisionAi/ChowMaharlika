-- ============================================
-- SUPABASE DATABASE AUDIT SCRIPT
-- ChowMaharlika - Maharlika Seafood & Mart
-- ============================================
-- Run this in your Supabase SQL Editor to check what's missing
-- ============================================

-- 1. CHECK ALL TABLES
SELECT 
    'TABLES' as check_type,
    table_name,
    CASE 
        WHEN table_name IN ('products', 'orders', 'order_items', 'profiles', 'cart_items', 
                           'saint_athena_interactions', 'support_tickets', 'delivery_orders',
                           'rewards_points', 'rewards_transactions', 'rewards_tiers') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CHECK PRODUCTS TABLE COLUMNS
SELECT 
    'PRODUCTS_COLUMNS' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. CHECK IF IMAGE_URL COLUMN EXISTS
SELECT 
    'IMAGE_URL_CHECK' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'image_url'
        )
        THEN '✅ image_url column exists'
        ELSE '❌ MISSING - Need to run migration 025'
    END as status;

-- 4. CHECK INDEXES
SELECT 
    'INDEXES' as check_type,
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('products', 'orders', 'cart_items')
ORDER BY tablename, indexname;

-- 5. CHECK RLS POLICIES
SELECT 
    'RLS_POLICIES' as check_type,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. CHECK VIEWS
SELECT 
    'VIEWS' as check_type,
    table_name as view_name,
    CASE 
        WHEN table_name = 'products_without_images' 
        THEN '✅ EXISTS'
        ELSE '⚠️  UNKNOWN VIEW'
    END as status
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 7. CHECK TRIGGERS
SELECT 
    'TRIGGERS' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8. COUNT RECORDS
SELECT 'RECORD_COUNTS' as check_type, 'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'RECORD_COUNTS', 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'RECORD_COUNTS', 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'RECORD_COUNTS', 'cart_items', COUNT(*) FROM cart_items;

-- 9. CHECK FOR PRODUCTS WITHOUT IMAGES
SELECT 
    'PRODUCTS_NO_IMAGE' as check_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM products), 0), 2) as percentage
FROM products
WHERE image_url IS NULL OR image_url LIKE '%placeholder%';

-- 10. SAMPLE PRODUCTS WITH CATEGORIES
SELECT 
    'SAMPLE_PRODUCTS' as check_type,
    id,
    name,
    category,
    price,
    CASE 
        WHEN image_url IS NOT NULL AND image_url NOT LIKE '%placeholder%' THEN '✅ Has Image'
        ELSE '❌ No Image'
    END as image_status
FROM products
ORDER BY category, name
LIMIT 10;

-- ============================================
-- SUMMARY CHECKLIST
-- ============================================
SELECT '
========================================
📋 SUPABASE SETUP CHECKLIST
========================================

✅ = Already done
❌ = Needs to be run
⚠️  = Check manually

CORE TABLES:
□ Run scripts/001_create_tables.sql
□ Run scripts/002_create_triggers.sql
□ Run scripts/003_add_sample_products.sql (optional - test data)

ORDER SYSTEM:
□ Run scripts/004_add_order_items_table.sql
□ Run scripts/009_add_order_management.sql

AI ASSISTANT:
□ Run scripts/004_create_saint_athena_interactions.sql
□ Run scripts/010_saint_athena_features.sql

ADMIN & ROLES:
□ Run scripts/005_add_admin_roles.sql

CLOVER POS:
□ Run scripts/006_add_clover_fields.sql

DELIVERY:
□ Run scripts/007_add_delivery_orders.sql

SUPPORT:
□ Run scripts/008_add_support_system.sql

REWARDS SYSTEM:
□ Run scripts/020_maharlika_rewards_system.sql

IMAGE OPTIMIZATION (NEW):
□ Run supabase/migrations/025_optimize_product_images.sql

========================================
' as checklist;
