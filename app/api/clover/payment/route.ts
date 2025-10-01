import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CLOVER_CONFIG } from "@/lib/clover"
import crypto from "crypto"

// This function creates a secure payment URL for Clover's hosted payment page
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

    // Calculate total amount in cents (Clover uses cents)
    const amount = Math.round(order.total_amount * 100)
    
    // Create a unique reference/invoice number for this order
    const invoiceNumber = `INV-${order.id.slice(0, 8)}`
    
    // Generate a redirect URL back to your site
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/orders/${order.id}/confirmation`
    
    // Generate a timestamp for the request
    const timestamp = Math.floor(Date.now() / 1000).toString()
    
    // Create the payment URL with required parameters
    const baseUrl = "https://checkout.clover.com/pay"
    
    const params = new URLSearchParams({
      mid: CLOVER_CONFIG.merchantId,
      amount: amount.toString(),
      currency: "USD",
      inv: invoiceNumber,
      redirect_url: redirectUrl,
      token: CLOVER_CONFIG.publicToken,
      timestamp: timestamp,
    })
    
    // Optional: Generate a signature if you have a signing secret
    // This requires the signing secret from Clover Developer Dashboard
    if (process.env.CLOVER_SIGNING_SECRET) {
      const stringToSign = `${CLOVER_CONFIG.merchantId}|${amount}|USD|${invoiceNumber}|${redirectUrl}|${timestamp}`
      const signature = crypto
        .createHmac("sha256", process.env.CLOVER_SIGNING_SECRET)
        .update(stringToSign)
        .digest("hex")
      
      params.append("signature", signature)
    }
    
    // Build the complete payment URL
    const paymentUrl = `${baseUrl}?${params.toString()}`
    
    // Update order status to 'payment_pending'
    await supabase
      .from("orders")
      .update({ status: "payment_pending" })
      .eq("id", order.id)
    
    return NextResponse.json({
      success: true,
      paymentUrl: paymentUrl,
    })
  } catch (error) {
    console.error("[v0] Error generating Clover payment URL:", error)
    return NextResponse.json({ error: "Failed to generate payment URL" }, { status: 500 })
  }
}