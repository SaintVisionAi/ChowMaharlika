# Clover POS Integration Guide

**Status**: 🟡 Partial Integration (Online → POS working, need webhooks for bidirectional)  
**Last Updated**: October 6, 2025

---

## 🎯 Overview

Your Maharlika Seafood & Mart online store is integrated with Clover POS for real-time inventory and order management. This ensures:

- Online orders automatically appear in Clover POS
- Inventory updates sync between online and in-store
- Product images can be pulled from Clover
- Sales from both channels update stock levels

---

## 🔗 Current Integration Status

### ✅ Working Features

1. **Online → Clover Orders**
   - When customers place orders online, they automatically create orders in Clover POS
   - API: `/api/clover/orders` (POST)
   - Function: `createCloverOrder()` in `lib/clover.ts`

2. **Manual Inventory Sync**
   - Admin can trigger full inventory sync from Clover
   - API: `/api/clover/sync` (POST)
   - Requires admin authentication

3. **Product Data Fetch**
   - Fetch all 2,916 products from Clover
   - API: `fetchCloverInventory()` in `lib/clover.ts`
   - Includes product names, prices, descriptions, stock levels

### 🟡 Partial Features

4. **Product Images**
   - **NEW API**: `/api/clover/sync-images` (POST)
   - Fetches product images from Clover and updates Supabase
   - Run manually by admin to sync images
   - Function: `fetchCloverItemImage()` in `lib/clover.ts`

5. **Inventory Updates**
   - Can update Clover inventory programmatically
   - Function: `updateCloverInventory()` in `lib/clover.ts`
   - Currently manual trigger only

### ⏳ Pending Features

6. **Real-Time Webhooks** (needs Clover App setup)
   - **Endpoint Ready**: `/api/webhooks/clover-inventory`
   - Handles: Product updates, stock changes, order notifications
   - **Action Required**: Configure webhook URL in Clover Dashboard

7. **Bidirectional Sync**
   - In-store sales automatically update online inventory
   - Requires webhook configuration (see below)

---

## 🔧 API Endpoints

### For Admin/Backend

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/clover/sync` | POST | Full inventory sync | ✅ Admin only |
| `/api/clover/sync-images` | POST | Sync product images | ✅ Admin only |
| `/api/clover/orders` | POST | Create order in Clover | ✅ User |
| `/api/webhooks/clover-inventory` | POST | Receive Clover updates | ❌ (Clover webhook) |

### Internal Functions (lib/clover.ts)

```typescript
// Fetch all products
fetchCloverInventory(): Promise<CloverProduct[]>

// Fetch single product with images
fetchCloverItem(itemId: string): Promise<CloverProduct | null>

// Fetch product image URL
fetchCloverItemImage(itemId: string): Promise<string | null>

// Create order in Clover
createCloverOrder(orderData): Promise<{success, orderId}>

// Update Clover stock
updateCloverInventory(itemId, stockCount): Promise<{success}>

// Cancel Clover order
cancelCloverOrder(orderId, reason): Promise<{success}>
```

---

## 📸 Syncing Product Images from Clover

### Step 1: Check Current Image Status

Run this in Supabase SQL Editor:

```sql
SELECT 
  category,
  COUNT(*) AS total_products,
  SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) AS with_images,
  SUM(CASE WHEN image_url IS NULL THEN 1 ELSE 0 END) AS without_images
FROM products
GROUP BY category
ORDER BY total_products DESC;
```

### Step 2: Sync Images from Clover

**Option A: Via API Call (as admin)**

```bash
curl -X POST https://your-site.vercel.app/api/clover/sync-images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Option B: Create Admin Dashboard Button**

Add this to your admin panel:

```tsx
async function syncCloverImages() {
  const response = await fetch('/api/clover/sync-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  
  const result = await response.json()
  console.log(`Synced ${result.stats.updated} images`)
}
```

### Step 3: Verify Images

```sql
-- Check products that now have images
SELECT name, category, image_url
FROM products
WHERE image_url IS NOT NULL
LIMIT 20;
```

---

## 🔄 Setting Up Real-Time Webhooks

### Prerequisites

1. Clover Developer Account
2. App created in Clover App Market
3. OAuth credentials configured

### Configuration Steps

#### 1. In Clover Developer Dashboard

1. Go to: https://www.clover.com/appmarket/apps
2. Select your app or create new app
3. Navigate to **Settings** → **Webhooks**
4. Add webhook URL: `https://your-site.vercel.app/api/webhooks/clover-inventory`

#### 2. Subscribe to Events

Enable these webhook events:

- `ITEM_CREATED` - New products added in POS
- `ITEM_UPDATED` - Product details changed
- `ITEM_DELETED` - Products removed
- `ITEM_STOCK_UPDATED` - Stock levels changed
- `ORDER_CREATED` - New in-store sales
- `ORDER_UPDATED` - Order status changes

#### 3. Test Webhook

Use Clover's webhook testing tool:

```json
{
  "type": "ITEM_STOCK_UPDATED",
  "objectId": "ABC123",
  "merchantId": "526163795887",
  "stockCount": 50
}
```

#### 4. Verify in Logs

Check Vercel logs for:
```
[v0] Received Clover webhook: {...}
[v0] Updating stock for item ABC123 to 50
[v0] Successfully updated stock for item ABC123
```

---

## 🛒 Order Flow (Online → POS)

### Current Implementation

```
Customer Checkout
    ↓
Supabase orders table
    ↓
createCloverOrder() API call
    ↓
Clover POS order created
    ↓
Store clover_order_id in Supabase
    ↓
Order shows in Clover POS dashboard
```

