# Clover Integration Guide

## Overview

Your Maharlika Seafood Mart website is now fully integrated with your Clover POS system. This integration keeps your online store and physical store in perfect sync.

## How It Works

### Inventory Sync (Clover → Website)

1. Admin logs into the website admin dashboard
2. Navigate to **Admin → Clover POS**
3. Click **"Sync Inventory Now"**
4. System fetches all products from your Clover POS
5. Products are created or updated in your online store
6. Prices, stock levels, and descriptions are synced

### Order Sync (Website → Clover)

1. Customer places an order on your website
2. Order is saved to your database
3. Order is automatically pushed to your Clover POS
4. Order appears in your Clover dashboard
5. You can fulfill the order from your POS system

## Environment Variables

These are already set in your Vercel project:

\`\`\`
CLOVER_MERCHANT_ID=526163795887
CLOVER_API_KEY=201e59e6-682a-6a2d-b481-632de79ad2fe
CLOVER_BASE_URL=https://api.clover.com
\`\`\`

## API Endpoints

- `POST /api/clover/sync` - Sync inventory from Clover (Admin only)
- `POST /api/clover/orders` - Push order to Clover (Automatic on checkout)

## Testing the Integration

### Test Inventory Sync

1. Add a new product in your Clover POS
2. Go to your website admin → Clover POS
3. Click "Sync Inventory Now"
4. Check that the new product appears on your website

### Test Order Sync

1. Place a test order on your website
2. Check your Clover dashboard
3. Verify the order appears with correct items and totals

## Troubleshooting

### Sync Not Working

- Check that environment variables are set in Vercel
- Verify your Clover API token has the correct permissions
- Check the browser console for error messages

### Orders Not Appearing in Clover

- Verify the order was placed successfully on the website
- Check the order details in your database for `clover_order_id`
- Review the Clover API logs in your Clover dashboard

## Clover API Permissions

Your API token has these permissions (all required):
- **Customers**: Read & Write
- **Employees**: Read & Write
- **Inventory**: Read & Write
- **Merchant**: Read & Write
- **Orders**: Read & Write
- **Payments**: Read & Write

## Support

If you encounter issues:
1. Check the browser console for `[v0]` debug logs
2. Review your Clover dashboard for API errors
3. Contact Clover support if API issues persist
