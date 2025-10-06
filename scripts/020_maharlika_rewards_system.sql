-- =====================================================
-- MAHARLIKA REWARDS LOYALTY PROGRAM
-- =====================================================
-- A comprehensive loyalty program with tiered membership,
-- point earning/redemption, and community giving options
-- 
-- Program Structure:
-- - Bronze: 0-499 points
-- - Silver: 500-999 points  
-- - Gold: 1000+ points
--
-- Earning: 1 point per $1 spent (2x on promotions)
-- Redemption: 100 points = $5 off
-- =====================================================

-- =====================================================
-- 1. LOYALTY TIERS CONFIGURATION
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE, -- Bronze, Silver, Gold
  tier_level INTEGER NOT NULL UNIQUE, -- 1, 2, 3
  points_threshold INTEGER NOT NULL, -- Minimum points to reach tier
  discount_percentage DECIMAL(5,2) DEFAULT 0, -- Monthly discount (5%, 10%)
  free_delivery BOOLEAN DEFAULT FALSE,
  double_point_events BOOLEAN DEFAULT FALSE,
  charitable_donations BOOLEAN DEFAULT FALSE,
  concierge_service BOOLEAN DEFAULT FALSE,
  early_access BOOLEAN DEFAULT FALSE,
  birthday_reward_points INTEGER DEFAULT 0,
  welcome_bonus_points INTEGER DEFAULT 0,
  tier_color TEXT, -- For UI styling
  tier_icon TEXT, -- Icon name
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO loyalty_tiers (tier_name, tier_level, points_threshold, discount_percentage, free_delivery, double_point_events, charitable_donations, concierge_service, early_access, birthday_reward_points, welcome_bonus_points, tier_color, tier_icon) VALUES
('Bronze', 1, 0, 0, FALSE, FALSE, FALSE, FALSE, TRUE, 20, 20, '#CD7F32', 'award'),
('Silver', 2, 500, 5, FALSE, TRUE, FALSE, FALSE, TRUE, 50, 0, '#C0C0C0', 'star'),
('Gold', 3, 1000, 10, TRUE, TRUE, TRUE, TRUE, TRUE, 100, 0, '#FFD700', 'crown')
ON CONFLICT (tier_name) DO NOTHING;

