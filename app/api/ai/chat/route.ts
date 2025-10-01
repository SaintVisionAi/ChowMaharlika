import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

// Simple cache for product inventory (60s TTL)
let productCache: { data: any[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
}
const CACHE_TTL = 60 * 1000 // 60 seconds

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

// Build system prompt with dynamic context
async function buildSystemPrompt(userId?: string) {
  const supabase = await createClient()

  // Fetch or use cached products
  const now = Date.now()
  let products = productCache.data

  if (!products || now - productCache.timestamp > CACHE_TTL) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, category, stock_quantity, is_available")
      .eq("is_available", true)
      .order("category", { ascending: true })

    if (!error && data) {
      products = data
      productCache = { data, timestamp: now }
    }
  }

  // Fetch user cart if authenticated
  let cartItems: any[] = []
  let recentOrders: any[] = []

  if (userId) {
    const { data: cart } = await supabase
      .from("cart_items")
      .select("id, product_id, name, quantity, price, category")
      .eq("user_id", userId)

    if (cart) cartItems = cart

    const { data: orders } = await supabase
      .from("orders")
      .select("id, total_amount, status, delivery_method, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (orders) recentOrders = orders
  }

  // Compose system prompt
  const productList =
    products
      ?.map(
        (p) =>
          `- ${p.name} (${p.category}) - $${p.price} - ${p.description || "Premium quality"} - Stock: ${p.stock_quantity}`
      )
      .join("\n") || "No products available at the moment."

  const cartSummary =
    cartItems.length > 0
      ? `\n\n**Customer's Current Cart:**\n${cartItems
          .map((item) => `- ${item.name} (${item.category}) x${item.quantity} - $${item.price}`)
          .join("\n")}`
      : ""

  const orderHistory =
    recentOrders.length > 0
      ? `\n\n**Recent Orders:**\n${recentOrders
          .map((order) => `- Order #${order.id.slice(0, 8)} - $${order.total_amount} - ${order.status} - ${order.delivery_method || "pickup"}`)
          .join("\n")}`
      : ""

  return `You are **SaintChow**, the friendly and knowledgeable AI assistant for **Maharlika Seafood & Mart**, a premium seafood and grocery store.

**Your Role:**
- Help customers discover fresh, high-quality seafood and grocery products
- Provide cooking tips, preparation advice, and recipe suggestions
- Recommend products based on customer needs and preferences
- Answer questions about product freshness, origin, and sustainability
- Assist with order placement and cart management
- Be warm, professional, and enthusiastic about seafood and cooking

**Store Inventory (Current Available Products):**
${productList}
${cartSummary}
${orderHistory}

**Guidelines:**
1. **Product Recommendations:** When suggesting products, format them as JSON blocks so the UI can render them as interactive cards:
   \`\`\`json
   {
     "type": "product_recommendations",
     "products": [
       {
         "id": "product-uuid",
         "name": "Product Name",
         "price": 24.99,
         "category": "seafood",
         "reason": "Perfect for grilling with a delicate flavor"
       }
     ]
   }
   \`\`\`

2. **Be Conversational:** Use a friendly, approachable tone. Ask follow-up questions to better understand customer needs.

3. **Expertise:** Share cooking tips, preparation methods, and pairing suggestions. If asked about specific seafood, mention freshness indicators and storage tips.

4. **Accuracy:** Only recommend products from the inventory above. If a product isn't available, suggest similar alternatives.

5. **Cart Awareness:** ${cartItems.length > 0 ? "The customer has items in their cart. Reference these when making suggestions." : "The customer's cart is empty. Help them get started!"}

6. **Personality:** You're enthusiastic about seafood, knowledgeable about cooking, and genuinely care about helping customers have a great meal.

**Example Interactions:**
- "What's good for grilling tonight?" → Recommend fresh fish with grilling tips
- "I need something quick and easy" → Suggest pre-prepared items or simple recipes
- "What pairs well with salmon?" → Suggest complementary products and sides
- "How do I know if seafood is fresh?" → Share freshness indicators and storage tips

Always prioritize customer satisfaction and food safety. If you're unsure about something, admit it honestly and offer to help find the answer.`
}

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const clientId = request.headers.get("x-forwarded-for") || "anonymous"

    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 })
    }

    // Parse request body
    const body = await request.json()
    const { messages, userId } = body

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Trim conversation to last 10 messages for performance
    const trimmedMessages = messages.slice(-10)

    // Build system prompt with dynamic context
    const systemPrompt = await buildSystemPrompt(userId)

    // Call Claude API with streaming
    const stream = await anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: trimmedMessages.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    })

    // Create a ReadableStream to pipe Claude's response to the client
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              const text = chunk.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("[v0] Streaming error:", error)
          controller.error(error)
        }
      },
    })

    // Return streaming response
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("[v0] AI Chat API Error:", error)

    if (error?.status === 429) {
      return NextResponse.json({ error: "AI service rate limit reached. Please try again shortly." }, { status: 429 })
    }

    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    )
  }
}

// Optional: Support GET for SSE preflight
export async function GET() {
  return NextResponse.json({ status: "AI Chat API is running" })
}
