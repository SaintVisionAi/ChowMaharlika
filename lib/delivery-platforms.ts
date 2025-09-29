// Delivery platform configurations
export const DELIVERY_PLATFORMS = {
  grubhub: {
    name: "GrubHub",
    apiUrl: "https://api.grubhub.com/v1",
    color: "#F63440",
  },
  doordash: {
    name: "DoorDash",
    apiUrl: "https://api.doordash.com/v1",
    color: "#FF3008",
  },
  ubereats: {
    name: "Uber Eats",
    apiUrl: "https://api.uber.com/v1/eats",
    color: "#06C167",
  },
}

export type DeliveryPlatform = keyof typeof DELIVERY_PLATFORMS

export interface DeliveryOrder {
  id: string
  platform: DeliveryPlatform
  externalOrderId: string
  customerName: string
  customerPhone?: string
  deliveryAddress: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled"
  estimatedDeliveryTime?: string
  createdAt: Date
}

// Simulate delivery platform API calls
// In production, these would make actual API calls to each platform

export async function fetchDeliveryOrders(platform: DeliveryPlatform): Promise<DeliveryOrder[]> {
  // This would make an actual API call to the delivery platform
  // For now, returning mock data
  console.log(`Fetching orders from ${platform}`)
  return []
}

export async function updateDeliveryOrderStatus(
  platform: DeliveryPlatform,
  orderId: string,
  status: DeliveryOrder["status"],
): Promise<{ success: boolean; error?: string }> {
  try {
    // This would make an actual API call to update the order status
    console.log(`Updating ${platform} order ${orderId} to status: ${status}`)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function acceptDeliveryOrder(
  platform: DeliveryPlatform,
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Accepting ${platform} order ${orderId}`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function rejectDeliveryOrder(
  platform: DeliveryPlatform,
  orderId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Rejecting ${platform} order ${orderId}: ${reason}`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function getDeliveryPlatformColor(platform: DeliveryPlatform): string {
  return DELIVERY_PLATFORMS[platform]?.color || "#000000"
}

export function getDeliveryPlatformName(platform: DeliveryPlatform): string {
  return DELIVERY_PLATFORMS[platform]?.name || platform
}
