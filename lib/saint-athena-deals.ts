/**
 * SaintAthena Deals Library
 * Find best prices, bulk savings, and smart deal recommendations
 */

import type { Product } from "./saint-athena-search"

export interface Deal {
  product: Product
  savingsAmount: number
  savingsPercentage: number
  dealType: "sale" | "bulk" | "daily_special" | "best_price"
  dealReason: string
  effectivePrice: number
}

export interface BulkSavings {
  product: Product
  regularPrice: number
  bulkPrice: number
  bulkQuantity: number
  savingsPerUnit: number
  totalSavings: number
  recommendedQuantity: number
}

export interface PriceComparison {
  category: string
  products: Array<{
    product: Product
    pricePerUnit: number
    isLowest: boolean
    savingsVsHighest: number
  }>
  lowestPrice: number
  highestPrice: number
  averagePrice: number
}

/**
 * Get all active deals for a product
 */
export function getProductDeals(product: Product): Deal[] {
  const deals: Deal[] = []

  // On-sale deal
  if (product.on_sale && product.sale_price && product.sale_price < product.price) {
    const savings = product.price - product.sale_price
    const percentage = Math.round((savings / product.price) * 100)

    deals.push({
      product,
      savingsAmount: savings,
      savingsPercentage: percentage,
      dealType: "sale",
      dealReason: `${percentage}% OFF - Save $${savings.toFixed(2)}!`,
      effectivePrice: product.sale_price,
    })
  }

  // Bulk deal
  if (product.bulk_price && product.bulk_quantity && product.bulk_price < product.price) {
    const unitSavings = product.price - product.bulk_price
    const percentage = Math.round((unitSavings / product.price) * 100)

    deals.push({
      product,
      savingsAmount: unitSavings * product.bulk_quantity,
      savingsPercentage: percentage,
      dealType: "bulk",
      dealReason: `Buy ${product.bulk_quantity}+ for $${product.bulk_price.toFixed(2)} each (${percentage}% off)`,
      effectivePrice: product.bulk_price,
    })
  }

  // Daily special
  if (product.daily_special) {
    deals.push({
      product,
      savingsAmount: 0,
      savingsPercentage: 0,
      dealType: "daily_special",
      dealReason: "🌟 Today's Special - Fresh & Featured!",
      effectivePrice: product.sale_price ?? product.price,
    })
  }

  // Best deal flag
  if (product.best_deal) {
    deals.push({
      product,
      savingsAmount: 0,
      savingsPercentage: 0,
      dealType: "best_price",
      dealReason: "✨ Best Price Guarantee - Lowest in category!",
      effectivePrice: product.sale_price ?? product.price,
    })
  }

  return deals
}

/**
 * Find best deals across all products
 */
export function findBestDeals(products: Product[], limit: number = 10): Deal[] {
  const allDeals: Deal[] = []

  for (const product of products) {
    if (!product.is_available || product.stock_quantity <= 0) continue

    const deals = getProductDeals(product)
    allDeals.push(...deals)
  }

  // Sort by savings percentage, then by absolute savings
  return allDeals
    .sort((a, b) => {
      if (Math.abs(a.savingsPercentage - b.savingsPercentage) > 5) {
        return b.savingsPercentage - a.savingsPercentage
      }
      return b.savingsAmount - a.savingsAmount
    })
    .slice(0, limit)
}

/**
 * Calculate bulk savings for a product
 */
export function calculateBulkSavings(
  product: Product,
  desiredQuantity: number
): BulkSavings | null {
  if (!product.bulk_price || !product.bulk_quantity) {
    return null
  }

  if (desiredQuantity < product.bulk_quantity) {
    // Show what they COULD save if they bought more
    const savingsPerUnit = product.price - product.bulk_price
    const totalSavings = savingsPerUnit * product.bulk_quantity

    return {
      product,
      regularPrice: product.price * product.bulk_quantity,
      bulkPrice: product.bulk_price * product.bulk_quantity,
      bulkQuantity: product.bulk_quantity,
      savingsPerUnit,
      totalSavings,
      recommendedQuantity: product.bulk_quantity,
    }
  }

  // They're buying enough for bulk pricing
  const savingsPerUnit = product.price - product.bulk_price
  const totalSavings = savingsPerUnit * desiredQuantity

  return {
    product,
    regularPrice: product.price * desiredQuantity,
    bulkPrice: product.bulk_price * desiredQuantity,
    bulkQuantity: product.bulk_quantity,
    savingsPerUnit,
    totalSavings,
    recommendedQuantity: desiredQuantity,
  }
}

/**
 * Compare prices within a category to find best value
 */
export function comparePricesInCategory(
  products: Product[],
  category: string
): PriceComparison | null {
  const categoryProducts = products.filter(
    (p) => p.category === category && p.is_available && p.stock_quantity > 0
  )

  if (categoryProducts.length === 0) {
    return null
  }

  const productsWithPrice = categoryProducts.map((product) => {
    const effectivePrice = product.sale_price ?? product.price
    return {
      product,
      pricePerUnit: effectivePrice,
      isLowest: false,
      savingsVsHighest: 0,
    }
  })

  const prices = productsWithPrice.map((p) => p.pricePerUnit)
  const lowestPrice = Math.min(...prices)
  const highestPrice = Math.max(...prices)
  const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length

  // Mark lowest price products and calculate savings
  productsWithPrice.forEach((item) => {
    item.isLowest = item.pricePerUnit === lowestPrice
    item.savingsVsHighest = highestPrice - item.pricePerUnit
  })

  // Sort by price ascending
  productsWithPrice.sort((a, b) => a.pricePerUnit - b.pricePerUnit)

  return {
    category,
    products: productsWithPrice,
    lowestPrice,
    highestPrice,
    averagePrice,
  }
}

