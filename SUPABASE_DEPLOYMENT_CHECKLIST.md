# 🗄️ Supabase Deployment Checklist

**Project:** ChowMaharlika - Maharlika Seafood & Mart  
**Date:** 2025-01-10  
**Status:** Ready for Deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Repository Status
- [x] All SQL migration files committed
- [x] Documentation created and up-to-date
- [x] Code pushed to GitHub
- [x] Environment variables documented

### 📁 Required Files (All Present ✅)

#### Core Schema Files
```
scripts/
├── 001_create_tables.sql                    ✅ Products, orders, profiles, cart
├── 002_create_triggers.sql                  ✅ Auto-timestamps
├── 004_add_order_items_table.sql           ✅ Order line items
├── 005_add_admin_roles.sql                 ✅ Admin permissions
├── 006_add_clover_fields.sql               ✅ POS integration
├── 007_add_delivery_orders.sql             ✅ Delivery tracking
├── 008_add_support_system.sql              ✅ Support tickets
├── 009_add_order_management.sql            ✅ Enhanced orders
├── 004_create_saint_athena_interactions.sql ✅ AI chat tracking
├── 010_saint_athena_features.sql           ✅ AI analytics
└── 020_maharlika_rewards_system.sql        ✅ 🌟 REWARDS SYSTEM (CRITICAL)

supabase/migrations/
└── 025_optimize_product_images.sql         ✅ Image optimization
```

#### Helper Scripts
```
scripts/
├── SUPABASE_AUDIT.sql                      ✅ Health check
├── RUN_ALL_MIGRATIONS.sql                  ✅ Master migration script
└── audit_inventory.sql                     ✅ Inventory audit
```

#### Documentation
```
SUPABASE_SETUP_GUIDE.md                     ✅ Step-by-step setup
DEPLOYMENT_STATUS.md                         ✅ Full system status
CREDENTIALS.md (gitignored)                 ✅ API keys & secrets
```

---

## 🚀 Deployment Steps

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **oypcjftjvmfmabdmmhca**
3. Navigate to **SQL Editor**

### Step 2: Run Pre-Deployment Audit (RECOMMENDED)
```sql
-- Copy and paste from: scripts/SUPABASE_AUDIT.sql
-- This will show you what currently exists
```

### Step 3: Run Migrations in Order

**IMPORTANT:** Run these ONE AT A TIME in the SQL Editor

#### Phase 1: Core Tables (10-15 minutes)
```sql
-- 1. Base tables
scripts/001_create_tables.sql

-- 2. Triggers
scripts/002_create_triggers.sql

-- 3. Order items
scripts/004_add_order_items_table.sql
```

#### Phase 2: Integrations (5-10 minutes)
```sql
-- 4. Admin roles
scripts/005_add_admin_roles.sql

-- 5. Clover POS
scripts/006_add_clover_fields.sql

-- 6. Delivery
scripts/007_add_delivery_orders.sql

-- 7. Support
scripts/008_add_support_system.sql

-- 8. Order management
scripts/009_add_order_management.sql
```

#### Phase 3: AI Features (5 minutes)
```sql
-- 9. Saint Athena interactions
scripts/004_create_saint_athena_interactions.sql

-- 10. Saint Athena analytics
scripts/010_saint_athena_features.sql
```

#### Phase 4: Rewards System (10 minutes) 🌟
```sql
-- 11. MAHARLIKA REWARDS - Complete loyalty program
scripts/020_maharlika_rewards_system.sql

-- This creates 7 new tables:
-- - loyalty_tiers
-- - loyalty_members  
-- - loyalty_transactions
-- - rewards_catalog
-- - reward_redemptions
-- - loyalty_promotions
-- - loyalty_referrals
```

#### Phase 5: Image Optimization (2 minutes)
```sql
-- 12. Product image optimization
supabase/migrations/025_optimize_product_images.sql
```

### Step 4: Verification Queries

