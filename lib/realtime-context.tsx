"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface RealtimeContextValue {
  isConnected: boolean
  inventoryUpdates: number
  dealUpdates: number
  cartUpdates: number
  orderUpdates: number
}

const RealtimeContext = createContext<RealtimeContextValue>({
  isConnected: false,
  inventoryUpdates: 0,
  dealUpdates: 0,
  cartUpdates: 0,
  orderUpdates: 0,
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [inventoryUpdates, setInventoryUpdates] = useState(0)
  const [dealUpdates, setDealUpdates] = useState(0)
  const [cartUpdates, setCartUpdates] = useState(0)
  const [orderUpdates, setOrderUpdates] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    let productsChannel: RealtimeChannel
    let dealsChannel: RealtimeChannel
    let cartChannel: RealtimeChannel
    let ordersChannel: RealtimeChannel

    const setupRealtimeSubscriptions = async () => {
      console.log("[Realtime] Setting up WebSocket connections...")

      // Get current user for personalized subscriptions
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Subscribe to product inventory changes
      productsChannel = supabase
        .channel("products-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "products",
          },
          (payload) => {
            console.log("[Realtime] Product change:", payload)
            setInventoryUpdates((prev) => prev + 1)

            // Notify if product goes out of stock or back in stock
            if (payload.eventType === "UPDATE") {
              const oldStock = (payload.old as any)?.stock || 0
              const newStock = (payload.new as any)?.stock || 0

              if (oldStock > 0 && newStock === 0) {
                toast.warning(`${(payload.new as any)?.name} is now out of stock!`)
              } else if (oldStock === 0 && newStock > 0) {
                toast.success(`${(payload.new as any)?.name} is back in stock! 🎉`)
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("[Realtime] Products channel status:", status)
          if (status === "SUBSCRIBED") {
            setIsConnected(true)
          }
        })

      // 2. Subscribe to deals/promotions
      dealsChannel = supabase
        .channel("deals-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "products",
            filter: "on_sale=eq.true",
          },
          (payload) => {
            console.log("[Realtime] New deal:", payload)
            setDealUpdates((prev) => prev + 1)
            
            const product = payload.new as any
            if (product.discount_percentage > 0) {
              toast.success(
                `🔥 New Deal Alert! ${product.name} - ${product.discount_percentage}% OFF!`,
                {
                  duration: 5000,
                  action: {
                    label: "View",
                    onClick: () => {
                      window.location.href = `/products/${product.id}`
                    },
                  },
                }
              )
            }
          }
        )
        .subscribe()

      // 3. Subscribe to user's cart changes (if logged in)
      if (user) {
        cartChannel = supabase
          .channel(`cart-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cart_items",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("[Realtime] Cart change:", payload)
              setCartUpdates((prev) => prev + 1)
            }
          )
          .subscribe()

        // 4. Subscribe to user's order updates
        ordersChannel = supabase
          .channel(`orders-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("[Realtime] Order change:", payload)
              setOrderUpdates((prev) => prev + 1)

              if (payload.eventType === "UPDATE") {
                const order = payload.new as any
                const statusMessages: Record<string, string> = {
                  confirmed: "Your order has been confirmed! 🎉",
                  processing: "Your order is being prepared 📦",
                  shipped: "Your order has been shipped! 🚚",
                  delivered: "Your order has been delivered! ✅",
                  cancelled: "Your order has been cancelled",
                }

                const message = statusMessages[order.status]
                if (message) {
                  toast.info(message, {
                    duration: 7000,
                    action: {
                      label: "View Order",
                      onClick: () => {
                        window.location.href = `/orders/${order.id}`
                      },
                    },
                  })
                }
              }
            }
          )
          .subscribe()
      }

      // Connection status monitoring
      const connectionChecker = setInterval(() => {
        if (productsChannel) {
          const state = productsChannel.state
          setIsConnected(state === "joined" || state === "joining")
        }
      }, 5000)

      return () => {
        clearInterval(connectionChecker)
      }
    }

    setupRealtimeSubscriptions()

    // Cleanup on unmount
    return () => {
      console.log("[Realtime] Cleaning up WebSocket connections...")
      productsChannel?.unsubscribe()
      dealsChannel?.unsubscribe()
      cartChannel?.unsubscribe()
      ordersChannel?.unsubscribe()
    }
  }, [supabase])

  const value: RealtimeContextValue = {
    isConnected,
    inventoryUpdates,
    dealUpdates,
    cartUpdates,
    orderUpdates,
  }

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
