import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getMemberByUserId, redeemReward } from "@/lib/rewards"

/**
 * POST /api/rewards/redeem
 * Redeem a reward from the catalog
 * 
 * Body:
 * - reward_id (required)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { reward_id } = body
    
    if (!reward_id) {
      return NextResponse.json(
        { error: "Reward ID is required" },
        { status: 400 }
      )
    }
    
    // Get member
    const member = await getMemberByUserId(user.id)
    
    if (!member) {
      return NextResponse.json(
        { error: "Not enrolled in rewards program" },
        { status: 404 }
      )
    }
    
    // Redeem reward
    const result = await redeemReward({
      memberId: member.id,
      rewardId: reward_id,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    // Get updated balance
    const { data: updatedMember } = await supabase
      .from("loyalty_members")
      .select("current_points_balance")
      .eq("id", member.id)
      .single()
    
    return NextResponse.json({
      success: true,
      redemption_code: result.redemptionCode,
      new_balance: updatedMember?.current_points_balance || 0,
      message: "Reward redeemed successfully! Use your code at checkout.",
    })
  } catch (error) {
    console.error("Redemption error:", error)
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/rewards/redeem
 * Get active (unredeemed) rewards for user
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
    
    // Get member
    const member = await getMemberByUserId(user.id)
    
    if (!member) {
      return NextResponse.json({ active_redemptions: [] })
    }
    
    // Get active redemptions
    const { data: redemptions } = await supabase
      .from("reward_redemptions")
      .select(`
        *,
        reward:rewards_catalog(*)
      `)
      .eq("member_id", member.id)
      .in("status", ["pending", "applied"])
      .gte("expires_at", new Date().toISOString())
      .order("redeemed_at", { ascending: false })
    
    return NextResponse.json({
      active_redemptions: redemptions || [],
    })
  } catch (error) {
    console.error("Active redemptions error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve redemptions" },
      { status: 500 }
    )
  }
}
