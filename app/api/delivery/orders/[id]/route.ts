import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateDeliveryOrderStatus } from "@/lib/delivery-platforms"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()

    // Get delivery order
    const { data: deliveryOrder, error: fetchError } = await supabase
      .from("delivery_orders")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !deliveryOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update status in delivery platform
    const result = await updateDeliveryOrderStatus(deliveryOrder.platform, deliveryOrder.external_order_id, status)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Update status in database
    const { error: updateError } = await supabase.from("delivery_orders").update({ status }).eq("id", params.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating delivery order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
