# 🎁 Maharlika Rewards - Complete Implementation Guide

## Overview

**Maharlika Rewards** is a comprehensive, faith-driven loyalty program that rewards repeat customers while enabling charitable giving and community support. The program features tiered membership, point earning/redemption, and seamless omnichannel integration.

---

## ✅ What's Implemented (Phase 1)

### 1. Database Schema ✓
- **Complete SQL migration**: `scripts/020_maharlika_rewards_system.sql`
- 7 tables with full relationships
- Automated triggers for tier progression
- Points expiration system (12 months)
- Transaction history tracking
- Row-level security (RLS) policies

### 2. Real-Time WebSocket System ✓
- **Live inventory updates** - SaintAthena knows stock changes instantly
- **Deal notifications** - Push alerts for new promotions
- **Cart synchronization** - Real-time cart updates
- **Order tracking** - Live order status updates
- **Connection status** - Shows "Live" badge in SaintAthena

### 3. Foundation Components ✓
- `RealtimeProvider` - WebSocket context for app-wide real-time updates
- SaintAthena integration ready for rewards queries
- Supabase client configured for loyalty tables

---

## 📊 Program Structure

### Tier System

| Tier | Points Threshold | Monthly Discount | Benefits |
|------|------------------|------------------|----------|
| **Bronze** (🥉) | 0-499 | 0% | • 20pt welcome bonus<br>• Birthday reward (20pts)<br>• Early access to specials<br>• Digital coupons |
| **Silver** (⭐) | 500-999 | 5% | All Bronze +<br>• 50pt birthday bonus<br>• 5% off one purchase/month<br>• Double-point events<br>• Preview new products |
| **Gold** (👑) | 1000+ | 10% | All Silver +<br>• 100pt birthday bonus<br>• 10% off one purchase/month<br>• Free delivery<br>• Charitable donations<br>• Concierge service |

### Point Earning
- **Base rate**: 1 point per $1 spent
- **Promotions**: 2x points on special categories/days
- **Referrals**: 25 points for referrer, 20 for referee
- **Birthday**: Tier-based bonus (20/50/100 points)

### Point Redemption
- **100 points = $5 off** your next purchase
- **50 points = Free beverage** (up to $5 value)
- **150 points = 10% off** entire order
- **75 points = Free delivery**
- **100 points = $5 donation** to local food bank

### Points Expiration
- Points expire after **12 months of inactivity**
- Automatic extension on any purchase or redemption
- Email reminders sent before expiration

---

## 🚀 Next Steps: Implementation Roadmap

### **Step 1: Run Database Migration** 🔧

```bash
# Open Supabase SQL Editor at:
# https://supabase.com/dashboard/project/YOUR_PROJECT/sql

# Run the migration file:
scripts/020_maharlika_rewards_system.sql
```

**What this creates:**
- `loyalty_tiers` (Bronze, Silver, Gold configuration)
- `loyalty_members` (customer enrollments)
- `loyalty_transactions` (points history)
- `rewards_catalog` (available rewards)
- `reward_redemptions` (redemption tracking)
- `loyalty_promotions` (campaign management)
- `loyalty_referrals` (referral tracking)

**Verification:**
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'loyalty%' OR table_name LIKE 'reward%';

-- View default tiers
SELECT * FROM loyalty_tiers ORDER BY tier_level;

