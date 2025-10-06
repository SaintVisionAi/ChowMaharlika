import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { bulkGenerateProductImages } from "@/lib/product-image-generator"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { method = 'unsplash', batchSize = 10, limit = 100 } = body

    console.log(`[API] Starting image generation with method: ${method}`)

    const result = await bulkGenerateProductImages({
      method,
      batchSize,
      delay: 1000, // 1 second between batches for API rate limits
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Error generating images:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate images",
      },
      { status: 500 }
    )
  }
}
