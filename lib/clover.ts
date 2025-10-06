// Clover API configuration
export const CLOVER_CONFIG = {
  merchantId: process.env.CLOVER_MERCHANT_ID!,
  apiKey: process.env.CLOVER_API_KEY!,
  publicToken: process.env.CLOVER_PUBLIC_TOKEN || "6f165c2b476bb19cd5598846557b0f81",
  privateToken: process.env.CLOVER_PRIVATE_TOKEN || "b8970583-8365-bee2-54ec-dc2f2ad8194f",
  baseUrl: (process.env.CLOVER_BASE_URL || "https://api.clover.com") + "/v3",
  sandboxUrl: process.env.CLOVER_SANDBOX_URL || "https://sandbox.dev.clover.com/v3",
}

export function validateCloverConfig() {
  if (!CLOVER_CONFIG.merchantId || !CLOVER_CONFIG.apiKey) {
    throw new Error(
      "Clover configuration is missing. Please set CLOVER_MERCHANT_ID and CLOVER_API_KEY environment variables.",
    )
  }
}

export interface CloverProduct {
  id: string
  name: string
  price: number
  description?: string
  categories?: { name: string }[]
  stockCount?: number
  image?: { url: string }
  images?: Array<{ url: string }>
}

export interface CloverOrder {
  id: string
  total: number
  state: string
  createdTime: number
  lineItems?: {
    elements: Array<{
      name: string
      price: number
      quantity?: number
    }>
  }
}

export async function fetchCloverInventory(): Promise<CloverProduct[]> {
  try {
    validateCloverConfig()

    const response = await fetch(`${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/items`, {
      headers: {
        Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Clover API error response:", errorText)
      throw new Error(`Clover API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Fetched Clover inventory:", data.elements?.length || 0, "items")
    return data.elements || []
  } catch (error) {
    console.error("[v0] Error fetching Clover inventory:", error)
    throw error
  }
}

export async function fetchCloverItem(itemId: string): Promise<CloverProduct | null> {
  try {
    validateCloverConfig()

    const response = await fetch(
      `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/items/${itemId}?expand=images`,
      {
        headers: {
          Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Clover API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching Clover item:", error)
    return null
  }
}

export async function fetchCloverItemImage(itemId: string): Promise<string | null> {
  try {
    validateCloverConfig()

    // Fetch item with images expanded
    const item = await fetchCloverItem(itemId)
    
    if (!item) return null

    // Check for image in the item
    if (item.image?.url) {
      return item.image.url
    }

    // Check for images array
    if (item.images && item.images.length > 0) {
      return item.images[0].url
    }

    return null
  } catch (error) {
    console.error("[v0] Error fetching Clover item image:", error)
    return null
  }
}

export async function createCloverOrder(orderData: {
  total: number
  items: Array<{ name: string; price: number; quantity: number }>
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    validateCloverConfig()

    console.log("[v0] Creating Clover order:", orderData)

    const response = await fetch(`${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        total: Math.round(orderData.total * 100), // Convert to cents
        state: "open",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Clover order creation error:", errorText)
      throw new Error(`Clover API error: ${response.status}`)
    }

    const order = await response.json()
    console.log("[v0] Created Clover order:", order.id)

    // Add line items to the order
    for (const item of orderData.items) {
      const lineItemResponse = await fetch(
        `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/orders/${order.id}/line_items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: item.name,
            price: Math.round(item.price * 100),
            quantity: item.quantity,
          }),
        },
      )

      if (!lineItemResponse.ok) {
        console.error("[v0] Failed to add line item:", item.name)
      }
    }

    console.log("[v0] Successfully created Clover order with line items")
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("[v0] Error creating Clover order:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateCloverInventory(
  itemId: string,
  stockCount: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    validateCloverConfig()

    const response = await fetch(
      `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/items/${itemId}/stock`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: stockCount,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Clover inventory update error:", errorText)
      throw new Error(`Clover API error: ${response.status}`)
    }

    console.log("[v0] Successfully updated Clover inventory for item:", itemId)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating Clover inventory:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function cancelCloverOrder(
  cloverOrderId: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    validateCloverConfig()

    console.log(`[v0] Cancelling Clover order: ${cloverOrderId}`, reason ? `Reason: ${reason}` : "")

    // Clover uses DELETE to cancel/delete orders
    const response = await fetch(
      `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/orders/${cloverOrderId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Clover order cancellation error:", errorText)
      
      // Handle specific error cases
      if (response.status === 404) {
        return { success: false, error: "Order not found in Clover" }
      }
      if (response.status === 403) {
        return { success: false, error: "Not authorized to cancel this order" }
      }
      
      throw new Error(`Clover API error: ${response.status} - ${errorText}`)
    }

    console.log("[v0] Successfully cancelled Clover order:", cloverOrderId)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error cancelling Clover order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function fetchCloverOrders(): Promise<CloverOrder[]> {
  try {
    validateCloverConfig()

    const response = await fetch(`${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/orders`, {
      headers: {
        Authorization: `Bearer ${CLOVER_CONFIG.apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Clover API error response:", errorText)
      throw new Error(`Clover API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Fetched Clover orders:", data.elements?.length || 0, "orders")
    return data.elements || []
  } catch (error) {
    console.error("[v0] Error fetching Clover orders:", error)
    throw error
  }
}

export async function syncCloverInventory() {
  try {
    const cloverItems = await fetchCloverInventory()
    return {
      success: true,
      itemCount: cloverItems.length,
      items: cloverItems,
    }
  } catch (error) {
    console.error("[v0] Error syncing Clover inventory:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