### Code Example

```typescript
// When order is created
const cloverResult = await createCloverOrder({
  total: orderTotal,
  items: orderItems.map(item => ({
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity
  }))
})

if (cloverResult.success) {
  // Store Clover order ID
  await supabase
    .from('orders')
    .update({ clover_order_id: cloverResult.orderId })
    .eq('id', orderId)
}
```

---

## 📊 Inventory Sync Flow (POS → Online)

### With Webhooks (Recommended)

```
In-store sale completed in Clover
    ↓
Clover sends webhook: ORDER_CREATED
    ↓
/api/webhooks/clover-inventory receives event
    ↓
Fetch order details from Clover API
    ↓
Update stock_quantity in Supabase
    ↓
Online store shows updated inventory
```

### Without Webhooks (Manual)

```
Admin logs into dashboard
    ↓
Clicks "Sync Inventory" button
    ↓
/api/clover/sync endpoint called
    ↓
Fetches all products from Clover
    ↓
Updates Supabase products table
    ↓
Customers see current stock levels
```

---

## 🤖 SaintAthena AI Integration

SaintAthena now has access to real-time inventory data:

```typescript
// In AI chat endpoint
const systemPrompt = `
You are SaintAthena, shopping assistant for Maharlika Mart.

**Live Inventory Access:**
- 2,916+ products in database
- Real-time stock levels
- Current pricing and deals
- Product availability status

When customers ask about products:
1. Check if item is in stock
2. Show current price
3. Suggest alternatives if out of stock
4. Highlight any active deals
`
```

### Example AI Responses

**Customer**: "Do you have shrimp?"
**SaintAthena**: "Yes! We have Fresh Gulf Shrimp in stock at $12.99/lb. We also have Frozen Tiger Shrimp (18 in stock) for $15.99/lb. Would you like me to add either to your cart?"

**Customer**: "Is salmon available?"
**SaintAthena**: "I'm checking our inventory... Yes, we have Wild Caught Salmon (12 lbs available) at $18.99/lb. It's on special this week - normally $21.99!"

---

## 📋 Maintenance Tasks

### Daily (Automated via Webhooks)
- ✅ Stock levels update automatically
- ✅ New products appear online
- ✅ Price changes sync instantly

### Weekly (Manual)
- 🔄 Run image sync if new products added
- 📊 Review inventory audit (use `audit_inventory.sql`)
- 🧹 Clean up out-of-stock products

### Monthly (Manual)
- 📈 Analyze sales data across both channels
- 🔍 Audit for discrepancies
- 🗄️ Archive old orders

---

## 🧪 Testing Checklist

### Test Online → POS Flow
- [ ] Place test order online
- [ ] Verify order appears in Clover dashboard
- [ ] Check order details match (items, prices, total)
- [ ] Confirm clover_order_id stored in Supabase

### Test POS → Online Flow (with webhooks)
- [ ] Make sale in Clover POS
- [ ] Check webhook received in logs
- [ ] Verify stock updated in Supabase
- [ ] Confirm product availability on website

### Test Image Sync
- [ ] Add image to product in Clover
- [ ] Run `/api/clover/sync-images`
- [ ] Verify image_url updated in Supabase
- [ ] Check product image displays on site

### Test SaintAthena Inventory Awareness
- [ ] Ask about specific product
- [ ] Verify AI knows stock levels
- [ ] Test out-of-stock handling
- [ ] Check deal recommendations

---

## 🔐 Environment Variables

Required in Vercel and `.env.local`:

```bash
# Clover POS
CLOVER_MERCHANT_ID=526163795887
CLOVER_API_KEY=201e59e6-682a-6a2d-b481-632de79ad2fe
CLOVER_BASE_URL=https://api.clover.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yzoochyyhanxslqwzyga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI
ANTHROPIC_API_KEY=your_anthropic_key
```

---

## 🚨 Troubleshooting

### Images Not Syncing

**Problem**: Products show gradient fallbacks instead of real images

**Solutions**:
1. Check if Clover products have images uploaded
2. Run `/api/clover/sync-images` as admin
3. Verify `image_url` column in Supabase
4. Check API logs for errors

### Stock Levels Incorrect

**Problem**: Online shows different stock than POS

**Solutions**:
1. Verify webhooks are configured
2. Check webhook logs for errors
3. Run manual sync: `/api/clover/sync`
4. Compare Clover API response with Supabase data

### Orders Not Appearing in Clover

**Problem**: Online orders don't create Clover orders

**Solutions**:
1. Check `CLOVER_MERCHANT_ID` and `CLOVER_API_KEY`
2. Review order creation logs
3. Verify Clover API permissions
4. Test with Clover sandbox first

---

## 📚 Resources

- **Clover API Docs**: https://docs.clover.com/docs
- **Clover Dashboard**: https://www.clover.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com/project/yzoochyyhanxslqwzyga
- **Vercel Logs**: https://vercel.com/[your-team]/[your-project]/logs

---

## 🎯 Next Steps

1. **Configure Webhooks** ⏳
   - Set up in Clover Dashboard
   - Test real-time sync

2. **Sync Product Images** 📸
   - Run image sync API
   - Upload missing images to Clover

3. **Test Full Flow** ✅
   - Online order → Clover
   - In-store sale → Online update
   - Verify inventory accuracy

4. **Monitor & Optimize** 📊
   - Set up alerts for sync failures
   - Review daily inventory reports
   - Optimize webhook performance

---

*For support, check WARP.md or contact the development team.*
