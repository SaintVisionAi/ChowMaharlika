import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getProductImage, findProductImage } from "@/lib/product-images"

/**
 * Batch update product images
 * Fetches images from Clover API or uses intelligent fallbacks
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, clover_id, name, category, image_url")
    
    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`)
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No products to update",
        updated: 0 
      })
    }

    console.log(`[Image Update] Processing ${products.length} products...`)

    let updated = 0
    let errors = 0

    // Process products in batches of 10
    const batchSize = 10
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (product) => {
          try {
            // Skip if product already has an image
            if (product.image_url) {
              console.log(`[Image Update] Skipping ${product.name} - already has image`)
              return
            }

            // Get appropriate image
            const imageUrl = product.clover_id 
              ? await getProductImage(product)
              : findProductImage(product.name, product.category)

            // Update product in database
            const { error: updateError } = await supabase
              .from("products")
              .update({ image_url: imageUrl })
              .eq("id", product.id)

            if (updateError) {
              console.error(`[Image Update] Failed to update ${product.name}:`, updateError)
              errors++
            } else {
              console.log(`[Image Update] Updated ${product.name} with image`)
              updated++
            }
          } catch (error) {
            console.error(`[Image Update] Error processing ${product.name}:`, error)
            errors++
          }
        })
      )

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} product images${errors > 0 ? ` (${errors} errors)` : ""}`,
      updated,
      errors,
      total: products.length,
    })
  } catch (error) {
    console.error("[Image Update] Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update images",
      },
      { status: 500 }
    )
  }
}

/**
 * Force update all images (replaces existing)
 */
export async function PUT() {
  try {
    const supabase = await createClient()

    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, clover_id, name, category, image_url")
    
    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`)
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No products to update",
        updated: 0 
      })
    }

    console.log(`[Image Force Update] Processing ${products.length} products...`)

    let updated = 0
    let errors = 0

    // Process all products
    for (const product of products) {
      try {
        // Get appropriate image (force refresh)
        const imageUrl = product.clover_id 
          ? await getProductImage(product)
          : findProductImage(product.name, product.category)

        // Update product in database
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: imageUrl })
          .eq("id", product.id)

        if (updateError) {
          console.error(`[Image Force Update] Failed to update ${product.name}:`, updateError)
          errors++
        } else {
          console.log(`[Image Force Update] Updated ${product.name}`)
          updated++
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.error(`[Image Force Update] Error processing ${product.name}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Force updated ${updated} product images${errors > 0 ? ` (${errors} errors)` : ""}`,
      updated,
      errors,
      total: products.length,
    })
  } catch (error) {
    console.error("[Image Force Update] Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update images",
      },
      { status: 500 }
    )
  }
}
