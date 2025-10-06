/**
 * SaintAthena List Processor
 * Natural language shopping list parser with smart matching
 */

import { searchProducts, extractQuantity, type Product, type SearchResult } from "./saint-athena-search"
import { getProductDeals, findBestDeals, type Deal } from "./saint-athena-deals"
import { createClient } from "./supabase/client"

export interface ListItem {
  originalText: string
  quantity: number
  unit?: string
  cleanedQuery: string
}

export interface ProcessedListItem {
  originalText: string
  requestedQuantity: number
  requestedUnit?: string
  matches: SearchResult[]
  bestMatch?: SearchResult
  dealFound?: Deal
  replacement?: SearchResult
  outOfStock: boolean
  confidence: "high" | "medium" | "low"
  suggestions: string[]
}

export interface ProcessedList {
  items: ProcessedListItem[]
  totalMatches: number
  outOfStockCount: number
  dealsFound: number
  estimatedTotal: number
  processingTimeMs: number
}

/**
 * Parse a natural language shopping list into structured items
 */
export function parseShoppingList(listText: string): ListItem[] {
  const items: ListItem[] = []

  // Split by commas, semicolons, or newlines
  const lines = listText.split(/[,;\n]/).map((line) => line.trim()).filter((line) => line.length > 0)

  for (const line of lines) {
    const { quantity, unit, cleanQuery } = extractQuantity(line)

    items.push({
      originalText: line,
      quantity,
      unit,
      cleanedQuery: cleanQuery,
    })
  }

  return items
}

/**
 * Find best product match for a list item
 */
function findBestMatch(
  item: ListItem,
  products: Product[],
  allDeals: Deal[]
): {
  matches: SearchResult[]
  bestMatch?: SearchResult
  dealFound?: Deal
  replacement?: SearchResult
  outOfStock: boolean
  confidence: "high" | "medium" | "low"
  suggestions: string[]
} {
  // Search for matches
  const matches = searchProducts(products, item.cleanedQuery, {
    limit: 5,
    minScore: 30,
    includeOutOfStock: true,
  })

  if (matches.length === 0) {
    return {
      matches: [],
      outOfStock: false,
      confidence: "low",
      suggestions: [
        "Try searching with different keywords",
        "Check spelling",
        "Try Filipino name if you know it",
      ],
    }
  }

  // Best match is first result
  const bestMatch = matches[0]
  const isOutOfStock = !bestMatch.product.is_available || bestMatch.product.stock_quantity <= 0

  // Find if there's a deal on the best match
  const dealFound = allDeals.find((deal) => deal.product.id === bestMatch.product.id)

  // Find replacement if out of stock
  let replacement: SearchResult | undefined
  if (isOutOfStock && matches.length > 1) {
    // Find first in-stock alternative
    replacement = matches.find(
      (m) => m.product.is_available && m.product.stock_quantity > 0
    )
  }

  // Determine confidence level
  let confidence: "high" | "medium" | "low" = "medium"
  if (bestMatch.matchScore >= 80) {
    confidence = "high"
  } else if (bestMatch.matchScore < 50) {
    confidence = "low"
  }

  // Generate helpful suggestions
  const suggestions: string[] = []
  if (isOutOfStock && replacement) {
    suggestions.push(`"${replacement.product.name}" is available as alternative`)
  }
  if (dealFound) {
    suggestions.push(dealFound.dealReason)
  }
  if (bestMatch.product.bulk_price && item.quantity >= (bestMatch.product.bulk_quantity || 5)) {
    suggestions.push(`Bulk pricing available! Buy ${bestMatch.product.bulk_quantity}+ and save`)
  }
  if (matches.length > 1 && matches[1].matchScore > 70) {
    suggestions.push(`Also consider "${matches[1].product.name}"`)
  }

  return {
    matches,
    bestMatch,
    dealFound,
    replacement,
    outOfStock: isOutOfStock,
    confidence,
    suggestions,
  }
}

/**
 * Process an entire shopping list
 */
