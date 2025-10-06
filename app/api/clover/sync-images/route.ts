import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchCloverInventory, fetchCloverItemImage } from "@/lib/clover"

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

    console.log("[v0] Starting Clover product image sync...")

    // Fetch all products from Clover with images
    const cloverItems = await fetchCloverInventory()
    console.log(`[v0] Fetched ${cloverItems.length} items from Clover`)

    let updatedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process in batches to avoid overwhelming the API
    const BATCH_SIZE = 10
    for (let i = 0; i < cloverItems.length; i += BATCH_SIZE) {
      const batch = cloverItems.slice(i, i + BATCH_SIZE)
      
      await Promise.all(
        batch.map(async (item) => {
          try {
            // Fetch the image URL for this item
            const imageUrl = await fetchCloverItemImage(item.id)
            
            if (!imageUrl) {
              console.log(`[v0] No image found for item: ${item.name} (${item.id})`)
              return
            }

            // Update the product in Supabase
            const { error: updateError } = await supabase
              .from("products")
              .update({ image_url: imageUrl })
              .eq("clover_id", item.id)

            if (updateError) {
              console.error(`[v0] Error updating product ${item.id}:`, updateError)
              errors.push(`${item.name}: ${updateError.message}`)
              errorCount++
            } else {
              console.log(`[v0] Updated image for: ${item.name}`)
              updatedCount++
            }
          } catch (error) {
            console.error(`[v0] Error processing item ${item.id}:`, error)
            errors.push(`${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            errorCount++
          }
        })
      )

      // Small delay between batches to respect API rate limits
      if (i + BATCH_SIZE < cloverItems.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`[v0] Image sync complete. Updated: ${updatedCount}, Errors: ${errorCount}`)

    return NextResponse.json({
      success: true,
      message: "Product images synced successfully",
      stats: {
        total: cloverItems.length,
        updated: updatedCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 10), // Return first 10 errors only
      },
    })
  } catch (error) {
    console.error("[v0] Error syncing product images:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sync product images",
      },
      { status: 500 }
    )
  }
}
