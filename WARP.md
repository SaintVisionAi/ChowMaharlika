# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Setup and Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Testing and Validation
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Validate API endpoints
curl -X POST http://localhost:3000/api/clover/sync

# Test database migrations
psql -f scripts/001_create_tables.sql
```

### Database Operations
```bash
# Run database migrations in order
psql -f scripts/001_create_tables.sql
psql -f scripts/002_create_triggers.sql
psql -f scripts/003_add_sample_products.sql
# Continue with remaining migration scripts...
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Styling**: Tailwind CSS with custom water-texture theme
- **UI Components**: Radix UI with shadcn/ui
- **State Management**: React Context (CartProvider)
- **POS Integration**: Clover API
- **Authentication**: Supabase Auth

### Key Architectural Patterns

#### Database Integration Layer
The application uses a multi-tier data synchronization approach:
- **Supabase Database**: Primary data store with RLS policies
- **Clover POS Integration**: Bidirectional sync for inventory and orders
- **Guest Cart Support**: localStorage fallback for unauthenticated users

#### Component Architecture
```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx           # Landing page
└── api/               # API routes
    ├── clover/        # Clover POS integration
    │   ├── sync/      # Inventory synchronization
    │   └── orders/    # Order creation
    └── delivery/      # Delivery platform webhooks

components/
├── ui/                # Reusable UI components (shadcn/ui)
├── ai-assistant.tsx   # SaintChow AI chat interface
├── hero-section.tsx   # Main landing section
└── support-ticket-form.tsx # Customer support interface

lib/
├── clover.ts          # Clover API integration
├── cart-context.tsx   # Shopping cart state management
├── delivery-platforms.ts # Delivery service integrations
└── supabase/          # Database client configuration
```

#### Authentication & Authorization Flow
- Supabase handles authentication with email/password
- Profile creation triggers on first login
- Admin role required for inventory sync operations
- RLS policies enforce data isolation per user

### Critical Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Clover POS Integration
CLOVER_MERCHANT_ID=526163795887
CLOVER_API_KEY=201e59e6-682a-6a2d-b481-632de79ad2fe
CLOVER_BASE_URL=https://api.clover.com
```

### Data Flow Architecture

#### Inventory Synchronization
1. Admin triggers sync via `/api/clover/sync`
2. System fetches products from Clover API
3. Products are upserted in Supabase `products` table
4. Frontend displays synchronized inventory

#### Order Processing
1. Customer adds items to cart (CartProvider)
2. Order submitted through checkout flow
3. Order saved to Supabase `orders` table
4. Order automatically pushed to Clover POS
5. Clover order ID stored for reference

#### Cart Management
- Authenticated users: Persistent cart in Supabase
- Guest users: localStorage with session migration on login
- Real-time updates via React Context

## Important Project-Specific Guidelines

### Clover Integration Requirements
- All monetary values must be converted between dollars (frontend) and cents (Clover API)
- Inventory sync requires admin role verification
- Order creation includes line items as separate API calls
- Debug logs prefixed with `[v0]` for identification

### Database Schema Considerations
- All tables use UUID primary keys with `gen_random_uuid()`
- RLS policies are essential - never bypass with service role in client code
- Foreign key relationships maintain data integrity
- `clover_id` fields link local products to POS system

### UI/UX Patterns
- Water-texture background theme throughout application
- AI Assistant (SaintChow) uses floating chat interface
- Toast notifications for user feedback
- Responsive design with mobile-first approach
- Loading states for all async operations

### Error Handling Strategy
- Supabase errors logged and user-friendly messages shown
- Clover API failures gracefully handled with retry logic
- Form validation using react-hook-form with zod schemas
- Network errors display appropriate fallback content

### Performance Considerations
- Next.js 14 App Router with server components where possible
- Image optimization disabled (`unoptimized: true`) for deployment flexibility
- Standalone output mode for container deployments
- ESLint and TypeScript errors ignored during builds (development speed priority)

### Testing Guidelines
- Test Clover sync with sandbox environment first
- Verify RLS policies prevent unauthorized data access
- Check cart persistence across authentication states
- Validate order flow end-to-end with Clover dashboard

### Delivery Platform Integration
Framework exists for GrubHub, DoorDash, and Uber Eats integration but currently uses placeholder implementations. When implementing:
- Add real API credentials to environment variables
- Implement webhook handlers for order status updates
- Update delivery order status synchronization
- Test with each platform's sandbox environment