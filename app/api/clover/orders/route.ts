import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCloverOrder } from "@/lib/clover"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await request.json()

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name, price))")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Create order in Clover
    const cloverResult = await createCloverOrder({
      total: order.total_amount,
      items: order.order_items.map((item: any) => ({
        name: item.products.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })

    if (!cloverResult.success) {
      return NextResponse.json({ error: cloverResult.error }, { status: 500 })
    }

    // Update order with Clover order ID
    await supabase.from("orders").update({ clover_order_id: cloverResult.orderId }).eq("id", orderId)

    return NextResponse.json({
      success: true,
      cloverOrderId: cloverResult.orderId,
    })
  } catch (error) {
    console.error("Error creating Clover order:", error)
    return NextResponse.json({ error: "Failed to create Clover order" }, { status: 500 })
  }
}
