import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getMemberByUserId, getTransactionHistory } from "@/lib/rewards"

/**
 * GET /api/rewards/history
 * Get member's transaction history
 * 
 * Query params:
 * - limit: number of transactions (default 50)
 * - type: filter by type (earn, redeem, bonus, etc.)
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
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const typeFilter = searchParams.get("type")
    
    // Get member
    const member = await getMemberByUserId(user.id)
    
    if (!member) {
      return NextResponse.json(
        { error: "Not enrolled in rewards program" },
        { status: 404 }
      )
    }
    
    // Get transaction history
    let transactions = await getTransactionHistory(member.id, limit)
    
    // Filter by type if requested
    if (typeFilter) {
      transactions = transactions.filter((t) => t.transaction_type === typeFilter)
    }
    
    // Calculate summary stats
    const summary = {
      total_transactions: transactions.length,
      total_earned: transactions
        .filter((t) => t.transaction_type === "earn" || t.transaction_type === "bonus")
        .reduce((sum, t) => sum + t.points_change, 0),
      total_redeemed: Math.abs(
        transactions
          .filter((t) => t.transaction_type === "redeem")
          .reduce((sum, t) => sum + t.points_change, 0)
      ),
      last_activity: transactions[0]?.transaction_date || null,
    }
    
    // Format transactions for frontend
    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      type: t.transaction_type,
      points: t.points_change,
      balance_after: t.points_balance_after,
      description: t.description,
      date: t.transaction_date,
      source: t.source_type,
      order_id: t.order_id,
      reward_description: t.reward_description,
      multiplier: t.points_multiplier,
    }))
    
    return NextResponse.json({
      transactions: formattedTransactions,
      summary,
      member: {
        current_balance: member.current_points_balance,
        lifetime_earned: member.total_points_earned,
        total_redeemed: member.points_redeemed,
      },
    })
  } catch (error) {
    console.error("History error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve transaction history" },
      { status: 500 }
    )
  }
}
