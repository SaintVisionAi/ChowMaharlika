import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cancelCloverOrder } from "@/lib/clover"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Processing order cancellation request:", params.id)

    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Unauthorized cancellation attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { reason } = body

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", params.id)
      .single()

    if (fetchError || !order) {
      console.log("[v0] Order not found:", params.id)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      console.log("[v0] User attempting to cancel order they don't own")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if already cancelled
    if (order.cancelled_at) {
      console.log("[v0] Order already cancelled:", params.id)
      return NextResponse.json({ error: "Order already cancelled" }, { status: 400 })
    }

    // Check if order can be cancelled based on status
    const cancellableStatuses = ["pending", "confirmed", "payment_pending"]
    if (!cancellableStatuses.includes(order.status)) {
      console.log("[v0] Order cannot be cancelled in current status:", order.status)
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.status}` },
        { status: 400 },
      )
    }

    // Cancel in Clover if synced
    let cloverCancelled = false
    if (order.clover_order_id) {
      console.log("[v0] Cancelling order in Clover:", order.clover_order_id)
      const cloverResult = await cancelCloverOrder(order.clover_order_id, reason)

      if (!cloverResult.success) {
        console.error("[v0] Failed to cancel in Clover:", cloverResult.error)
        // Continue with local cancellation even if Clover fails
        // Store the error for admin review
      } else {
        cloverCancelled = true
        console.log("[v0] Successfully cancelled in Clover")
      }
    }

    // Update order in database
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || "Customer requested cancellation",
        cancelled_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select("*")
      .single()

    if (updateError) {
      console.error("[v0] Failed to update order status:", updateError)
      return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
    }

    console.log("[v0] Order successfully cancelled:", params.id)

    // TODO: Send cancellation email notification (Phase 3)
    // TODO: Refund payment if already processed (Phase 5)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      clover_cancelled: cloverCancelled,
      message: "Order cancelled successfully",
    })
  } catch (error) {
    console.error("[v0] Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
