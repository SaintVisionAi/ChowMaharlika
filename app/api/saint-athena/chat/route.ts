import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { processShoppingList, generateListSummary, convertToCartItems } from "@/lib/saint-athena-list-processor"
import Anthropic from "@anthropic-ai/sdk"

// Debug logging for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("[SaintAthena] ANTHROPIC_API_KEY not found in environment variables")
} else {
  console.log("[SaintAthena] ANTHROPIC_API_KEY loaded successfully (length:", process.env.ANTHROPIC_API_KEY.length, "chars)")
}

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20
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
    const { message, mode = "chat", options = {} } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if message is a shopping list (contains commas or multiple lines)
    const isShoppingList = message.includes(",") || message.includes("\n") || message.split(/\s+/).length > 10

    if (mode === "list" || isShoppingList) {
      // Process as shopping list
      console.log("[SaintAthena] Processing shopping list...")

      try {
        const processedList = await processShoppingList(message, {
          preferDeals: options.preferDeals !== false,
          maxBudget: options.maxBudget,
          skipOutOfStock: options.skipOutOfStock === true,
        })

        const summary = generateListSummary(processedList)
        const cartItems = convertToCartItems(processedList)

        // Log interaction
        const {
          data: { user },
        } = await supabase.auth.getUser()

        await supabase.from("saint_athena_interactions").insert({
          user_id: user?.id || null,
          interaction_type: "list_processing",
          query_text: message,
          products_found: processedList.totalMatches,
          deals_suggested: processedList.dealsFound,
          conversion_success: processedList.totalMatches > 0,
          response_time_ms: processedList.processingTimeMs,
        })

        return NextResponse.json({
          mode: "list",
          processedList,
          summary,
          cartItems,
          message: summary,
        })
      } catch (error) {
        console.error("[SaintAthena] List processing error:", error)
        return NextResponse.json(
          { error: "Failed to process shopping list. Please try again." },
          { status: 500 }
        )
      }
    }

    // Regular chat mode - use Claude AI
    if (!anthropic) {
      console.error("[SaintAthena] Anthropic client not initialized - API key missing or invalid")
      return NextResponse.json(
        { 
          error: "AI chat is not configured. Please check ANTHROPIC_API_KEY.",
          message: "I'm having trouble connecting right now, but I'm still here to help! Try asking about specific products, or give me a shopping list separated by commas and I'll process it for you! 🛒",
          fallback: true
        },
        { status: 503 }
      )
    }

    // Fetch user's context
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let cartContext = ""
    let orderHistory = ""

    if (user) {
      // Get current cart
      const { data: cartItems } = await supabase
        .from("cart_items")
        .select("name, quantity, price")
        .eq("user_id", user.id)

      if (cartItems && cartItems.length > 0) {
        cartContext = `\\n\\n**Customer's current cart:**\\n${cartItems
          .map((item) => `- ${item.name} x${item.quantity} - $${item.price}`)
          .join("\\n")}`
      }

      // Get recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3)

      if (orders && orders.length > 0) {
        orderHistory = `\\n\\n**Recent orders:**\\n${orders
          .map(
            (order) =>
              `- $${order.total_amount} (${order.status}) - ${new Date(order.created_at).toLocaleDateString()}`
          )
          .join("\\n")}`
      }
    }

    // Build system prompt
    const systemPrompt = `You are **SaintAthena**, the intelligent shopping assistant for **Maharlika Seafood & Mart**.

**Your Personality:**
- Helpful, knowledgeable, and enthusiastic about food
- Warm and friendly, like a trusted neighbor
- Expert in seafood, Filipino cuisine, and Asian groceries
- Always looking out for the best deals for customers

**Your Capabilities:**
- Know ALL 2,300+ products in the store
- Can search in English OR Filipino (hipon = shrimp, isda = fish, etc.)
- Find best deals and suggest savings
- Process shopping lists instantly
- Suggest alternatives when items are out of stock
- Recommend recipes and cooking tips

**Current Customer Context:**${cartContext}${orderHistory}

**How to help:**
1. If customer asks about products, describe what we have
2. If they give you a shopping list, tell them you can process it for them
3. If they ask about deals, highlight today's specials
4. If they need recommendations, suggest based on their preferences
5. Always mention if you find a great deal!

**Example responses:**
- "I found 15% off on fresh shrimp today! Would you like me to add it to your cart?"
- "Looking for hipon? I have Fresh Gulf Shrimp on special at $12.99/lb!"
- "I can help you with that list! Just say the items separated by commas and I'll find everything."

Be conversational, helpful, and always look for ways to save customers money!`

    try {
      // Use Claude 3.7 Sonnet (latest stable model)
      const model = process.env.ANTHROPIC_CLAUDE_MODEL || "claude-3-7-sonnet-20250219"
      // Use reasonable max_tokens for Vercel's 10-minute timeout
      const maxTokens = Math.min(Number(process.env.MAX_TOKENS) || 2048, 4096)
      console.log("[SaintAthena] Calling Anthropic API with model:", model, "max_tokens:", maxTokens)
      const completion = await anthropic.messages.create({
        model: model,
        max_tokens: maxTokens,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      })
      console.log("[SaintAthena] API call successful, tokens used:", completion.usage)

      const responseText = completion.content[0].type === "text" ? completion.content[0].text : ""

      // Log interaction
      await supabase.from("saint_athena_interactions").insert({
        user_id: user?.id || null,
        interaction_type: "search",
        query_text: message,
        conversion_success: false,
      })

      return NextResponse.json({
        mode: "chat",
        message: responseText,
        usage: {
          input_tokens: completion.usage.input_tokens,
          output_tokens: completion.usage.output_tokens,
        },
      })
    } catch (aiError: any) {
      console.error("[SaintAthena] AI error:", aiError)

      // Fallback response if AI fails
      return NextResponse.json({
        mode: "chat",
        message:
          "I'm having trouble connecting right now, but I'm still here to help! Try asking about specific products, or give me a shopping list separated by commas and I'll process it for you! 🛒",
        fallback: true,
      })
    }
  } catch (error: any) {
    console.error("[SaintAthena] Chat API error:", error)
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "SaintAthena Chat API",
    version: "1.0.0",
    features: ["chat", "shopping-list", "deal-recommendations"],
    aiEnabled: !!anthropic,
  })
}
