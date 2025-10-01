/**
 * Product Image Management System
 * 
 * Handles:
 * 1. Clover API image fetching
 * 2. Fallback image mapping for common products
 * 3. Category-based placeholder images
 * 4. Image optimization and caching
 */

// High-quality seafood images from Unsplash
const SEAFOOD_IMAGES = {
  // Fish
  salmon: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80",
  tuna: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
  cod: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
  tilapia: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  mackerel: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&q=80",
  halibut: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80",
  trout: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&q=80",
  snapper: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  bass: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",

  // Shellfish
  shrimp: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
  prawn: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
  crab: "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80",
  lobster: "https://images.unsplash.com/photo-1625152587976-4f66b1f16c9d?w=800&q=80",
  scallop: "https://images.unsplash.com/photo-1580651315530-8762a929a10d?w=800&q=80",
  oyster: "https://images.unsplash.com/photo-1570623710374-d5d0ec7eb8dc?w=800&q=80",
  clam: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
  mussel: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80",

  // Squid/Octopus
  squid: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  octopus: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  calamari: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",

  // Premium/Special
  caviar: "https://images.unsplash.com/photo-1585583408634-8f69c47bc45a?w=800&q=80",
  roe: "https://images.unsplash.com/photo-1585583408634-8f69c47bc45a?w=800&q=80",
  urchin: "https://images.unsplash.com/photo-1570823970095-dd0ba2c1c728?w=800&q=80",
}

// Category fallback images
const CATEGORY_FALLBACKS = {
  seafood: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
  fish: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  shellfish: "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  produce: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80",
  meat: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80",
  frozen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  prepared: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  default: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
}

/**
 * Fetch product image from Clover API
 */
export async function fetchCloverImage(itemId: string, merchantId: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.clover.com/v3/merchants/${merchantId}/items/${itemId}?expand=image`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    
    // Clover image URL structure
    if (data.image?.url) {
      return data.image.url
    }

    return null
  } catch (error) {
    console.error("[Image] Error fetching Clover image:", error)
    return null
  }
}

/**
 * Find best matching image based on product name
 */
export function findProductImage(productName: string, category?: string): string {
  if (!productName) {
    return CATEGORY_FALLBACKS.default
  }

  const nameLower = productName.toLowerCase()

  // Try exact matches first
  for (const [keyword, imageUrl] of Object.entries(SEAFOOD_IMAGES)) {
    if (nameLower.includes(keyword)) {
      return imageUrl
    }
  }

  // Try category fallback
  if (category) {
    const categoryLower = category.toLowerCase()
    for (const [catKey, imageUrl] of Object.entries(CATEGORY_FALLBACKS)) {
      if (categoryLower.includes(catKey)) {
        return imageUrl
      }
    }
  }

  // Default fallback
  return CATEGORY_FALLBACKS.default
}

/**
 * Get optimized image URL with size and quality parameters
 */
export function getOptimizedImageUrl(imageUrl: string, size: "sm" | "md" | "lg" | "xl" = "md"): string {
  if (!imageUrl) return CATEGORY_FALLBACKS.default

  // If it's an Unsplash URL, add optimization parameters
  if (imageUrl.includes("unsplash.com")) {
    const sizeMap = {
      sm: "w=400&h=400",
      md: "w=800&h=800",
      lg: "w=1200&h=1200",
      xl: "w=1600&h=1600",
    }
    
    // Check if URL already has parameters
    const separator = imageUrl.includes("?") ? "&" : "?"
    return `${imageUrl}${separator}${sizeMap[size]}&q=80&fit=crop&auto=format`
  }

  return imageUrl
}

/**
 * Generate product image with multiple fallback strategies
 */
export async function getProductImage(product: {
  id?: string
  clover_id?: string
  name: string
  category?: string
  image_url?: string | null
}): Promise<string> {
  // 1. Use existing image_url if available
  if (product.image_url) {
    return getOptimizedImageUrl(product.image_url, "md")
  }

  // 2. Try to fetch from Clover if we have clover_id
  if (product.clover_id && process.env.CLOVER_MERCHANT_ID && process.env.CLOVER_API_KEY) {
    const cloverImage = await fetchCloverImage(
      product.clover_id,
      process.env.CLOVER_MERCHANT_ID,
      process.env.CLOVER_API_KEY
    )
    
    if (cloverImage) {
      return getOptimizedImageUrl(cloverImage, "md")
    }
  }

  // 3. Use smart matching based on name
  const matchedImage = findProductImage(product.name, product.category)
  return getOptimizedImageUrl(matchedImage, "md")
}

/**
 * Batch process product images
 */
export async function batchGetProductImages(products: Array<{
  id?: string
  clover_id?: string
  name: string
  category?: string
  image_url?: string | null
}>): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()

  await Promise.all(
    products.map(async (product) => {
      const imageUrl = await getProductImage(product)
      imageMap.set(product.id || product.clover_id || product.name, imageUrl)
    })
  )

  return imageMap
}

/**
 * Get placeholder image for loading states
 */
export function getPlaceholderImage(category?: string): string {
  return category && CATEGORY_FALLBACKS[category as keyof typeof CATEGORY_FALLBACKS]
    ? CATEGORY_FALLBACKS[category as keyof typeof CATEGORY_FALLBACKS]
    : CATEGORY_FALLBACKS.default
}

/**
 * Check if image URL is valid
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}
