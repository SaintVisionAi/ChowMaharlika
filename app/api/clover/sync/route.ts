import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchCloverInventory } from "@/lib/clover"

export async function POST() {
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

    console.log("[v0] Starting Clover inventory sync...")

    // Fetch inventory from Clover
    const cloverItems = await fetchCloverInventory()

    console.log("[v0] Fetched", cloverItems.length, "items from Clover")

    let syncedCount = 0
    let errorCount = 0

    // Sync each item to Supabase
    for (const item of cloverItems) {
      try {
        // Check if product already exists
        const { data: existingProduct } = await supabase.from("products").select("id").eq("clover_id", item.id).single()

        const productData = {
          name: item.name,
          description: item.description || "",
          price: item.price / 100, // Convert from cents
          category: item.categories?.[0]?.name?.toLowerCase() || "grocery",
          stock_quantity: item.stockCount || 0,
          clover_id: item.id,
          is_available: true,
          last_synced_at: new Date().toISOString(),
        }

        if (existingProduct) {
          // Update existing product
          const { error } = await supabase.from("products").update(productData).eq("id", existingProduct.id)
          if (error) throw error
          console.log("[v0] Updated product:", item.name)
        } else {
          // Insert new product
          const { error } = await supabase.from("products").insert(productData)
          if (error) throw error
          console.log("[v0] Created new product:", item.name)
        }

        syncedCount++
      } catch (error) {
        console.error(`[v0] Error syncing item ${item.id}:`, error)
        errorCount++
      }
    }

    console.log("[v0] Sync complete:", syncedCount, "synced,", errorCount, "errors")

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} items from Clover`,
      syncedCount,
      errorCount,
    })
  } catch (error) {
    console.error("[v0] Error syncing Clover inventory:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sync inventory",
      },
      { status: 500 },
    )
  }
}
