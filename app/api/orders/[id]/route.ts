import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching order details:", params.id)

    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch order with line items and product details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          created_at,
          products (
            id,
            name,
            description,
            category,
            image_url
          )
        )
      `,
      )
      .eq("id", params.id)
      .single()

    if (orderError) {
      if (orderError.code === "PGRST116") {
        console.log("[v0] Order not found:", params.id)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      console.error("[v0] Database error fetching order:", orderError)
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (order.user_id !== user.id) {
      console.log("[v0] User attempting to access order they don't own")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("[v0] Successfully fetched order:", params.id)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("[v0] Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
