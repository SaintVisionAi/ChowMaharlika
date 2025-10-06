/**
 * SaintAthena Search Library
 * Fuzzy search with multi-language support (English, Filipino)
 */

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  sale_price?: number
  category: string
  stock_quantity: number
  is_available: boolean
  search_keywords?: string[]
  alternative_names?: string[]
  on_sale?: boolean
  best_deal?: boolean
  daily_special?: boolean
}

export interface SearchResult {
  product: Product
  matchScore: number
  matchedOn: string[] // What fields matched
  relevanceReason: string
}

/**
 * Fuzzy string matching using Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Calculate similarity score (0-100) between two strings
 */
function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  const maxLength = Math.max(str1.length, str2.length)
  const similarity = (1 - distance / maxLength) * 100
  return Math.max(0, similarity)
}

/**
 * Extract quantity from search query
 * Examples: "2 lbs shrimp", "1kg salmon", "3 pieces crab"
 */
export function extractQuantity(query: string): { quantity: number; unit?: string; cleanQuery: string } {
  const quantityRegex = /(\d+(?:\.\d+)?)\s*(lbs?|kg|kilos?|pieces?|pcs?|oz|ounces?)?\s*/i
  const match = query.match(quantityRegex)

  if (match) {
    return {
      quantity: parseFloat(match[1]),
      unit: match[2]?.toLowerCase(),
      cleanQuery: query.replace(match[0], "").trim(),
    }
  }

  return {
    quantity: 1,
    cleanQuery: query.trim(),
  }
}

/**
 * Tokenize query into searchable terms
 */
function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2)
}

/**
 * Search products with multi-field matching
 */
export function searchProducts(products: Product[], query: string, options?: {
  minScore?: number
  limit?: number
  includeOutOfStock?: boolean
}): SearchResult[] {
  const minScore = options?.minScore ?? 40
  const limit = options?.limit ?? 20
  const includeOutOfStock = options?.includeOutOfStock ?? false

  const { cleanQuery } = extractQuantity(query)
  const queryTerms = tokenize(cleanQuery)

  const results: SearchResult[] = []

  for (const product of products) {
    if (!includeOutOfStock && (!product.is_available || product.stock_quantity <= 0)) {
      continue
    }

    const matchedOn: string[] = []
    let totalScore = 0
    let matches = 0

    // Check product name (highest weight)
    const nameScore = similarityScore(product.name, cleanQuery)
    if (nameScore > minScore) {
      totalScore += nameScore * 3
      matches++
      matchedOn.push("name")
    }

    // Check alternative names (Filipino/Asian names)
    if (product.alternative_names) {
      for (const altName of product.alternative_names) {
        const altScore = similarityScore(altName, cleanQuery)
        if (altScore > minScore) {
          totalScore += altScore * 2.5
          matches++
          matchedOn.push("alternative name")
          break
        }
      }
    }

    // Check search keywords
    if (product.search_keywords) {
      for (const keyword of product.search_keywords) {
        for (const term of queryTerms) {
          const keywordScore = similarityScore(keyword, term)
          if (keywordScore > minScore) {
            totalScore += keywordScore
            matches++
            matchedOn.push("keyword")
          }
        }
      }
    }

    // Check category
    const categoryScore = similarityScore(product.category, cleanQuery)
    if (categoryScore > minScore) {
      totalScore += categoryScore * 1.5
      matches++
      matchedOn.push("category")
    }

    // Check description
    if (product.description) {
      const descScore = similarityScore(product.description, cleanQuery)
      if (descScore > minScore) {
        totalScore += descScore * 0.5
        matches++
        matchedOn.push("description")
      }
    }

    // Calculate final match score
    if (matches > 0) {
      const matchScore = Math.min(100, totalScore / matches)

      // Boost score for special deals
      let boost = 0
      if (product.on_sale) boost += 5
      if (product.best_deal) boost += 10
      if (product.daily_special) boost += 8

      const finalScore = Math.min(100, matchScore + boost)

      // Generate relevance reason
      let relevanceReason = ""
      if (product.best_deal) {
        relevanceReason = "Best deal! "
      }
      if (product.on_sale && product.sale_price) {
        const discount = Math.round(((product.price - product.sale_price) / product.price) * 100)
        relevanceReason += `${discount}% off! `
      }
      if (matchedOn.includes("alternative name")) {
        relevanceReason += "Filipino name matched. "
      }
      if (product.stock_quantity < 10 && product.stock_quantity > 0) {
        relevanceReason += `Only ${product.stock_quantity} left! `
      }
      if (!relevanceReason) {
        relevanceReason = "Great match for your search"
      }

      results.push({
        product,
        matchScore: finalScore,
        matchedOn: [...new Set(matchedOn)],
        relevanceReason: relevanceReason.trim(),
      })
    }
  }

  // Sort by match score descending, then by price ascending
  results.sort((a, b) => {
    if (Math.abs(a.matchScore - b.matchScore) > 5) {
      return b.matchScore - a.matchScore
    }
    const priceA = a.product.sale_price ?? a.product.price
    const priceB = b.product.sale_price ?? b.product.price
    return priceA - priceB
  })

  return results.slice(0, limit)
}

/**
 * Search for multiple items from a shopping list
 * Example: "shrimp, salmon, rice, soy sauce"
 */
export function searchShoppingList(products: Product[], listQuery: string): Map<string, SearchResult[]> {
  const items = listQuery.split(/[,;]/).map((item) => item.trim()).filter((item) => item.length > 0)
  
  const results = new Map<string, SearchResult[]>()

  for (const item of items) {
    const matches = searchProducts(products, item, { limit: 3 })
    results.set(item, matches)
  }

  return results
}

/**
 * Get category suggestions based on partial input
 */
export function suggestCategories(products: Product[], query: string): string[] {
  const categories = new Set<string>()
  const queryLower = query.toLowerCase()

  for (const product of products) {
    if (
      product.is_available &&
      product.category.toLowerCase().includes(queryLower)
    ) {
      categories.add(product.category)
    }
  }

  return Array.from(categories).slice(0, 5)
}

/**
 * Find similar products (for "you might also like" suggestions)
 */
export function findSimilarProducts(
  products: Product[],
  referenceProduct: Product,
  limit: number = 5
): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== referenceProduct.id &&
        p.is_available &&
        p.stock_quantity > 0 &&
        (p.category === referenceProduct.category ||
          p.search_keywords?.some((kw) =>
            referenceProduct.search_keywords?.includes(kw)
          ))
    )
    .sort((a, b) => {
      // Prioritize same category, then by price
      if (a.category === referenceProduct.category && b.category !== referenceProduct.category) {
        return -1
      }
      if (b.category === referenceProduct.category && a.category !== referenceProduct.category) {
        return 1
      }
      const priceA = a.sale_price ?? a.price
      const priceB = b.sale_price ?? b.price
      return Math.abs(priceA - referenceProduct.price) - Math.abs(priceB - referenceProduct.price)
    })
    .slice(0, limit)
}
