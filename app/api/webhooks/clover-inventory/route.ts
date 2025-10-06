import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { fetchCloverItem } from "@/lib/clover"

// Use service role for webhook (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Clover Webhook Handler for Inventory Updates
 * 
 * This endpoint receives real-time notifications from Clover when:
 * - Products are created/updated/deleted
 * - Stock levels change
 * - Orders are placed (which affect inventory)
 * 
 * Configure this webhook in Clover Dashboard:
 * https://www.clover.com/appmarket/apps/[YOUR_APP_ID]/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("[v0] Received Clover webhook:", body)

    // Verify webhook signature (if Clover provides one)
    const signature = request.headers.get("x-clover-signature")
    // TODO: Implement signature verification for production

    const { type, objectId, merchantId } = body

    // Handle different webhook types
    switch (type) {
      case "ITEM_CREATED":
      case "ITEM_UPDATED":
        await handleItemUpdate(objectId, merchantId)
        break

      case "ITEM_DELETED":
        await handleItemDelete(objectId)
        break

      case "ITEM_STOCK_UPDATED":
        await handleStockUpdate(objectId, body.stockCount)
        break

      case "ORDER_CREATED":
      case "ORDER_UPDATED":
        await handleOrderUpdate(objectId, merchantId)
        break

      default:
        console.log(`[v0] Unhandled webhook type: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing Clover webhook:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

async function handleItemUpdate(itemId: string, merchantId: string) {
  try {
    console.log(`[v0] Updating item ${itemId} from Clover`)

    // Fetch latest item data from Clover
    const cloverItem = await fetchCloverItem(itemId)

    if (!cloverItem) {
      console.error(`[v0] Item ${itemId} not found in Clover`)
      return
    }

    // Upsert to Supabase
    const { error } = await supabase
      .from("products")
      .upsert({
        clover_id: cloverItem.id,
        name: cloverItem.name,
        description: cloverItem.description || `Premium ${cloverItem.name}`,
        price: cloverItem.price / 100, // Convert from cents
        stock_quantity: cloverItem.stockCount || 0,
        is_available: (cloverItem.price > 0) && (cloverItem.stockCount || 0) > 0,
        image_url: cloverItem.image?.url || cloverItem.images?.[0]?.url || null,
        category: mapCloverCategory(cloverItem.categories?.[0]?.name),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error(`[v0] Error upserting item ${itemId}:`, error)
    } else {
      console.log(`[v0] Successfully updated item ${itemId}`)
    }
  } catch (error) {
    console.error(`[v0] Error in handleItemUpdate:`, error)
  }
}

async function handleItemDelete(itemId: string) {
  try {
    console.log(`[v0] Marking item ${itemId} as unavailable`)

    // Don't delete, just mark as unavailable
    const { error } = await supabase
      .from("products")
      .update({ is_available: false })
      .eq("clover_id", itemId)

    if (error) {
      console.error(`[v0] Error marking item unavailable:`, error)
    } else {
      console.log(`[v0] Successfully marked item ${itemId} as unavailable`)
    }
  } catch (error) {
    console.error(`[v0] Error in handleItemDelete:`, error)
  }
}

async function handleStockUpdate(itemId: string, stockCount: number) {
  try {
    console.log(`[v0] Updating stock for item ${itemId} to ${stockCount}`)

    const { error } = await supabase
      .from("products")
      .update({
        stock_quantity: stockCount,
        is_available: stockCount > 0,
        updated_at: new Date().toISOString(),
      })
      .eq("clover_id", itemId)

    if (error) {
      console.error(`[v0] Error updating stock:`, error)
    } else {
      console.log(`[v0] Successfully updated stock for item ${itemId}`)
    }
  } catch (error) {
    console.error(`[v0] Error in handleStockUpdate:`, error)
  }
}

async function handleOrderUpdate(orderId: string, merchantId: string) {
  try {
    console.log(`[v0] Processing order ${orderId} for inventory updates`)

    // Fetch order details from Clover to get line items
    // Then update stock quantities for affected products
    // This ensures in-store sales update online inventory

    // TODO: Implement full order processing
    console.log("[v0] Order processing not yet implemented")
  } catch (error) {
    console.error(`[v0] Error in handleOrderUpdate:`, error)
  }
}

function mapCloverCategory(cloverCategory?: string): string {
  if (!cloverCategory) return "grocery"

  const categoryMap: Record<string, string> = {
    "Pantry": "grocery",
    "Dried Seafood": "seafood",
    "Snacks": "grocery",
    "Frozen Seafood": "seafood",
    "Personal Care": "grocery",
    "Condiments": "grocery",
    "Meat": "meat",
    "Bakery": "bakery",
    "Beverage": "grocery",
    "Vegetables": "produce",
    "Seafood": "seafood",
    "Drinks": "grocery",
    "Rice, Grains & Beans": "grocery",
    "Household Essentials": "grocery",
    "Prepared Food": "grocery",
    "Fresh Seafood": "seafood",
    "Canned Goods": "grocery",
    "Deli": "deli",
    "Ramen or Noodles": "grocery",
    "Dairy": "dairy",
  }

  return categoryMap[cloverCategory] || "grocery"
}
