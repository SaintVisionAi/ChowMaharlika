# Supabase AI Assistant - RLS Policy Response

## Current Definition: loyalty_member_summary View

**View Name**: `loyalty_member_summary`

**Current SQL**:
```sql
CREATE OR REPLACE VIEW loyalty_member_summary AS
SELECT 
  lm.id,
  lm.user_id,
  lm.phone_number,
  lm.email,
  lm.full_name,
  lm.current_points_balance,
  lm.total_points_earned,
  lm.points_redeemed,
  lt.tier_name,
  lt.tier_level,
  lt.tier_color,
  lt.tier_icon,
  lt.discount_percentage,
  lm.total_purchases,
  lm.total_spent,
  lm.enrollment_date,
  lm.last_purchase_date,
  lm.referral_code,
  lm.referral_count
FROM loyalty_members lm
LEFT JOIN loyalty_tiers lt ON lm.current_tier_id = lt.id;
```

---

## Intended Access Patterns

### **1. Members (Authenticated Users)**
**Who**: Any logged-in user  
**Access**: 
- ✅ **READ** their own member data only
- ✅ Can view: points, tier, history, referral code
- ❌ **CANNOT** view other members' data
- ❌ **CANNOT** write/update directly (use APIs)

**Use Case**: 
- View rewards dashboard at `/rewards`
- Check points balance
- See tier progress
- View transaction history

---

### **2. Service Role (Backend APIs)**
**Who**: Server-side API routes  
**Access**:
- ✅ **FULL ACCESS** to all member data
- ✅ Can read any member
- ✅ Can create new members
- ✅ Can update points/tiers
- ✅ Can create transactions

**Use Case**:
- Enroll new members
- Award points after purchases
- Process redemptions
- Update tier status

---

### **3. Admin Users (Future)**
**Who**: Staff with `admin` role  
**Access**:
- ✅ **READ** all member data
- ✅ Can view reports
- ✅ Can manually adjust points
- ✅ Can view all transactions

**Use Case**:
- Customer support
- Point adjustments
- Analytics/reporting

---

### **4. Public (Unauthenticated)**
**Who**: Anonymous visitors  
**Access**:
- ✅ **READ** tier configuration (Bronze/Silver/Gold)
- ✅ **READ** rewards catalog (public rewards)
- ❌ **CANNOT** view member data
- ❌ **CANNOT** view points/transactions

**Use Case**:
- Browse rewards catalog without login
- See tier benefits before enrolling

---

## Recommended RLS Policies

### **For `loyalty_members` table:**

```sql
-- Members can view only their own data
CREATE POLICY "Members can view own data" 
ON loyalty_members 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access" 
ON loyalty_members 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');
```

### **For `loyalty_transactions` table:**

```sql
-- Members can view only their own transactions
CREATE POLICY "Members can view own transactions" 
ON loyalty_transactions 
FOR SELECT 
USING (member_id IN (
  SELECT id FROM loyalty_members WHERE user_id = auth.uid()
));

-- Service role has full access
CREATE POLICY "Service role full access" 
ON loyalty_transactions 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');
```

### **For `rewards_catalog` table:**

```sql
-- Anyone can view active rewards
CREATE POLICY "Anyone can view active rewards" 
ON rewards_catalog 
FOR SELECT 
USING (is_active = TRUE);

-- Service role can manage catalog
CREATE POLICY "Service role full access" 
ON rewards_catalog 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');
```

### **For `loyalty_tiers` table:**

```sql
-- Anyone can view tiers (public info)
CREATE POLICY "Anyone can view tiers" 
ON loyalty_tiers 
FOR SELECT 
USING (TRUE);
```

### **For `reward_redemptions` table:**

```sql
-- Members can view only their own redemptions
CREATE POLICY "Members can view own redemptions" 
ON reward_redemptions 
FOR SELECT 
USING (member_id IN (
  SELECT id FROM loyalty_members WHERE user_id = auth.uid()
));

-- Service role has full access
CREATE POLICY "Service role full access" 
ON reward_redemptions 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');
```

---

## Summary for Supabase AI

**Tell the AI Assistant:**

> "The loyalty program has these access patterns:
> 
> 1. **Authenticated users** should only see their own member data (filtered by `user_id = auth.uid()`)
> 2. **Service role** (backend APIs) needs full access to all tables
> 3. **Public users** can view tiers and active rewards, but not member data
> 4. All policies are already defined in the migration file `scripts/020_maharlika_rewards_system.sql`
> 
> The current RLS policies are:
> - Members: Read own data only
> - Service role: Full access
> - Public: View tiers & rewards catalog only
> 
> No changes needed - the existing policies in the migration are correct."

---

## Quick Answer for AI

If the Supabase AI is asking specifically about `loyalty_member_summary` or `loyalty_member_balances`:

**Copy/Paste This:**

```
The view should be accessible as follows:

1. Authenticated users (auth.uid() IS NOT NULL): 
   - Can SELECT only rows where user_id = auth.uid()

2. Service role (backend APIs):
   - Full SELECT access to all rows

3. Public (anonymous):
   - No access

The RLS policy is already defined in the migration as:
CREATE POLICY "Members can view own data" ON loyalty_members 
FOR SELECT USING (auth.uid() = user_id);

This automatically applies to the view since it references loyalty_members.
```

---

## If Migration Already Ran

If you've already run the migration and the AI is asking for clarification:

1. **Say "SKIP"** - Policies are already created
2. **Or confirm**: "Yes, use the existing policies"
3. **Don't modify** - The migration file has all correct policies

---

## If You Haven't Run Migration Yet

Just run the full SQL migration file - it includes all RLS policies!

**File**: `scripts/020_maharlika_rewards_system.sql`  
**Contains**: All tables + All RLS policies + All security  

No need to answer the AI - just run the complete migration!
