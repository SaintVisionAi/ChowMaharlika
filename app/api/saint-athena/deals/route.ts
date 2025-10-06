import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { findBestDeals, recommendBestValue, optimizeCart } from "@/lib/saint-athena-deals"
import type { Product } from "@/lib/saint-athena-search"

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW = 60 * 1000

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get("x-forwarded-for") || "anonymous"
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a minute." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { action, ...params } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    // Fetch products
    const supabase = await createClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)

    if (error || !products) {
      console.error("[SaintAthena] Database error:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    const typedProducts = products as Product[]

    let results: any

    switch (action) {
      case "best_deals":
        // Get top deals across all categories
        const limit = params.limit || 10
        const deals = findBestDeals(typedProducts, limit)
        results = {
          action: "best_deals",
          deals,
          count: deals.length,
        }
        break

      case "best_value":
        // Get best value products by category
        const categories = params.categories || undefined
        const recommendations = recommendBestValue(typedProducts, categories)
        results = {
          action: "best_value",
          recommendations: recommendations.slice(0, params.limit || 20),
          count: recommendations.length,
        }
        break

      case "optimize_cart":
        // Optimize shopping cart for best deals
        if (!params.cartItems || !Array.isArray(params.cartItems)) {
          return NextResponse.json(
            { error: "cartItems array is required for optimize_cart action" },
            { status: 400 }
          )
        }

        const optimization = optimizeCart(params.cartItems, typedProducts)
        results = {
          action: "optimize_cart",
          ...optimization,
        }
        break

      case "daily_specials":
        // Get today's specials using the database function
        const { data: specials, error: specialsError } = await supabase.rpc("get_daily_specials")

        if (specialsError) {
          console.error("[SaintAthena] Daily specials error:", specialsError)
          return NextResponse.json({ error: "Failed to fetch daily specials" }, { status: 500 })
        }

        results = {
          action: "daily_specials",
          specials: specials || [],
          count: specials?.length || 0,
        }
        break

      case "category_deals":
        // Get best deals for a specific category
        const category = params.category
        if (!category) {
          return NextResponse.json(
            { error: "category is required for category_deals action" },
            { status: 400 }
          )
        }

        const { data: categoryDeals, error: categoryError } = await supabase.rpc(
          "get_best_deals_by_category",
          { category_filter: category }
        )

        if (categoryError) {
          console.error("[SaintAthena] Category deals error:", categoryError)
          return NextResponse.json({ error: "Failed to fetch category deals" }, { status: 500 })
        }

        results = {
          action: "category_deals",
          category,
          deals: categoryDeals || [],
          count: categoryDeals?.length || 0,
        }
        break

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    // Log interaction
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("saint_athena_interactions").insert({
        user_id: user?.id || null,
        interaction_type: "deal_recommendation",
        query_text: action,
        deals_suggested: results.count || results.deals?.length || 0,
      })
    } catch (analyticsError) {
      console.error("[SaintAthena] Analytics error:", analyticsError)
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("[SaintAthena] Deals API error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching deals. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "SaintAthena Deals API",
    version: "1.0.0",
    actions: [
      "best_deals",
      "best_value",
      "optimize_cart",
      "daily_specials",
      "category_deals",
    ],
  })
}