-- View default rewards
SELECT reward_name, points_required, dollar_value FROM rewards_catalog;
```

---

### **Step 2: Build Rewards API Endpoints** 🔌

Create these API routes to handle loyalty operations:

#### `/app/api/rewards/enroll/route.ts`
```typescript
// Enroll new member with phone number
// Auto-assign Bronze tier
// Generate unique referral code
// Award 20pt welcome bonus
```

#### `/app/api/rewards/balance/route.ts`
```typescript
// Check points balance
// Get current tier info
// Calculate points until next tier
// Return available rewards
```

#### `/app/api/rewards/earn/route.ts`
```typescript
// Award points for purchase
// Apply promotions (2x points)
// Update member stats
// Check tier progression
// Trigger real-time notifications
```

#### `/app/api/rewards/redeem/route.ts`
```typescript
// Redeem reward from catalog
// Deduct points
// Generate redemption code
// Set 30-day expiration
// Create discount for checkout
```

#### `/app/api/rewards/history/route.ts`
```typescript
// Get transaction history
// Filter by type (earn/redeem/bonus)
// Pagination support
// Export to CSV
```

#### `/app/api/rewards/referral/route.ts`
```typescript
// Process referral code
// Award bonus points to both parties
// Track referral completion
```

---

### **Step 3: Create Rewards Dashboard UI** 🎨

Build customer-facing rewards dashboard at `/rewards`:

#### Page: `/app/rewards/page.tsx`

**Components needed:**
1. **Rewards Header Card**
   - Points balance (large, prominent)
   - Current tier badge with icon
   - Progress bar to next tier
   - "Live" connection indicator

2. **Tier Benefits Panel**
   - Current tier perks
   - Next tier preview
   - Points needed to advance

3. **Available Rewards Grid**
   - Filterable rewards catalog
   - "Redeem Now" buttons
   - Tier-locked rewards (grayed out)
   - Countdown for seasonal rewards

4. **Transaction History**
   - Tabbed view (All / Earned / Redeemed)
   - Date, description, points change
   - Running balance
   - Export button

5. **Referral Section**
   - Personal referral code
   - Share buttons (SMS, email, social)
   - Referral count & bonus earned

6. **Active Rewards**
   - Redeemed but unused rewards
   - Redemption codes
   - Expiration dates
   - "Use Now" CTAs

---

### **Step 4: Integrate with Clover POS** 🏪

#### Automatic Point Earning on Purchase

Update `/app/api/clover/orders/route.ts`:

```typescript
// After order creation in Clover:
1. Look up loyalty member by phone or user_id
2. Calculate points (order_total * 1)
3. Check for active promotions (2x points?)
4. Create loyalty_transaction record
5. Update member's current_points_balance
6. Trigger tier progression check
7. Send real-time notification via WebSocket
```

#### Point Redemption at Checkout

Update checkout flow:

```typescript
// Before finalizing order:
1. Check if member has active redemptions
2. Apply discount from reward redemption
3. Mark redemption as 'used'
4. Reduce order total
5. Sync discount to Clover order
```

#### POS Display Integration

Optional: Show loyalty info in Clover:
- Custom tender for reward redemptions
- Line item discount application
- Receipt printing with points earned

---

### **Step 5: SaintAthena Rewards Integration** 🤖

Add loyalty awareness to SaintAthena:

#### Update `/app/api/saint-athena/chat/route.ts`:

**New capabilities:**
```typescript
// Check rewards balance
if (message.includes("points") || message.includes("rewards")) {
  const member = await getMemberByUserId(userId)
  return `You have ${member.current_points_balance} points! 
          That's enough for ${availableRewards}.`
}

// Suggest rewards-eligible items
if (mode === "search") {
  // Highlight items that earn bonus points
  // Show "2x points today!" badges
}

// Notify about tier progression
if (memberJustAdvancedTier) {
  return `🎉 Congratulations! You've reached ${newTier} status!
          You've unlocked: ${newBenefits}`
}

// Birthday rewards
if (todayIsBirthday) {
  return `🎂 Happy Birthday! We've added ${birthdayBonus} bonus points 
          to your account!`
}
```

#### Update SaintAthena UI:

Add rewards info to panel header:
```typescript
{isConnected && member && (
  <div className="flex items-center gap-2 text-xs">
    <span className="font-semibold">{member.current_points_balance} pts</span>
    <Badge variant={tierColor}>{member.tier_name}</Badge>
  </div>
)}
```

---

### **Step 6: Admin Dashboard** 👨‍💼

Create admin panel at `/admin/rewards`:

**Features:**
1. **Member Management**
   - Search members by phone/email
   - View member profiles
   - Manual point adjustments
   - Tier overrides

2. **Analytics Dashboard**
   - Total members by tier
   - Points earned vs redeemed
   - Top redeemers
   - Redemption rate by reward
   - Average order value by tier
   - Monthly enrollment trends

3. **Rewards Management**
   - Create/edit rewards
   - Set tier restrictions
   - Schedule seasonal rewards
   - Track redemption limits

4. **Promotions**
   - Create double-point events
   - Category-specific bonuses
   - Tier-exclusive offers
   - Campaign performance

5. **Bulk Operations**
   - Import members from CSV
   - Bulk point awards
   - Expiration management
   - Email campaigns

---

## 🎯 Quick Launch Checklist

### Pre-Launch (Week 1)
- [ ] Run database migration in Supabase
- [ ] Test tier progression with sample data
- [ ] Build enrollment API endpoint
- [ ] Create basic rewards dashboard
- [ ] Design member enrollment cards
- [ ] Train staff on program benefits

### Launch Week (Week 2)
- [ ] Implement automatic point earning on orders
- [ ] Add redemption at checkout
- [ ] Create in-store signage (QR codes)
- [ ] Announce on social media
- [ ] Send email to existing customers
- [ ] Offer launch bonus (50 pts for first 100 members)

### Post-Launch (Week 3-4)
- [ ] Add SaintAthena rewards queries
- [ ] Build admin analytics dashboard
- [ ] Create referral sharing tools
- [ ] Launch first promotion (2x points weekend)
- [ ] Gather member feedback
- [ ] Analyze redemption patterns

---

## 📱 Enrollment Flow

### In-Store
1. Customer provides phone number at checkout
2. POS/cashier enrolls via admin panel or tablet
3. System generates referral code
4. Member receives 20pt welcome bonus
5. SMS confirmation with sign-up link

### Online
1. Customer visits `/rewards` page
2. Clicks "Join Maharlika Rewards"
3. Enters phone, email, optional birthday
4. Accepts terms & conditions
5. Receives 20pt welcome bonus
6. Redirected to dashboard

### Auto-Enrollment (Recommended)
- If user makes purchase without account
- Prompt: "Join rewards? You'll earn X points from this order!"
- One-click enrollment
- Retroactive points awarded

---

##Human: build all of that and implement it into our code now