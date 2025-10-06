import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { searchProducts, searchShoppingList } from "@/lib/saint-athena-search"
import type { Product } from "@/lib/saint-athena-search"

// Simple in-memory cache (60 seconds TTL)
const searchCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 60 seconds

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 60 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

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

function getCached(key: string): any | null {
  const cached = searchCache.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    searchCache.delete(key)
    return null
  }

  return cached.data
}

function setCache(key: string, data: any): void {
  searchCache.set(key, { data, timestamp: Date.now() })
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
    const { query, mode = "single", options = {} } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 })
    }

    // Check cache
    const cacheKey = `${mode}:${query}:${JSON.stringify(options)}`
    const cached = getCached(cacheKey)
    if (cached) {
      console.log(`[SaintAthena] Cache hit for query: "${query}"`)
      return NextResponse.json({ ...cached, cached: true })
    }

    // Fetch products from Supabase
    const supabase = await createClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)

    if (error) {
      console.error("[SaintAthena] Database error:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    const typedProducts = products as Product[]

    let results: any

    if (mode === "list") {
      // Shopping list mode
      const listResults = searchShoppingList(typedProducts, query)
      results = {
        mode: "list",
        query,
        items: Array.from(listResults.entries()).map(([item, matches]) => ({
          query: item,
          matches: matches.slice(0, 3), // Top 3 matches per item
          bestMatch: matches[0] || null,
        })),
        totalItems: listResults.size,
      }
    } else {
      // Single search mode
      const matches = searchProducts(typedProducts, query, {
        minScore: options.minScore || 40,
        limit: options.limit || 10,
        includeOutOfStock: options.includeOutOfStock || false,
      })

      results = {
        mode: "single",
        query,
        matches,
        count: matches.length,
      }
    }

    // Cache the results
    setCache(cacheKey, results)

    // Log interaction for analytics
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("saint_athena_interactions").insert({
        user_id: user?.id || null,
        interaction_type: "search",
        query_text: query,
        products_found: mode === "list" ? results.items.length : results.count,
        response_time_ms: 0, // Will be calculated on client
      })
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      console.error("[SaintAthena] Analytics error:", analyticsError)
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("[SaintAthena] Search API error:", error)
    return NextResponse.json(
      { error: "An error occurred while searching. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    service: "SaintAthena Search API",
    version: "1.0.0",
    features: ["single-search", "shopping-list", "fuzzy-matching", "multi-language"],
  })
}
