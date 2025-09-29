import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Webhook endpoint for receiving delivery platform notifications
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform, orderId, status, orderData } = body

    const supabase = await createClient()

    // Validate platform
    if (!["grubhub", "doordash", "ubereats"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
    }

    // Check if delivery order exists
    const { data: existingOrder } = await supabase
      .from("delivery_orders")
      .select("*")
      .eq("platform", platform)
      .eq("external_order_id", orderId)
      .single()

    if (existingOrder) {
      // Update existing order
      await supabase
        .from("delivery_orders")
        .update({
          status: status || existingOrder.status,
        })
        .eq("id", existingOrder.id)
    } else if (orderData) {
      // Create new delivery order
      await supabase.from("delivery_orders").insert({
        platform,
        external_order_id: orderId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        delivery_address: orderData.deliveryAddress,
        subtotal: orderData.subtotal,
        delivery_fee: orderData.deliveryFee,
        tax: orderData.tax,
        total: orderData.total,
        status: status || "pending",
        estimated_delivery_time: orderData.estimatedDeliveryTime,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing delivery webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
