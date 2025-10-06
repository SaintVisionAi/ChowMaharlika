import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getMemberByUserId, getMemberWithTier, calculateNextTierProgress, getAvailableRewards } from "@/lib/rewards"

/**
 * GET /api/rewards/balance
 * Get member's rewards balance, tier info, and available rewards
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // Get member with tier info
    const memberData = await getMemberWithTier(user.id)
    
    if (!memberData) {
      return NextResponse.json(
        { enrolled: false, message: "Not enrolled in rewards program" },
        { status: 404 }
      )
    }
    
    // Calculate tier progress
    const tierProgress = await calculateNextTierProgress(
      memberData.current_points_balance,
      memberData.current_tier_id
    )
    
    // Get tier info from database
    const { data: tierInfo } = await supabase
      .from("loyalty_tiers")
      .select("*")
      .eq("tier_name", memberData.tier_name)
      .single()
    
    // Get available rewards
    const availableRewards = await getAvailableRewards(memberData.tier_level)
    
    // Get affordable rewards (member has enough points)
    const affordableRewards = availableRewards.filter(
      (r) => r.points_required <= memberData.current_points_balance
    )
    
    return NextResponse.json({
      enrolled: true,
      member: {
        id: memberData.id,
        full_name: memberData.full_name,
        phone_number: memberData.phone_number,
        email: memberData.email,
        enrollment_date: memberData.enrollment_date,
        last_purchase_date: memberData.last_purchase_date,
        referral_code: memberData.referral_code,
        referral_count: memberData.referral_count,
      },
      points: {
        current_balance: memberData.current_points_balance,
        lifetime_earned: memberData.total_points_earned,
        total_redeemed: memberData.points_redeemed,
        dollar_value: Math.floor(memberData.current_points_balance / 20), // 100 pts = $5
      },
      tier: {
        current: {
          name: memberData.tier_name,
          level: memberData.tier_level,
          color: memberData.tier_color,
          icon: memberData.tier_icon,
          discount_percentage: tierInfo?.discount_percentage || 0,
          benefits: {
            free_delivery: tierInfo?.free_delivery || false,
            double_point_events: tierInfo?.double_point_events || false,
            charitable_donations: tierInfo?.charitable_donations || false,
            concierge_service: tierInfo?.concierge_service || false,
            early_access: tierInfo?.early_access || false,
          },
        },
        progress: tierProgress,
      },
      purchase_stats: {
        total_purchases: memberData.total_purchases,
        total_spent: memberData.total_spent,
        average_order_value: memberData.average_order_value,
      },
      rewards: {
        total_available: availableRewards.length,
        affordable: affordableRewards.length,
        featured: availableRewards.filter((r) => r.is_featured),
      },
    })
  } catch (error) {
    console.error("Balance check error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve balance" },
      { status: 500 }
    )
  }
}
