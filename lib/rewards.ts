/**
 * Maharlika Rewards - Core Library
 * 
 * Helper functions for loyalty program operations:
 * - Point earning and redemption
 * - Tier management
 * - Member enrollment
 * - Transaction tracking
 */

import { createClient } from "@/lib/supabase/server"

// =====================================================
// TYPES
// =====================================================

export interface LoyaltyMember {
  id: string
  user_id: string | null
  phone_number: string
  email: string | null
  full_name: string | null
  total_points_earned: number
  current_points_balance: number
  points_redeemed: number
  current_tier_id: string
  total_purchases: number
  total_spent: number
  average_order_value: number
  last_purchase_date: string | null
  enrollment_date: string
  birthday_date: string | null
  referral_code: string
  referred_by_code: string | null
  referral_count: number
  is_active: boolean
  points_expire_date: string | null
}

export interface LoyaltyTier {
  id: string
  tier_name: string
  tier_level: number
  points_threshold: number
  discount_percentage: number
  free_delivery: boolean
  double_point_events: boolean
  charitable_donations: boolean
  concierge_service: boolean
  early_access: boolean
  birthday_reward_points: number
  welcome_bonus_points: number
  tier_color: string
  tier_icon: string
}

export interface LoyaltyTransaction {
  id: string
  member_id: string
  transaction_type: "earn" | "redeem" | "bonus" | "expire" | "adjust"
  points_change: number
  points_balance_after: number
  source_type: string
  source_id: string | null
  order_id: string | null
  order_total: number | null
  points_multiplier: number
  reward_id: string | null
  reward_description: string | null
  discount_amount: number | null
  description: string | null
  transaction_date: string
}

export interface Reward {
  id: string
  reward_name: string
  reward_description: string
  reward_type: "discount" | "free_item" | "percentage_off" | "free_delivery" | "charity"
  points_required: number
  dollar_value: number | null
  discount_percentage: number | null
  min_tier_level: number
  is_active: boolean
  is_featured: boolean
}

// =====================================================
// MEMBER OPERATIONS
// =====================================================

/**
 * Get loyalty member by user ID
 */
export async function getMemberByUserId(userId: string): Promise<LoyaltyMember | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*")
    .eq("user_id", userId)
    .single()
  
  if (error || !data) return null
  return data as LoyaltyMember
}

/**
 * Get loyalty member by phone number
 */
export async function getMemberByPhone(phoneNumber: string): Promise<LoyaltyMember | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*")
    .eq("phone_number", phoneNumber)
    .single()
  
  if (error || !data) return null
  return data as LoyaltyMember
}

/**
 * Get member with tier information
 */
export async function getMemberWithTier(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("loyalty_member_summary")
    .select("*")
    .eq("user_id", userId)
    .single()
  
  if (error || !data) return null
  return data
}

/**
 * Generate unique referral code
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `MHR${code}` // Maharlika Rewards prefix
}

/**
 * Enroll new loyalty member
 */
export async function enrollMember(params: {
  userId?: string
  phoneNumber: string
  email?: string
  fullName?: string
  birthdayDate?: string
  referredByCode?: string
}): Promise<{ success: boolean; member?: LoyaltyMember; error?: string }> {
  const supabase = await createClient()
  
  // Check if already enrolled
  const existing = await getMemberByPhone(params.phoneNumber)
  if (existing) {
    return { success: false, error: "Phone number already enrolled" }
  }
  
  // Get Bronze tier (default)
  const { data: bronzeTier } = await supabase
    .from("loyalty_tiers")
    .select("id, welcome_bonus_points")
    .eq("tier_level", 1)
    .single()
  
  if (!bronzeTier) {
    return { success: false, error: "Default tier not found" }
  }
  
  // Generate referral code
  const referralCode = generateReferralCode()
  
  // Create member
  const { data: newMember, error: createError } = await supabase
    .from("loyalty_members")
    .insert({
      user_id: params.userId || null,
      phone_number: params.phoneNumber,
      email: params.email || null,
      full_name: params.fullName || null,
      birthday_date: params.birthdayDate || null,
      current_tier_id: bronzeTier.id,
      referral_code: referralCode,
      referred_by_code: params.referredByCode || null,
      current_points_balance: bronzeTier.welcome_bonus_points,
      total_points_earned: bronzeTier.welcome_bonus_points,
      points_expire_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 12 months
    })
    .select()
    .single()
  
  if (createError || !newMember) {
    return { success: false, error: createError?.message || "Failed to create member" }
  }
  
  // Record welcome bonus transaction
  await supabase.from("loyalty_transactions").insert({
    member_id: newMember.id,
    transaction_type: "bonus",
    points_change: bronzeTier.welcome_bonus_points,
    points_balance_after: bronzeTier.welcome_bonus_points,
    source_type: "welcome_bonus",
    description: "Welcome bonus for joining Maharlika Rewards!",
  })
  
  // Handle referral if provided
  if (params.referredByCode) {
    await processReferral(params.referredByCode, newMember.id)
  }
  
  return { success: true, member: newMember as LoyaltyMember }
}

