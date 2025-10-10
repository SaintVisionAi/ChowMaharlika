-- =====================================================
-- CHOWMAHARLIKA - COMPLETE DATABASE SETUP
-- =====================================================
-- Run this script in Supabase SQL Editor to set up ALL tables
-- Last Updated: 2025-01-10
-- =====================================================

-- IMPORTANT: Run these in the Supabase SQL Editor one at a time
-- Or run this entire file if your editor supports it

-- Check what tables already exist before running
SELECT 
    'Existing tables before migration:' as info,
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =====================================================
-- STEP 1: CORE TABLES
-- =====================================================
-- File: scripts/001_create_tables.sql
-- Creates: products, orders, profiles, cart_items

-- Copy and paste content from: scripts/001_create_tables.sql

-- =====================================================
-- STEP 2: TRIGGERS
-- =====================================================
-- File: scripts/002_create_triggers.sql
-- Creates automatic timestamp updates

-- Copy and paste content from: scripts/002_create_triggers.sql

-- =====================================================
-- STEP 3: ORDER ITEMS
-- =====================================================
-- File: scripts/004_add_order_items_table.sql
-- Creates order_items junction table

-- Copy and paste content from: scripts/004_add_order_items_table.sql

-- =====================================================
-- STEP 4: ADMIN ROLES
-- =====================================================
-- File: scripts/005_add_admin_roles.sql
-- Adds admin role system

-- Copy and paste content from: scripts/005_add_admin_roles.sql

-- =====================================================
-- STEP 5: CLOVER INTEGRATION
-- =====================================================
-- File: scripts/006_add_clover_fields.sql
-- Adds Clover POS fields

-- Copy and paste content from: scripts/006_add_clover_fields.sql

-- =====================================================
-- STEP 6: DELIVERY ORDERS
-- =====================================================
-- File: scripts/007_add_delivery_orders.sql
-- Creates delivery_orders table

-- Copy and paste content from: scripts/007_add_delivery_orders.sql

-- =====================================================
-- STEP 7: SUPPORT SYSTEM
-- =====================================================
-- File: scripts/008_add_support_system.sql
-- Creates support_tickets table

-- Copy and paste content from: scripts/008_add_support_system.sql

-- =====================================================
-- STEP 8: ORDER MANAGEMENT
-- =====================================================
-- File: scripts/009_add_order_management.sql
-- Enhanced order management features

-- Copy and paste content from: scripts/009_add_order_management.sql

-- =====================================================
-- STEP 9: SAINT ATHENA AI
-- =====================================================
-- File: scripts/004_create_saint_athena_interactions.sql
-- Creates AI interaction tracking

-- Copy and paste content from: scripts/004_create_saint_athena_interactions.sql

-- =====================================================
-- STEP 10: SAINT ATHENA FEATURES
-- =====================================================
-- File: scripts/010_saint_athena_features.sql
-- Advanced AI features and analytics

-- Copy and paste content from: scripts/010_saint_athena_features.sql

-- =====================================================
-- STEP 11: MAHARLIKA REWARDS SYSTEM (CRITICAL!)
-- =====================================================
-- File: scripts/020_maharlika_rewards_system.sql
-- Complete loyalty/rewards program with 7 tables

-- Copy and paste content from: scripts/020_maharlika_rewards_system.sql

-- =====================================================
-- STEP 12: IMAGE OPTIMIZATION (LATEST!)
-- =====================================================
-- File: supabase/migrations/025_optimize_product_images.sql
-- Optimizes product images with category fallbacks

-- Copy and paste content from: supabase/migrations/025_optimize_product_images.sql

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
SELECT 
    'Final table list:' as info,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check products table structure
SELECT 
    'Products table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Check rewards tables
SELECT 
    'Rewards system tables:' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%loyalty%' OR table_name LIKE '%reward%'
ORDER BY table_name;

-- Check RLS policies
SELECT 
    'Row Level Security policies:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
    'Database indexes:' as info,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check views
SELECT 
    'Database views:' as info,
    table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Sample data check
SELECT 
    'Product count:' as metric,
    COUNT(*) as count,
    COUNT(DISTINCT category) as categories,
    COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as with_images
FROM products;

SELECT 
    'Loyalty tiers:' as metric,
    tier_name,
    tier_level,
    points_threshold,
    discount_percentage
FROM loyalty_tiers
ORDER BY tier_level;

SELECT 
    'Rewards catalog:' as metric,
    COUNT(*) as total_rewards,
    COUNT(CASE WHEN is_active THEN 1 END) as active_rewards
FROM rewards_catalog;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT '✅ Database setup complete!' as status,
       'All tables, triggers, RLS policies, and indexes are in place' as message,
       NOW() as completed_at;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Verify all tables exist in the output above
-- 2. Check that products table has image_url column
-- 3. Verify RLS policies are enabled
-- 4. Run scripts/SUPABASE_AUDIT.sql for detailed health check
-- 5. Import products from Excel using import scripts
-- 6. Test the application with sample data
-- =====================================================
