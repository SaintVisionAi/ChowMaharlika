# Clover Integration Setup

This project integrates with Clover POS to sync inventory and orders bidirectionally.

## Environment Variables

Add these to your Vercel project settings:

\`\`\`env
CLOVER_MERCHANT_ID=526163795887
CLOVER_API_KEY=201e59e6-682a-6a2d-b481-632de79ad2fe
CLOVER_BASE_URL=https://api.clover.com/v3
\`\`\`

## How It Works

### Inventory Sync (Clover → Website)

1. Admin clicks "Sync Inventory" in the admin dashboard
2. System fetches all items from Clover API
3. Products are created/updated in Supabase database
4. Website displays synced products to customers

### Order Sync (Website → Clover)

1. Customer places order on website
2. Order is saved to Supabase database
3. Order is automatically pushed to Clover POS
4. Clover order ID is stored in database for reference

## API Endpoints

- `POST /api/clover/sync` - Sync inventory from Clover (Admin only)
- `POST /api/clover/orders` - Push order to Clover (Authenticated users)

## Clover API Permissions

Your API token has the following permissions:
- ✅ Customers (Read/Write)
- ✅ Employees (Read/Write)
- ✅ Inventory (Read/Write)
- ✅ Merchant (Read/Write)
- ✅ Orders (Read/Write)
- ✅ Payments (Read/Write)

## Testing

1. Run inventory sync from admin dashboard
2. Verify products appear on website
3. Place a test order
4. Check Clover dashboard to confirm order was created

## Production Checklist

- [ ] Add environment variables to Vercel
- [ ] Test inventory sync
- [ ] Test order creation
- [ ] Set up webhook for real-time inventory updates (optional)
- [ ] Configure automatic sync schedule (optional)
