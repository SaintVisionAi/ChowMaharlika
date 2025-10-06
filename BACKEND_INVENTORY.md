# Backend Inventory - ChowMaharlika

**Last Updated**: $(date)
**Backup Branch**: backend-stable-20251005
**GitHub Repo**: git@github.com:SaintVisionAi/ChowMaharlika.git

## ✅ What's Backed Up

### API Routes (Backend Endpoints)
- ✅ `/api/ai/chat` - AI assistant (Claude integration)
- ✅ `/api/clover/sync` - Product sync from Clover POS
- ✅ `/api/clover/orders` - Order creation in Clover
- ✅ `/api/clover/payment` - Payment processing
- ✅ `/api/clover/webhooks` - Clover webhook handler
- ✅ `/api/delivery/webhook` - Delivery platform webhooks
- ✅ `/api/delivery/orders/[id]` - Delivery order management
- ✅ `/api/products/update-images` - Product image updates

### Core Backend Libraries
- ✅ `lib/clover.ts` - Clover API integration
- ✅ `lib/delivery-platforms.ts` - GrubHub/DoorDash/UberEats integration
- ✅ `lib/product-images.ts` - Product image management
- ✅ `lib/supabase/client.ts` - Supabase browser client
- ✅ `lib/supabase/server.ts` - Supabase server client
- ✅ `lib/supabase/middleware.ts` - Auth middleware
- ✅ `lib/cart-context.tsx` - Shopping cart state

### Database Scripts (Supabase/PostgreSQL)
- ✅ `scripts/001_create_tables.sql` - Core tables
- ✅ `scripts/002_create_triggers.sql` - Database triggers
- ✅ `scripts/003_add_sample_products.sql` - Sample data
- ✅ `scripts/004_add_order_items_table.sql` - Order items
- ✅ `scripts/005_add_admin_roles.sql` - Admin permissions
- ✅ `scripts/006_add_clover_fields.sql` - Clover integration fields
- ✅ `scripts/007_add_delivery_orders.sql` - Delivery orders
- ✅ `scripts/008_add_support_system.sql` - Support tickets
- ✅ `scripts/sync-from-clover.ts` - Clover sync script
- ✅ `scripts/update-product-images.ts` - Image update script

### Supabase Edge Functions
- ✅ `supabase/functions/clover-sync/index.ts`
- ✅ `supabase/functions/clover-create-order/index.ts`

### Environment Variables (Credentials)
Located in: `.env.local` (NOT in git - stored locally)
- ✅ Clover API credentials
- ✅ Supabase credentials
- ✅ Anthropic API key
- ✅ Site URL

### Configuration Files
- ✅ `vercel.json` - Vercel deployment config
- ✅ `next.config.mjs` - Next.js config
- ✅ `package.json` - Dependencies
- ✅ `middleware.ts` - Auth middleware

## 🔐 Important Notes

1. **Your backend is SAFE** in this repository
2. **Backup branch created**: `backend-stable-20251005`
3. **GitHub remote**: All code is on GitHub
4. **Vercel deployment**: Backend is deployed as serverless functions
5. **.env.local**: Keep this file safe - it's NOT in git!

## 🚀 To Restore Backend

If you ever need to restore:
```bash
git checkout backend-stable-20251005
```

Or create a new project with the backend:
```bash
git clone git@github.com:SaintVisionAi/ChowMaharlika.git ChowMaharlika-v2
cd ChowMaharlika-v2
git checkout backend-stable-20251005
cp /path/to/.env.local .env.local
pnpm install
pnpm dev
```

## 📦 Backend Architecture

**Full Stack in One Repo:**
```
ChowMaharlika/
├── app/
│   ├── api/          ← Your Backend (Serverless Functions)
│   └── (pages)/      ← Your Frontend
├── lib/              ← Backend libraries
├── scripts/          ← Database scripts
├── supabase/         ← Edge functions
└── .env.local        ← Credentials (local only)
```

**External Services:**
- Supabase (Database + Auth + Storage)
- Clover POS (Inventory + Orders)
- Vercel (Hosting + Serverless functions)
- Anthropic (AI Assistant)

