import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getMemberByUserId, getAvailableRewards, getAllTiers } from "@/lib/rewards"

/**
 * GET /api/rewards/catalog
 * Get rewards catalog with eligibility info for current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let memberTierLevel = 1 // Default to Bronze
    let currentPoints = 0
    
    if (user) {
      const member = await getMemberByUserId(user.id)
      if (member) {
        // Get tier level
        const { data: tierData } = await supabase
          .from("loyalty_tiers")
          .select("tier_level")
          .eq("id", member.current_tier_id)
          .single()
        
        memberTierLevel = tierData?.tier_level || 1
        currentPoints = member.current_points_balance
      }
    }
    
    // Get all rewards (filtered by tier)
    const allRewards = await getAvailableRewards(memberTierLevel)
    
    // Get all tiers for context
    const tiers = await getAllTiers()
    
    // Categorize rewards
    const categorized = {
      featured: allRewards.filter((r) => r.is_featured),
      affordable: allRewards.filter((r) => r.points_required <= currentPoints),
      discounts: allRewards.filter((r) => r.reward_type === "discount"),
      free_items: allRewards.filter((r) => r.reward_type === "free_item"),
      charitable: allRewards.filter((r) => r.reward_type === "charity"),
      all: allRewards,
    }
    
    return NextResponse.json({
      rewards: categorized,
      user_context: {
        current_points: currentPoints,
        tier_level: memberTierLevel,
        is_member: !!user,
      },
      tiers: tiers.map((t) => ({
        name: t.tier_name,
        level: t.tier_level,
        threshold: t.points_threshold,
        color: t.tier_color,
        icon: t.tier_icon,
      })),
    })
  } catch (error) {
    console.error("Catalog error:", error)
    return NextResponse.json(
      { error: "Failed to load rewards catalog" },
      { status: 500 }
    )
  }
}