// =====================================================
// POINTS OPERATIONS
// =====================================================

/**
 * Award points for a purchase
 */
export async function awardPoints(params: {
  memberId: string
  orderId: string
  orderTotal: number
  pointsMultiplier?: number
}): Promise<{ success: boolean; pointsEarned?: number; newBalance?: number; error?: string }> {
  const supabase = await createClient()
  
  const { memberId, orderId, orderTotal, pointsMultiplier = 1.0 } = params
  
  // Calculate points (1 point per dollar by default)
  const basePoints = Math.floor(orderTotal)
  const pointsEarned = Math.floor(basePoints * pointsMultiplier)
  
  // Get current member data
  const { data: member } = await supabase
    .from("loyalty_members")
    .select("current_points_balance, total_points_earned")
    .eq("id", memberId)
    .single()
  
  if (!member) {
    return { success: false, error: "Member not found" }
  }
  
  const newBalance = member.current_points_balance + pointsEarned
  const newTotalEarned = member.total_points_earned + pointsEarned
  
  // Update member points
  const { error: updateError } = await supabase
    .from("loyalty_members")
    .update({
      current_points_balance: newBalance,
      total_points_earned: newTotalEarned,
    })
    .eq("id", memberId)
  
  if (updateError) {
    return { success: false, error: updateError.message }
  }
  
  // Record transaction
  await supabase.from("loyalty_transactions").insert({
    member_id: memberId,
    transaction_type: "earn",
    points_change: pointsEarned,
    points_balance_after: newBalance,
    source_type: "purchase",
    order_id: orderId,
    order_total: orderTotal,
    points_multiplier: pointsMultiplier,
    description: `Earned ${pointsEarned} points from purchase${pointsMultiplier > 1 ? ` (${pointsMultiplier}x bonus!)` : ""}`,
  })
  
  return { success: true, pointsEarned, newBalance }
}

/**
 * Redeem reward
 */
