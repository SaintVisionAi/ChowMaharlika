# 🛢️ Supabase Database Setup Guide
## ChowMaharlika - Maharlika Seafood & Mart

---

## 📋 Quick Audit

**Run this FIRST to see what you have:**

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Copy and paste: `scripts/SUPABASE_AUDIT.sql`
4. Click **Run**
5. Review the results to see what's missing

---

## 🚀 Initial Setup (Run in Order)

### Step 1: Core Tables & Structure
```sql
-- 1. Create all base tables (products, orders, profiles, etc.)
scripts/001_create_tables.sql

-- 2. Set up triggers for timestamps and auto-updates
scripts/002_create_triggers.sql

-- 3. (Optional) Add sample products for testing
scripts/003_add_sample_products.sql
```

### Step 2: Order Management
```sql
-- 4. Add order_items table
scripts/004_add_order_items_table.sql

-- 5. Add advanced order management features
scripts/009_add_order_management.sql
```

### Step 3: AI Assistant (SaintAthena)
```sql
-- 6. Create interactions tracking table
scripts/004_create_saint_athena_interactions.sql

-- 7. Add AI features and analytics
scripts/010_saint_athena_features.sql
```

### Step 4: Admin & Integrations
```sql
-- 8. Add admin roles and permissions
scripts/005_add_admin_roles.sql

-- 9. Add Clover POS integration fields
scripts/006_add_clover_fields.sql

-- 10. Add delivery platform integration
scripts/007_add_delivery_orders.sql

-- 11. Add customer support system
scripts/008_add_support_system.sql
```

### Step 5: Rewards System
```sql
-- 12. Add comprehensive rewards program
scripts/020_maharlika_rewards_system.sql
```

### Step 6: Image Optimization (NEW - IMPORTANT!)
```sql
-- 13. Optimize product images with category fallbacks
supabase/migrations/025_optimize_product_images.sql
```

---

## ✅ Verification Checklist

After running migrations, verify everything works:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- ✅ cart_items
- ✅ delivery_orders
- ✅ order_items
- ✅ orders
- ✅ products
- ✅ profiles
- ✅ rewards_points
- ✅ rewards_tiers
- ✅ rewards_transactions
- ✅ saint_athena_interactions
- ✅ support_tickets

### 2. Check Products Table Has image_url
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'image_url';
```

Should return: `image_url | text`

### 3. Check View Exists
```sql
SELECT * FROM products_without_images LIMIT 5;
```

### 4. Test Category Images
```sql
SELECT 
    category,
    COUNT(*) as product_count,
    COUNT(image_url) as has_image,
    COUNT(*) - COUNT(image_url) as needs_image
FROM products
GROUP BY category
ORDER BY product_count DESC;
```

---

## 🔄 Ongoing Maintenance

### Weekly Tasks
- Run `scripts/audit_inventory.sql` to check stock levels
- Review `products_without_images` view for missing images

### Monthly Tasks
- Check rewards points accuracy
- Audit order management system
- Review SaintAthena interaction logs

### As Needed
- Update Clover sync: Check `clover_id` and `clover_updated_at` fields
- Monitor delivery integrations
- Review support tickets

---

## 🆘 Troubleshooting

### Issue: "image_url column doesn't exist"
**Solution:** Run `supabase/migrations/025_optimize_product_images.sql`

### Issue: "permission denied for table products"
**Solution:** Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'products';
```

### Issue: "Products show placeholder images"
**Solution:** 
1. Check if `image_url` is NULL
2. Verify category images load from Unsplash
3. Check `lib/category-images.ts` has correct URLs

### Issue: "Cart items not persisting"
**Solution:** 
1. Check user is authenticated
2. Verify RLS policies on `cart_items` table
3. Check `user_id` matches authenticated user

---

## 📊 Database Schema Overview

### Core Tables

**products**
- Primary inventory table
- Syncs with Clover POS
- Uses category images as fallback
- Indexed for fast queries

**orders** + **order_items**
- Complete order management
- Links to Clover orders
- Tracks delivery status

**profiles**
- User accounts
- Linked to Supabase Auth
- Tracks rewards tier

**cart_items**
- Persistent shopping cart
- Per-user via RLS

### Feature Tables

**saint_athena_interactions**
- AI chat history
- Product recommendations
- Interaction analytics

**rewards_points** + **rewards_transactions**
- Points tracking
- Transaction history
- Tier progression

**support_tickets**
- Customer support system
- Status tracking

**delivery_orders**
- Third-party delivery integration
- Status synchronization

---

## 🔐 Security & RLS

All tables use **Row Level Security (RLS)**:

- **Anonymous users:** Can read products only
- **Authenticated users:** Can manage their own cart, orders, support tickets
- **Admin users:** Full access to all tables

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

---

## 🎯 Performance Tips

1. **Indexes are in place** for:
   - Product category lookups
   - Image URL queries
   - Order status filtering

2. **Use the view** `products_without_images` instead of querying directly

3. **Category images** load instantly (no DB lookup needed)

4. **Analyze** runs automatically after migrations

---

## 📞 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Check logs:** Supabase Dashboard → Logs
- **Run audit:** `scripts/SUPABASE_AUDIT.sql`

---

**Last Updated:** 2025-01-07
**Version:** 1.0
**System:** ChowMaharlika Production Database