/**
 * Recommend best value products across categories
 */
export function recommendBestValue(
  products: Product[],
  categories?: string[]
): Array<{ product: Product; valueReason: string; score: number }> {
  const recommendations: Array<{ product: Product; valueReason: string; score: number }> = []

  const targetCategories = categories ?? Array.from(new Set(products.map((p) => p.category)))

  for (const category of targetCategories) {
    const comparison = comparePricesInCategory(products, category)
    if (!comparison) continue

    // Find products that are:
    // 1. Below average price
    // 2. Have good stock
    // 3. Are on sale or best deals
    for (const item of comparison.products) {
      if (item.pricePerUnit <= comparison.averagePrice) {
        let score = 50 // Base score

        // Score adjustments
        if (item.isLowest) score += 30
        if (item.product.on_sale) score += 15
        if (item.product.best_deal) score += 20
        if (item.product.daily_special) score += 10
        if (item.product.stock_quantity > 20) score += 5

        // Below average boost
        const percentBelowAverage =
          ((comparison.averagePrice - item.pricePerUnit) / comparison.averagePrice) * 100
        score += Math.min(20, percentBelowAverage)

        let valueReason = ""
        if (item.isLowest) {
          valueReason = `Lowest price in ${category}! `
        } else if (item.pricePerUnit < comparison.averagePrice) {
          const savings = comparison.averagePrice - item.pricePerUnit
          valueReason = `$${savings.toFixed(2)} below average ${category} price. `
        }

        if (item.product.on_sale && item.product.sale_price) {
          const discount = Math.round(
            ((item.product.price - item.product.sale_price) / item.product.price) * 100
          )
          valueReason += `${discount}% off! `
        }

        if (item.product.best_deal) {
          valueReason += "Best deal guaranteed. "
        }

        recommendations.push({
          product: item.product,
          valueReason: valueReason.trim() || "Great value for quality!",
          score,
        })
      }
    }
  }

  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score)
}

/**
 * Optimize shopping cart for best deals
 * Suggests swapping items for better deals or bulk purchases
 */
export interface CartOptimization {
  currentTotal: number
  optimizedTotal: number
  savings: number
  suggestions: Array<{
    type: "swap" | "bulk" | "remove_duplicate"
    currentProduct?: Product
    suggestedProduct?: Product
    reason: string
    savings: number
  }>
}

export function optimizeCart(
  cartItems: Array<{ product: Product; quantity: number }>,
  allProducts: Product[]
): CartOptimization {
  const suggestions: CartOptimization["suggestions"] = []
  let currentTotal = 0
  let optimizedTotal = 0

  for (const item of cartItems) {
    const itemTotal = (item.product.sale_price ?? item.product.price) * item.quantity
    currentTotal += itemTotal
    optimizedTotal += itemTotal

    // Check for bulk savings
    const bulkSavings = calculateBulkSavings(item.product, item.quantity)
    if (
      bulkSavings &&
      item.quantity >= bulkSavings.bulkQuantity &&
      bulkSavings.totalSavings > 0
    ) {
      suggestions.push({
        type: "bulk",
        currentProduct: item.product,
        reason: `Buy ${bulkSavings.bulkQuantity}+ to save $${bulkSavings.totalSavings.toFixed(2)}`,
        savings: bulkSavings.totalSavings,
      })
      optimizedTotal -= bulkSavings.totalSavings
    }

    // Check for better deals in same category
    const comparison = comparePricesInCategory(allProducts, item.product.category)
    if (comparison && comparison.products.length > 1) {
      const currentPrice = item.product.sale_price ?? item.product.price
      const cheapestOption = comparison.products[0]

      if (
        cheapestOption.product.id !== item.product.id &&
        cheapestOption.pricePerUnit < currentPrice
      ) {
        const savings = (currentPrice - cheapestOption.pricePerUnit) * item.quantity
        if (savings > 0.5) {
          // Only suggest if saving more than 50 cents
          suggestions.push({
            type: "swap",
            currentProduct: item.product,
            suggestedProduct: cheapestOption.product,
            reason: `Switch to ${cheapestOption.product.name} to save $${savings.toFixed(2)}`,
            savings,
          })
          optimizedTotal -= savings
        }
      }
    }
  }

  return {
    currentTotal,
    optimizedTotal,
    savings: currentTotal - optimizedTotal,
    suggestions: suggestions.sort((a, b) => b.savings - a.savings),
  }
}

/**
 * Get personalized deal recommendations based on cart history
 */
export function getPersonalizedDeals(
  products: Product[],
  userCartHistory: string[] // Array of category names from past purchases
): Deal[] {
  const recommendations: Deal[] = []
  const categoryFrequency = new Map<string, number>()

  // Count category frequency in history
  userCartHistory.forEach((cat) => {
    categoryFrequency.set(cat, (categoryFrequency.get(cat) || 0) + 1)
  })

  // Get all deals
  const allDeals = findBestDeals(products, 50)

  // Prioritize deals from frequently purchased categories
  allDeals.forEach((deal) => {
    const frequency = categoryFrequency.get(deal.product.category) || 0
    const priorityScore = deal.savingsPercentage + frequency * 10

    recommendations.push({
      ...deal,
      savingsPercentage: priorityScore, // Temporarily use this for sorting
    })
  })

  // Sort and restore original percentage
  return recommendations
    .sort((a, b) => b.savingsPercentage - a.savingsPercentage)
    .slice(0, 10)
    .map((deal) => ({
      ...deal,
      savingsPercentage: getProductDeals(deal.product)[0]?.savingsPercentage || 0,
    }))
}
