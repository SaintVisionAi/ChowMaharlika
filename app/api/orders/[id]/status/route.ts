import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CLOVER_CONFIG } from "@/lib/clover"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching order status:", params.id)

    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Unauthorized status check attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch order from database
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !order) {
      console.log("[v0] Order not found:", params.id)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      console.log("[v0] User attempting to check status of order they don't own")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Build status timeline
    const timeline = [
      {
        status: "created",
        timestamp: order.created_at,
        message: "Order placed",
      },
    ]

    if (order.status === "payment_pending" || order.status === "confirmed") {
      timeline.push({
        status: "payment_pending",
        timestamp: order.updated_at,
        message: "Awaiting payment confirmation",
      })
    }

    if (order.status === "confirmed" || order.status === "processing" || order.status === "completed") {
      timeline.push({
        status: "confirmed",
        timestamp: order.updated_at,
        message: "Payment confirmed",
      })
    }

    if (order.status === "processing" || order.status === "completed") {
      timeline.push({
        status: "processing",
        timestamp: order.updated_at,
        message: "Order is being prepared",
      })
    }

    if (order.status === "completed") {
      timeline.push({
        status: "completed",
        timestamp: order.updated_at,
        message: "Order completed",
      })
    }

    if (order.cancelled_at) {
      timeline.push({
        status: "cancelled",
        timestamp: order.cancelled_at,
        message: order.cancellation_reason || "Order cancelled",
      })
    }

    // If order is in Clover and active, fetch live status
    let cloverStatus = null
    if (order.clover_order_id && ["processing", "confirmed"].includes(order.status)) {
      try {
        const response = await fetch(
          `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/orders/${order.clover_order_id}`,
          {
            headers: {
              Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
            },
          },
        )

        if (response.ok) {
          const cloverOrder = await response.json()
          cloverStatus = {
            state: cloverOrder.state,
            modified_time: cloverOrder.modifiedTime,
            employee: cloverOrder.employee?.name,
          }

          console.log("[v0] Fetched live Clover status:", cloverStatus.state)

          // Sync status back to database if changed
          if (cloverOrder.state === "locked" && order.status !== "completed") {
            await supabase
              .from("orders")
              .update({
                status: "completed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", params.id)

            console.log("[v0] Synced completed status from Clover")
          }
        }
      } catch (error) {
        console.error("[v0] Failed to fetch Clover status:", error)
        // Continue without Clover status
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        delivery_method: order.delivery_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        cancelled_at: order.cancelled_at,
        cancellation_reason: order.cancellation_reason,
      },
      timeline,
      clover_status: cloverStatus,
    })
  } catch (error) {
    console.error("[v0] Error fetching order status:", error)
    return NextResponse.json({ error: "Failed to fetch order status" }, { status: 500 })
  }
}