export async function redeemReward(params: {
  memberId: string
  rewardId: string
}): Promise<{ success: boolean; redemptionCode?: string; error?: string }> {
  const supabase = await createClient()
  
  // Get reward details
  const { data: reward } = await supabase
    .from("rewards_catalog")
    .select("*")
    .eq("id", params.rewardId)
    .single()
  
  if (!reward || !reward.is_active) {
    return { success: false, error: "Reward not available" }
  }
  
  // Get member
  const { data: member } = await supabase
    .from("loyalty_members")
    .select("current_points_balance, current_tier_id")
    .eq("id", params.memberId)
    .single()
  
  if (!member) {
    return { success: false, error: "Member not found" }
  }
  
  // Check sufficient points
  if (member.current_points_balance < reward.points_required) {
    return { success: false, error: "Insufficient points" }
  }
  
  // Check tier eligibility
  const { data: tier } = await supabase
    .from("loyalty_tiers")
    .select("tier_level")
    .eq("id", member.current_tier_id)
    .single()
  
  if (tier && tier.tier_level < reward.min_tier_level) {
    return { success: false, error: "Tier requirement not met" }
  }
  
  // Deduct points
  const newBalance = member.current_points_balance - reward.points_required
  await supabase
    .from("loyalty_members")
    .update({
      current_points_balance: newBalance,
      points_redeemed: member.current_points_balance - newBalance,
    })
    .eq("id", params.memberId)
  
  // Create transaction
  const { data: transaction } = await supabase
    .from("loyalty_transactions")
    .insert({
      member_id: params.memberId,
      transaction_type: "redeem",
      points_change: -reward.points_required,
      points_balance_after: newBalance,
      source_type: "redemption",
      reward_id: params.rewardId,
      reward_description: reward.reward_name,
      discount_amount: reward.dollar_value,
      description: `Redeemed: ${reward.reward_name}`,
    })
    .select()
    .single()
  
  if (!transaction) {
    return { success: false, error: "Failed to create transaction" }
  }
  
  // Create redemption record
  const redemptionCode = `RD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
  
  await supabase.from("reward_redemptions").insert({
    member_id: params.memberId,
    reward_id: params.rewardId,
    transaction_id: transaction.id,
    points_spent: reward.points_required,
    reward_value: reward.dollar_value,
    redemption_code: redemptionCode,
    status: "pending",
  })
  
  return { success: true, redemptionCode }
}

// =====================================================
// TIER OPERATIONS
// =====================================================

/**
 * Get all loyalty tiers
 */
export async function getAllTiers(): Promise<LoyaltyTier[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from("loyalty_tiers")
    .select("*")
    .order("tier_level")
  
  return (data as LoyaltyTier[]) || []
}

/**
 * Calculate points until next tier
 */
export async function calculateNextTierProgress(currentPoints: number, currentTierId: string) {
  const tiers = await getAllTiers()
  const currentTier = tiers.find((t) => t.id === currentTierId)
  
  if (!currentTier) return null
  
  const nextTier = tiers.find((t) => t.tier_level === currentTier.tier_level + 1)
  
  if (!nextTier) {
    return {
      isMaxTier: true,
      currentTier,
      nextTier: null,
      pointsUntilNext: 0,
      progressPercentage: 100,
    }
  }
  
  const pointsUntilNext = nextTier.points_threshold - currentPoints
  const progressPercentage =
    ((currentPoints - currentTier.points_threshold) / (nextTier.points_threshold - currentTier.points_threshold)) * 100
  
  return {
    isMaxTier: false,
    currentTier,
    nextTier,
    pointsUntilNext: Math.max(0, pointsUntilNext),
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  }
}

// =====================================================
// REWARDS CATALOG
// =====================================================

/**
 * Get available rewards for member
 */
export async function getAvailableRewards(memberTierLevel: number): Promise<Reward[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from("rewards_catalog")
    .select("*")
    .eq("is_active", true)
    .lte("min_tier_level", memberTierLevel)
    .order("points_required")
  
  return (data as Reward[]) || []
}

// =====================================================
// REFERRALS
// =====================================================

/**
 * Process referral rewards
 */
async function processReferral(referralCode: string, referredMemberId: string) {
  const supabase = await createClient()
  
  // Find referrer
  const { data: referrer } = await supabase
    .from("loyalty_members")
    .select("id, current_points_balance")
    .eq("referral_code", referralCode)
    .single()
  
  if (!referrer) return
  
  // Create referral record
  await supabase.from("loyalty_referrals").insert({
    referrer_member_id: referrer.id,
    referred_member_id: referredMemberId,
    referral_code: referralCode,
    status: "pending",
  })
  
  // Award bonus points to referrer (will be awarded when referee makes first purchase)
}

/**
 * Complete referral after first purchase
 */
export async function completeReferral(referredMemberId: string) {
  const supabase = await createClient()
  
  // Find pending referral
  const { data: referral } = await supabase
    .from("loyalty_referrals")
    .select("*")
    .eq("referred_member_id", referredMemberId)
    .eq("status", "pending")
    .single()
  
  if (!referral) return
  
  // Award points to referrer
  const referrerBonus = referral.referrer_bonus_points
  const { data: referrer } = await supabase
    .from("loyalty_members")
    .select("current_points_balance, total_points_earned")
    .eq("id", referral.referrer_member_id)
    .single()
  
  if (referrer) {
    const newBalance = referrer.current_points_balance + referrerBonus
    
    await supabase
      .from("loyalty_members")
      .update({
        current_points_balance: newBalance,
        total_points_earned: referrer.total_points_earned + referrerBonus,
        referral_count: supabase.raw("referral_count + 1"),
      })
      .eq("id", referral.referrer_member_id)
    
    await supabase.from("loyalty_transactions").insert({
      member_id: referral.referrer_member_id,
      transaction_type: "bonus",
      points_change: referrerBonus,
      points_balance_after: newBalance,
      source_type: "referral",
      description: `Referral bonus for inviting a friend!`,
    })
  }
  
  // Update referral status
  await supabase
    .from("loyalty_referrals")
    .update({
      status: "rewarded",
      referrer_rewarded_at: new Date().toISOString(),
      first_purchase_at: new Date().toISOString(),
    })
    .eq("id", referral.id)
}

// =====================================================
// TRANSACTION HISTORY
// =====================================================

/**
 * Get member's transaction history
 */
export async function getTransactionHistory(
  memberId: string,
  limit = 50
): Promise<LoyaltyTransaction[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("member_id", memberId)
    .order("transaction_date", { ascending: false })
    .limit(limit)
  
  return (data as LoyaltyTransaction[]) || []
}