export async function processShoppingList(
  listText: string,
  options?: {
    preferDeals?: boolean
    maxBudget?: number
    skipOutOfStock?: boolean
  }
): Promise<ProcessedList> {
  const startTime = Date.now()
  const preferDeals = options?.preferDeals ?? true
  const skipOutOfStock = options?.skipOutOfStock ?? false

  // Fetch products from database
  const supabase = createClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)

  if (error || !products) {
    throw new Error("Failed to fetch products")
  }

  // Get all active deals
  const allDeals = findBestDeals(products, 50)

  // Parse the list
  const listItems = parseShoppingList(listText)

  // Process each item
  const processedItems: ProcessedListItem[] = []
  let totalMatches = 0
  let outOfStockCount = 0
  let dealsFound = 0
  let estimatedTotal = 0

  for (const item of listItems) {
    const result = findBestMatch(item, products, allDeals)

    // If preferring deals, check if a deal product is a close match
    let selectedMatch = result.bestMatch
    if (preferDeals && result.dealFound) {
      selectedMatch = result.bestMatch
    } else if (preferDeals && result.matches.length > 1) {
      // Look for deals in other matches
      for (const match of result.matches) {
        const hasDeal = allDeals.some((deal) => deal.product.id === match.product.id)
        if (hasDeal && match.matchScore >= result.bestMatch!.matchScore - 15) {
          selectedMatch = match
          result.dealFound = allDeals.find((d) => d.product.id === match.product.id)
          break
        }
      }
    }

    // Skip if out of stock and option is set
    if (skipOutOfStock && result.outOfStock && !result.replacement) {
      continue
    }

    // Calculate estimated cost
    const productToUse = result.outOfStock && result.replacement
      ? result.replacement.product
      : selectedMatch?.product

    if (productToUse) {
      const price = productToUse.sale_price ?? productToUse.price
      estimatedTotal += price * item.quantity
    }

    processedItems.push({
      originalText: item.originalText,
      requestedQuantity: item.quantity,
      requestedUnit: item.unit,
      matches: result.matches,
      bestMatch: selectedMatch,
      dealFound: result.dealFound,
      replacement: result.replacement,
      outOfStock: result.outOfStock,
      confidence: result.confidence,
      suggestions: result.suggestions,
    })

    if (result.bestMatch) totalMatches++
    if (result.outOfStock) outOfStockCount++
    if (result.dealFound) dealsFound++
  }

  // Check budget constraint
  if (options?.maxBudget && estimatedTotal > options.maxBudget) {
    // Try to find cheaper alternatives
    processedItems.forEach((item) => {
      if (item.matches.length > 1) {
        for (const alt of item.matches) {
          const altPrice = (alt.product.sale_price ?? alt.product.price) * item.requestedQuantity
          const currentPrice = (item.bestMatch!.product.sale_price ?? item.bestMatch!.product.price) * item.requestedQuantity
          
          if (altPrice < currentPrice && alt.product.is_available && alt.product.stock_quantity > 0) {
            const savings = currentPrice - altPrice
            item.suggestions.unshift(`Switch to "${alt.product.name}" to save $${savings.toFixed(2)} and stay within budget`)
            break
          }
        }
      }
    })
  }

  const processingTimeMs = Date.now() - startTime

  return {
    items: processedItems,
    totalMatches,
    outOfStockCount,
    dealsFound,
    estimatedTotal,
    processingTimeMs,
  }
}

/**
 * Generate a summary message for the processed list
 */
export function generateListSummary(processedList: ProcessedList): string {
  const {
    items,
    totalMatches,
    outOfStockCount,
    dealsFound,
    estimatedTotal,
  } = processedList

  let summary = `🛒 **Found ${totalMatches} of ${items.length} items**\n\n`

  // List items
  items.forEach((item, index) => {
    const number = index + 1
    if (item.bestMatch) {
      const product = item.outOfStock && item.replacement
        ? item.replacement.product
        : item.bestMatch.product

      const price = product.sale_price ?? product.price
      const itemTotal = price * item.requestedQuantity

      let line = `${number}. ✓ **${product.name}**`

      if (item.requestedQuantity > 1) {
        line += ` (${item.requestedQuantity}x)`
      }

      line += ` - $${itemTotal.toFixed(2)}`

      if (item.dealFound) {
        line += ` 🔥 *${item.dealFound.dealReason}*`
      }

      if (item.outOfStock && item.replacement) {
        line += `\n   ⚠️ Original item out of stock, showing alternative`
      }

      summary += line + "\n"
    } else {
      summary += `${number}. ❌ "${item.originalText}" - Not found\n`
    }
  })

  summary += `\n**Estimated Total: $${estimatedTotal.toFixed(2)}**\n`

  if (dealsFound > 0) {
    summary += `\n💰 ${dealsFound} deal${dealsFound > 1 ? "s" : ""} found!\n`
  }

  if (outOfStockCount > 0) {
    summary += `\n⚠️ ${outOfStockCount} item${outOfStockCount > 1 ? "s" : ""} out of stock (alternatives suggested)\n`
  }

  return summary
}

/**
 * Convert processed list to cart-ready format
 */
export function convertToCartItems(processedList: ProcessedList): Array<{
  product_id: string
  name: string
  price: number
  quantity: number
  category: string
}> {
  const cartItems: Array<{
    product_id: string
    name: string
    price: number
    quantity: number
    category: string
  }> = []

  for (const item of processedList.items) {
    const product = item.outOfStock && item.replacement
      ? item.replacement.product
      : item.bestMatch?.product

    if (product && product.is_available && product.stock_quantity > 0) {
      cartItems.push({
        product_id: product.id,
        name: product.name,
        price: product.sale_price ?? product.price,
        quantity: item.requestedQuantity,
        category: product.category,
      })
    }
  }

  return cartItems
}