After running all migrations, verify everything:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables (should see ~20+ tables):
-- ✅ cart_items
-- ✅ delivery_orders
-- ✅ loyalty_members
-- ✅ loyalty_promotions
-- ✅ loyalty_referrals
-- ✅ loyalty_tiers
-- ✅ loyalty_transactions
-- ✅ order_items
-- ✅ orders
-- ✅ products
-- ✅ profiles
-- ✅ reward_redemptions
-- ✅ rewards_catalog
-- ✅ saint_athena_interactions
-- ✅ saint_athena_sessions
-- ✅ support_tickets

-- Check products has image_url column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'image_url';

-- Check rewards system
SELECT tier_name, tier_level, points_threshold 
FROM loyalty_tiers 
ORDER BY tier_level;

-- Should return:
-- Bronze  | 1 | 0
-- Silver  | 2 | 500
-- Gold    | 3 | 1000

-- Check RLS policies enabled
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

---

## 🔐 Security Verification

### Check Row Level Security is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- All tables should have RLS enabled ✅
```

### Verify Policies Exist
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should see policies like:
-- "Anyone can view loyalty tiers"
-- "Anyone can view active rewards"
-- "Members can view own data"
-- etc.
```

---

## 📊 Post-Deployment Testing

### 1. Test Product Queries
```sql
-- Should return products (if already imported)
SELECT id, name, category, price, image_url
FROM products
LIMIT 5;
```

### 2. Test Rewards System
```sql
-- Check rewards catalog
SELECT reward_name, points_required, dollar_value
FROM rewards_catalog
WHERE is_active = true
ORDER BY points_required;

-- Should return 6 default rewards:
-- Free Beverage (50 pts)
-- $5 Off (100 pts)
-- 10% Off (150 pts)
-- $10 Off (200 pts)
-- etc.
```

### 3. Test Views
```sql
-- Check helper views work
SELECT * FROM products_without_images LIMIT 5;
SELECT * FROM loyalty_member_summary LIMIT 5;
```

---

## ⚠️ Troubleshooting

### Issue: "relation already exists"
**Solution:** Table already created. Skip that migration or drop table first.
```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

### Issue: "permission denied"
**Solution:** Check you're using the correct Supabase project and have admin access.

### Issue: "column already exists"
**Solution:** That migration was partially run. Check which columns exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'your_table_name';
```

### Issue: "foreign key violation"
**Solution:** Ensure tables are created in order. Parent tables must exist before child tables.

---

## 🎯 Success Criteria

After deployment, you should have:

- [x] **~20+ tables** in public schema
- [x] **Rewards system** with 7 tables (loyalty_*, rewards_*)
- [x] **RLS policies** enabled on all tables
- [x] **Indexes** created for performance
- [x] **Triggers** for auto-timestamps and tier updates
- [x] **Views** for common queries
- [x] **Default data** (tiers, rewards catalog)

---

## 🔄 Data Import (After Schema Setup)

Once schema is deployed:

### 1. Import Products
```bash
# Use the product import script
node scripts/import-products-from-excel.js
```

### 2. Test the Application
- Browse products at: https://chowmaharlika.com/products
- Check rewards page: https://chowmaharlika.com/rewards
- Try adding items to cart
- Test SaintAthena chat assistant

---

## 📞 Need Help?

### Resources
- **Setup Guide:** `SUPABASE_SETUP_GUIDE.md`
- **Audit Script:** `scripts/SUPABASE_AUDIT.sql`
- **Supabase Docs:** https://supabase.com/docs

### Quick Audit Command
```sql
-- Run this anytime to check database health
-- Copy from: scripts/SUPABASE_AUDIT.sql
```

---

## ✅ Final Checklist

Before marking deployment complete:

- [ ] All 12 migrations run successfully
- [ ] Verification queries return expected results
- [ ] RLS policies are enabled
- [ ] Default rewards data exists
- [ ] Products table has image_url column
- [ ] No SQL errors in Supabase logs
- [ ] Application connects to database successfully
- [ ] Sample queries work in SQL Editor

---

**🎉 Once all checked, your database is PRODUCTION READY!**

**Estimated Total Time:** 30-45 minutes  
**Complexity:** Medium  
**Risk Level:** Low (all migrations are idempotent where possible)

---

**Last Updated:** 2025-01-10  
**Version:** 2.0  
**Prepared for:** ChowMaharlika Production Database
