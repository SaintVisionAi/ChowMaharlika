# 🌸 SaintAthena Setup Guide

## Overview
SaintAthena is your intelligent shopping assistant that knows ALL 2,300+ items in your Clover inventory. This guide will get her up and running.

---

## 📋 Prerequisites

### 1. Get Supabase Keys from Vercel

Your deployment already has the correct Supabase keys. Get them:

```bash
# Option A: From Vercel Dashboard
1. Go to https://vercel.com/your-project
2. Settings → Environment Variables
3. Copy these values:
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

# Option B: Using Vercel CLI
vercel env pull .env.local
```

### 2. Update `.env.local`

Replace the placeholder values:

```bash
# Before:
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-vercel
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-vercel

# After:
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb... (actual key)
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (actual key)
```

---

## 🗄️ Step 1: Run Database Migration

This adds all SaintAthena features to your database:

### Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project: `bezyjavdabjynvsblpwp`
3. Click "SQL Editor" in sidebar
4. Click "New Query"
5. Copy/paste contents of `scripts/010_saint_athena_features.sql`
6. Click "Run"

### Via Command Line
```bash
# If you have psql and Supabase connection string
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" \
  -f scripts/010_saint_athena_features.sql
```

**Expected Output:**
```
✅ SaintAthena database features installed successfully!
📊 New columns added: on_sale, sale_price, daily_special, search_keywords, alternative_names
🔍 Search indexes created for optimized queries
💰 Deal tracking views and functions ready
📝 Interaction analytics table created
```

---

## 📦 Step 2: Sync ALL Clover Inventory

This pulls all 2,300+ items from Clover into Supabase with SaintAthena features:

```bash
# Run the full sync
npx tsx scripts/sync-clover-full.ts
```

**What it does:**
- ✅ Fetches ALL items from Clover (with pagination)
- ✅ Converts prices from cents to dollars
- ✅ Generates search keywords for each product
- ✅ Adds Filipino alternative names (hipon, isda, etc.)
- ✅ Intelligently categorizes products
- ✅ Skips deleted/hidden/non-revenue items
- ✅ Upserts into Supabase (updates existing, adds new)

**Expected Output:**
```
🚀 SaintAthena - Full Clover Inventory Sync
==================================================
🏪 Merchant ID: 526163795887
🗄️  Supabase URL: https://bezyjavdabjynvsblpwp.supabase.co

🔄 Starting Clover inventory sync...
📦 Fetching items 0 to 1000...
✅ Fetched 1000 items (Total: 1000)
📦 Fetching items 1000 to 2000...
✅ Fetched 1000 items (Total: 2000)
📦 Fetching items 2000 to 3000...
✅ Fetched 300 items (Total: 2300)
🎉 Completed! Fetched 2300 total items from Clover

💾 Starting Supabase sync...
✅ Synced 100 products...
✅ Synced 200 products...
... (continues until all synced)

📊 Sync Complete!
✅ Success: 2150
⏭️  Skipped: 150
❌ Errors: 0
📦 Total processed: 2300

🎉 All done! SaintAthena now knows your entire inventory!
```

---

## ✅ Step 3: Verify the Sync

Check that products are in Supabase:

```bash
# Quick count check
curl -X GET \
  "https://bezyjavdabjynvsblpwp.supabase.co/rest/v1/products?select=count" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return: [{"count": "2150"}] or similar
```

Or check in Supabase Dashboard:
1. Go to Table Editor
2. Select `products` table
3. You should see 2000+ rows!

---

## 🧪 Step 4: Test SaintAthena Libraries

Test the search functionality:

```bash
# Create a test file
cat > test-saintat hena.ts << 'EOF'
import { searchProducts } from './lib/saint-athena-search'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function test() {
  const { data: products } = await supabase.from('products').select('*').limit(100)
  
  if (products) {
    // Test English search
    console.log('\n🔍 Testing search: "shrimp"')
    const results1 = searchProducts(products, 'shrimp')
    console.log(`Found ${results1.length} matches`)
    results1.slice(0, 3).forEach(r => console.log(`  - ${r.product.name} (${r.matchScore}%)`))
    
    // Test Filipino search
    console.log('\n🔍 Testing search: "hipon" (Filipino for shrimp)')
    const results2 = searchProducts(products, 'hipon')
    console.log(`Found ${results2.length} matches`)
    results2.slice(0, 3).forEach(r => console.log(`  - ${r.product.name} (${r.matchScore}%)`))
    
    // Test quantity extraction
    console.log('\n🔍 Testing: "2 lbs salmon"')
    const results3 = searchProducts(products, '2 lbs salmon')
    console.log(`Found ${results3.length} matches`)
    results3.slice(0, 3).forEach(r => console.log(`  - ${r.product.name} (${r.matchScore}%)`))
  }
}

test()
EOF

# Run the test
npx tsx test-saintathena.ts
```

---

## 🚀 Step 5: Deploy (Coming Next)

After sync is complete, we'll:
1. ✅ Create Backend APIs
2. ✅ Build UI Components (Badge, Toast, Panel, Receipt)
3. ✅ Deploy to production

---

## 📊 What You'll Have

### Database Schema
- ✅ 2,300+ products with Clover IDs
- ✅ Search keywords for fuzzy matching
- ✅ Filipino alternative names
- ✅ Deal tracking (on_sale, sale_price, daily_special)
- ✅ Bulk pricing support
- ✅ Analytics tracking

### Smart Features
- 🔍 **Fuzzy Search**: "shrmp" → finds "shrimp"
- 🌏 **Multi-language**: "hipon" → finds shrimp products
- 💰 **Deal Detection**: Automatically finds best prices
- 📦 **Bulk Savings**: Suggests quantity discounts
- 🔄 **Replacement Suggestions**: Out of stock? Get alternatives
- 🧠 **Smart Lists**: "shrimp, salmon, rice" → instant cart

---

## 🆘 Troubleshooting

### Error: "Missing Clover credentials"
**Solution**: Check `.env.local` has:
```bash
CLOVER_MERCHANT_ID=526163795887
CLOVER_API_KEY=201e59e6-682a-6a2d-b481-632de79ad2fe
```

### Error: "Missing Supabase credentials"
**Solution**: Get real keys from Vercel (see Step 1)

### Error: "Clover API error: 401"
**Solution**: Your Clover API key might be expired. Generate new one from Clover dashboard

### Sync is slow
**Normal**: Syncing 2300+ items takes 3-5 minutes. Be patient!

### Some items missing
**Check**: Items might be:
- Marked as `hidden: true` in Clover
- Marked as `deleted: true`
- Have `isRevenue: false`
- Have `price: 0`

These are intentionally skipped.

---

## 📞 Next Steps

Once sync is complete, ping me and I'll:
1. Build the backend APIs
2. Create the UI components
3. Wire everything together
4. Test end-to-end

**Ready to sync? Run:**
```bash
npx tsx scripts/sync-clover-full.ts
```

🌸 Let's make SaintAthena know EVERYTHING! 🌸
