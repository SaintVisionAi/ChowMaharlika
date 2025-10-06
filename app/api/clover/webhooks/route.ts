import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

// This webhook endpoint receives payment notifications from Clover
export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-clover-signature")
    
    const webhookData = JSON.parse(rawBody)
    
    // Handle Clover webhook verification challenge
    if (webhookData.verificationCode) {
      console.log("[v0] Clover webhook verification code:", webhookData.verificationCode)
      return NextResponse.json({ verificationCode: webhookData.verificationCode })
    }
    
    // Verify the webhook signature if signing secret is configured
    if (process.env.CLOVER_SIGNING_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.CLOVER_SIGNING_SECRET)
        .update(rawBody)
        .digest("hex")
      
      if (signature !== expectedSignature) {
        console.error("[v0] Invalid Clover webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    console.log("[v0] Received Clover webhook:", webhookData.type)

    const supabase = await createClient()

    // Handle different types of Clover webhook events
    switch (webhookData.type) {
      case "PAYMENT_PROCESSED":
      case "PAYMENT_AUTHORIZED":
        await handlePaymentSuccess(supabase, webhookData)
        break
        
      case "PAYMENT_DECLINED":
      case "PAYMENT_FAILED":
        await handlePaymentFailure(supabase, webhookData)
        break
        
      case "ORDER_CREATED":
        console.log("[v0] Order created in Clover:", webhookData.data?.id)
        break
        
      default:
        console.log("[v0] Unhandled Clover webhook type:", webhookData.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing Clover webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(supabase: any, webhookData: any) {
  try {
    const { data: paymentData } = webhookData
    
    // Extract order information from webhook data
    // The exact structure depends on how you set up the invoice number
    const invoiceNumber = paymentData?.invoice_number || paymentData?.reference
    
    if (invoiceNumber && invoiceNumber.startsWith("INV-")) {
      // Extract order ID from invoice number (format: INV-{orderIdPrefix})
      const orderIdPrefix = invoiceNumber.replace("INV-", "")
      
      // Find the order by ID prefix
      const { data: order, error: findError } = await supabase
        .from("orders")
        .select("id, status")
        .ilike("id", `${orderIdPrefix}%`)
        .eq("status", "payment_pending")
        .single()

      if (findError || !order) {
        console.error("[v0] Order not found for webhook:", invoiceNumber)
        return
      }

      // Update order status to confirmed
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          clover_transaction_id: paymentData?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      if (updateError) {
        console.error("[v0] Failed to update order status:", updateError)
        return
      }

      console.log("[v0] Payment confirmed for order:", order.id)

      // Optionally, create the order in Clover POS for kitchen fulfillment
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/clover/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: order.id }),
        })
        
        if (response.ok) {
          console.log("[v0] Order synced to Clover POS for fulfillment")
        }
      } catch (syncError) {
        console.error("[v0] Failed to sync order to POS:", syncError)
      }
    }
  } catch (error) {
    console.error("[v0] Error handling payment success webhook:", error)
  }
}

async function handlePaymentFailure(supabase: any, webhookData: any) {
  try {
    const { data: paymentData } = webhookData
    
    const invoiceNumber = paymentData?.invoice_number || paymentData?.reference
    
    if (invoiceNumber && invoiceNumber.startsWith("INV-")) {
      const orderIdPrefix = invoiceNumber.replace("INV-", "")
      
      const { data: order, error: findError } = await supabase
        .from("orders")
        .select("id, status")
        .ilike("id", `${orderIdPrefix}%`)
        .eq("status", "payment_pending")
        .single()

      if (findError || !order) {
        console.error("[v0] Order not found for failed payment webhook:", invoiceNumber)
        return
      }

      // Update order status to payment failed
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "payment_failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      if (updateError) {
        console.error("[v0] Failed to update order status for failed payment:", updateError)
        return
      }

      console.log("[v0] Payment failed for order:", order.id)
    }
  } catch (error) {
    console.error("[v0] Error handling payment failure webhook:", error)
  }
}