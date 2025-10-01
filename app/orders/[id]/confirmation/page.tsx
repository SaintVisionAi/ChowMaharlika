"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function OrderConfirmationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "pending">("pending")
  
  const supabase = createClient()
  const orderId = params.id

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus()
    }
  }, [orderId])

  const checkPaymentStatus = async () => {
    try {
      // Get payment status from URL parameters (Clover adds these)
      const status = searchParams.get("status") // success, failure, etc.
      const transactionId = searchParams.get("transaction_id")
      const amount = searchParams.get("amount")
      
      // Fetch the order from your database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*, order_items(*, products(*))")
        .eq("id", orderId)
        .single()

      if (orderError) {
        throw new Error("Order not found")
      }

      setOrder(orderData)

      // Update order status based on Clover's response
      if (status === "success" || status === "approved") {
        // Payment was successful
        await supabase
          .from("orders")
          .update({
            status: "confirmed",
            clover_transaction_id: transactionId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)

        setPaymentStatus("success")
        
        // Also create the order in Clover POS for kitchen/fulfillment
        try {
          await fetch("/api/clover/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          })
        } catch (cloverError) {
          console.error("[v0] Failed to sync paid order with Clover POS:", cloverError)
          // Don't fail the confirmation if POS sync fails
        }
      } else if (status === "failure" || status === "declined") {
        // Payment failed
        await supabase
          .from("orders")
          .update({
            status: "payment_failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)

        setPaymentStatus("failed")
      } else {
        // Status unknown, keep as pending
        setPaymentStatus("pending")
      }
    } catch (error) {
      console.error("[v0] Error checking payment status:", error)
      setPaymentStatus("failed")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            {paymentStatus === "success" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              </>
            )}
            {paymentStatus === "failed" && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
              </>
            )}
            {paymentStatus === "pending" && (
              <>
                <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
                <CardTitle className="text-2xl text-yellow-600">Payment Pending</CardTitle>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentStatus === "success" && (
              <div>
                <p className="text-lg mb-4">
                  Thank you for your order! Your payment has been processed successfully.
                </p>
                <p className="text-muted-foreground mb-6">
                  Order #{order?.id.slice(0, 8)} • Total: ${order?.total_amount?.toFixed(2)}
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You will receive an email confirmation shortly. Your order is now being prepared.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                      <Link href={`/orders/${orderId}`}>View Order Details</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/menu">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div>
                <p className="text-lg mb-4">
                  We were unable to process your payment. Please try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/cart">Return to Cart</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/support">Contact Support</Link>
                  </Button>
                </div>
              </div>
            )}

            {paymentStatus === "pending" && (
              <div>
                <p className="text-lg mb-4">
                  Your payment status is still being confirmed. Please wait a moment.
                </p>
                <Button onClick={checkPaymentStatus} className="mt-4">
                  Check Status Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}