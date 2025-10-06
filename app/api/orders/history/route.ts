import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    console.log("[v0] Fetching order history")

    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Unauthorized history access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50) // Max 50 per page
    const offset = (page - 1) * limit

    // Get total count
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (countError) {
      console.error("[v0] Error counting orders:", countError)
      return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 })
    }

    // Fetch orders with minimal order_items data for efficiency
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_amount,
        status,
        delivery_method,
        created_at,
        updated_at,
        cancelled_at,
        cancellation_reason,
        order_items!inner (
          id,
          quantity,
          products (
            name,
            category,
            image_url
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (ordersError) {
      console.error("[v0] Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 })
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    console.log(`[v0] Fetched ${orders?.length || 0} orders (page ${page}/${totalPages})`)

    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching order history:", error)
    return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 })
  }
}