-- =====================================================
-- 2. LOYALTY MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE, -- Primary identifier for guest checkout
  email TEXT,
  full_name TEXT,
  
  -- Points & Tier
  total_points_earned INTEGER DEFAULT 0, -- Lifetime points earned
  current_points_balance INTEGER DEFAULT 0, -- Available points
  points_redeemed INTEGER DEFAULT 0, -- Total points spent
  current_tier_id UUID REFERENCES loyalty_tiers(id),
  
  -- Engagement metrics
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  birthday_date DATE,
  
  -- Referral program
  referral_code TEXT UNIQUE,
  referred_by_code TEXT,
  referral_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  points_expire_date TIMESTAMPTZ, -- 12 months from last activity
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_members_user_id ON loyalty_members(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_phone ON loyalty_members(phone_number);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_tier ON loyalty_members(current_tier_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_referral ON loyalty_members(referral_code);

-- =====================================================
-- 3. LOYALTY TRANSACTIONS (Points History)
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type TEXT NOT NULL, -- 'earn', 'redeem', 'bonus', 'expire', 'adjust'
  points_change INTEGER NOT NULL, -- Positive for earn, negative for redeem
  points_balance_after INTEGER NOT NULL,
  
  -- Source tracking
  source_type TEXT, -- 'purchase', 'referral', 'birthday', 'promotion', 'manual'
  source_id UUID, -- Related order_id, product_id, etc.
  order_id UUID REFERENCES orders(id),
  
  -- Purchase details (if from order)
  order_total DECIMAL(10,2),
  points_multiplier DECIMAL(3,1) DEFAULT 1.0, -- 1x, 2x points
  
  -- Redemption details (if redeeming)
  reward_id UUID, -- Links to rewards_catalog
  reward_description TEXT,
  discount_amount DECIMAL(10,2),
  
  -- Notes
  description TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For points that expire
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_member ON loyalty_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_date ON loyalty_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order ON loyalty_transactions(order_id);

-- =====================================================
-- 4. REWARDS CATALOG
-- =====================================================
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reward details
  reward_name TEXT NOT NULL,
  reward_description TEXT,
  reward_type TEXT NOT NULL, -- 'discount', 'free_item', 'percentage_off', 'free_delivery', 'charity'
  
  -- Cost & value
  points_required INTEGER NOT NULL,
  dollar_value DECIMAL(10,2),
  discount_percentage DECIMAL(5,2),
  
  -- Eligibility
  min_tier_level INTEGER DEFAULT 1, -- Minimum tier required
  product_category TEXT, -- If reward is category-specific
  product_id UUID REFERENCES products(id), -- If reward is specific product
  
  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  max_redemptions INTEGER, -- NULL = unlimited
  redemptions_count INTEGER DEFAULT 0,
  
  -- Special types
  is_featured BOOLEAN DEFAULT FALSE,
  is_seasonal BOOLEAN DEFAULT FALSE,
  charitable_partner TEXT, -- If charity donation
  
  -- Display
  image_url TEXT,
  terms_conditions TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_active ON rewards_catalog(is_active, points_required);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_tier ON rewards_catalog(min_tier_level);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_category ON rewards_catalog(product_category);

-- Insert default rewards
INSERT INTO rewards_catalog (reward_name, reward_description, reward_type, points_required, dollar_value, is_active, is_featured) VALUES
('$5 Off Your Purchase', 'Redeem 100 points for $5 off your next order', 'discount', 100, 5.00, TRUE, TRUE),
('$10 Off Your Purchase', 'Redeem 200 points for $10 off your next order', 'discount', 200, 10.00, TRUE, TRUE),
('Free Beverage', 'Get any beverage free (up to $5 value)', 'free_item', 50, 5.00, TRUE, FALSE),
('10% Off Entire Order', 'Get 10% off your entire purchase', 'percentage_off', 150, NULL, TRUE, FALSE),
('Free Delivery', 'Free delivery on your next online order', 'free_delivery', 75, 10.00, TRUE, FALSE),
('Donate $5 to Food Bank', 'Convert your points to a $5 donation to local food bank', 'charity', 100, 5.00, TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. REWARD REDEMPTIONS (History)
-- =====================================================
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards_catalog(id),
  transaction_id UUID REFERENCES loyalty_transactions(id),
  order_id UUID REFERENCES orders(id), -- If redeemed during checkout
  
  -- Redemption details
  points_spent INTEGER NOT NULL,
  reward_value DECIMAL(10,2),
  status TEXT DEFAULT 'pending', -- 'pending', 'applied', 'used', 'expired', 'cancelled'
  
  -- Validity
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  used_at TIMESTAMPTZ,
  
  -- Notes
  redemption_code TEXT UNIQUE, -- Unique code for tracking
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_member ON reward_redemptions(member_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_code ON reward_redemptions(redemption_code);

-- =====================================================
-- 6. PROMOTIONAL CAMPAIGNS
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign details
  promotion_name TEXT NOT NULL,
  promotion_description TEXT,
  promotion_type TEXT NOT NULL, -- 'double_points', 'bonus_points', 'tier_bonus', 'category_multiplier'
  
  -- Bonus configuration
  points_multiplier DECIMAL(3,1) DEFAULT 2.0, -- 2x, 3x, etc.
  bonus_points INTEGER, -- Fixed bonus points
  target_category TEXT, -- If category-specific
  min_purchase_amount DECIMAL(10,2), -- Minimum spend required
  
  -- Eligibility
  eligible_tiers TEXT[], -- ['Bronze', 'Silver', 'Gold'] or NULL for all
  
  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Limits
  max_uses_per_member INTEGER,
  max_total_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  
  -- Display
  banner_url TEXT,
  terms TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_loyalty_promotions_active ON loyalty_promotions(is_active, start_date, end_date);

-- =====================================================
-- 7. REFERRAL TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  referred_member_id UUID REFERENCES loyalty_members(id),
  referral_code TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  
  -- Rewards
  referrer_bonus_points INTEGER DEFAULT 25,
  referred_bonus_points INTEGER DEFAULT 20,
  referrer_rewarded_at TIMESTAMPTZ,
  referred_rewarded_at TIMESTAMPTZ,
  
  -- Tracking
  referred_at TIMESTAMPTZ DEFAULT NOW(),
  first_purchase_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_referrals_referrer ON loyalty_referrals(referrer_member_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_referrals_code ON loyalty_referrals(referral_code);

-- =====================================================
-- 8. TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update member tier based on points
CREATE OR REPLACE FUNCTION update_member_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier_id UUID;
BEGIN
  -- Find the appropriate tier for the member's current points
  SELECT id INTO new_tier_id
  FROM loyalty_tiers
  WHERE points_threshold <= NEW.current_points_balance
  ORDER BY points_threshold DESC
  LIMIT 1;
  
  -- Update tier if changed
  IF new_tier_id IS DISTINCT FROM NEW.current_tier_id THEN
    NEW.current_tier_id = new_tier_id;
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tier on points change
DROP TRIGGER IF EXISTS trigger_update_member_tier ON loyalty_members;
CREATE TRIGGER trigger_update_member_tier
  BEFORE UPDATE OF current_points_balance ON loyalty_members
  FOR EACH ROW
  EXECUTE FUNCTION update_member_tier();

-- Function to extend points expiration on activity
CREATE OR REPLACE FUNCTION extend_points_expiration()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE loyalty_members
  SET points_expire_date = NOW() + INTERVAL '12 months',
      updated_at = NOW()
  WHERE id = NEW.member_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to extend expiration on any transaction
DROP TRIGGER IF EXISTS trigger_extend_expiration ON loyalty_transactions;
CREATE TRIGGER trigger_extend_expiration
  AFTER INSERT ON loyalty_transactions
  FOR EACH ROW
  WHEN (NEW.transaction_type IN ('earn', 'bonus'))
  EXECUTE FUNCTION extend_points_expiration();

-- Function to update member statistics
CREATE OR REPLACE FUNCTION update_member_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if this is from an order
  IF NEW.order_id IS NOT NULL AND NEW.transaction_type = 'earn' THEN
    UPDATE loyalty_members
    SET 
      total_purchases = total_purchases + 1,
      total_spent = total_spent + COALESCE(NEW.order_total, 0),
      average_order_value = (total_spent + COALESCE(NEW.order_total, 0)) / (total_purchases + 1),
      last_purchase_date = NOW(),
      updated_at = NOW()
    WHERE id = NEW.member_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on transactions
DROP TRIGGER IF EXISTS trigger_update_stats ON loyalty_transactions;
CREATE TRIGGER trigger_update_stats
  AFTER INSERT ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_member_stats();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_referrals ENABLE ROW LEVEL SECURITY;

-- Public can read tiers and rewards catalog
CREATE POLICY "Anyone can view loyalty tiers" ON loyalty_tiers FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can view active rewards" ON rewards_catalog FOR SELECT USING (is_active = TRUE);

-- Members can view their own data
CREATE POLICY "Members can view own data" ON loyalty_members FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Members can view own transactions" ON loyalty_transactions FOR SELECT 
  USING (member_id IN (SELECT id FROM loyalty_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view own redemptions" ON reward_redemptions FOR SELECT 
  USING (member_id IN (SELECT id FROM loyalty_members WHERE user_id = auth.uid()));

-- Admin can do everything (you'll need to add admin role check)
CREATE POLICY "Service role full access to loyalty_members" ON loyalty_members FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to loyalty_transactions" ON loyalty_transactions FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- 10. HELPER VIEWS
-- =====================================================

-- View for member summary with tier info
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

-- =====================================================
-- MAHARLIKA REWARDS SCHEMA COMPLETE
-- =====================================================
-- This schema supports:
-- ✓ Tiered membership (Bronze, Silver, Gold)
-- ✓ Point earning (1 point per $1, 2x promotions)
-- ✓ Point redemption (100 pts = $5 off)
-- ✓ Referral program
-- ✓ Charitable donations
-- ✓ Birthday rewards
-- ✓ Promotional campaigns
-- ✓ Transaction history
-- ✓ Analytics and tracking
-- ✓ Auto tier progression
-- ✓ Points expiration (12 months)
-- =====================================================
