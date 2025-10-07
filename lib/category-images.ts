/**
 * Category Images Configuration
 * High-quality curated images from Unsplash for each product category
 * These images are displayed in product grids for uniform, fast loading
 */

export const CATEGORY_IMAGES: Record<string, { url: string; alt: string }> = {
  // Main Categories
  seafood: {
    url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh seafood display with various fish and shellfish"
  },
  grocery: {
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&fit=crop&auto=format",
    alt: "Grocery items and pantry staples"
  },
  
  // Seafood Subcategories
  fish: {
    url: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh whole fish on display"
  },
  salmon: {
    url: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh salmon fillet"
  },
  shellfish: {
    url: "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80&fit=crop&auto=format",
    alt: "Assorted fresh shellfish"
  },
  shrimp: {
    url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh jumbo shrimp"
  },
  crab: {
    url: "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh crab on ice"
  },
  lobster: {
    url: "https://images.unsplash.com/photo-1625152587976-4f66b1f16c9d?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh whole lobster"
  },
  oysters: {
    url: "https://images.unsplash.com/photo-1570623710374-d5d0ec7eb8dc?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh oysters on the half shell"
  },
  scallops: {
    url: "https://images.unsplash.com/photo-1580651315530-8762a929a10d?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh sea scallops"
  },
  tuna: {
    url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh tuna steak"
  },
  squid: {
    url: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh squid and calamari"
  },
  
  // Grocery Subcategories
  rice: {
    url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80&fit=crop&auto=format",
    alt: "Various types of rice grains"
  },
  noodles: {
    url: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80&fit=crop&auto=format",
    alt: "Asian noodles and pasta varieties"
  },
  sauce: {
    url: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800&q=80&fit=crop&auto=format",
    alt: "Various sauces and condiments"
  },
  condiments: {
    url: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800&q=80&fit=crop&auto=format",
    alt: "Asian condiments and seasonings"
  },
  spices: {
    url: "https://images.unsplash.com/photo-1596040033229-a0b4c5199674?w=800&q=80&fit=crop&auto=format",
    alt: "Colorful spices and seasonings"
  },
  
  // Produce
  produce: {
    url: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh fruits and vegetables"
  },
  vegetables: {
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&fit=crop&auto=format",
    alt: "Assorted fresh vegetables"
  },
  fruits: {
    url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80&fit=crop&auto=format",
    alt: "Colorful fresh fruits"
  },
  herbs: {
    url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh herbs and greens"
  },
  
  // Meat & Poultry
  meat: {
    url: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80&fit=crop&auto=format",
    alt: "Premium cuts of meat"
  },
  beef: {
    url: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80&fit=crop&auto=format",
    alt: "Premium beef cuts"
  },
  pork: {
    url: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh pork cuts"
  },
  chicken: {
    url: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh chicken cuts"
  },
  poultry: {
    url: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&q=80&fit=crop&auto=format",
    alt: "Various poultry products"
  },
  
  // Frozen
  frozen: {
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&fit=crop&auto=format",
    alt: "Frozen food products"
  },
  
  // Prepared Foods
  prepared: {
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&fit=crop&auto=format",
    alt: "Ready-to-eat prepared meals"
  },
  
  // Beverages
  beverages: {
    url: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80&fit=crop&auto=format",
    alt: "Various beverages and drinks"
  },
  
  // Bakery
  bakery: {
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&fit=crop&auto=format",
    alt: "Fresh baked goods"
  },
  
  // Snacks
  snacks: {
    url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80&fit=crop&auto=format",
    alt: "Various snacks and treats"
  },
  
  // Default fallback
  default: {
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&fit=crop&auto=format",
    alt: "Premium food products"
  }
}

/**
 * Get category image for a product
 * Tries to match category with available images, falls back to default
 */
export function getCategoryImage(category?: string): { url: string; alt: string } {
  if (!category) {
    return CATEGORY_IMAGES.default
  }

  const categoryLower = category.toLowerCase().trim()
  
  // Try exact match first
  if (CATEGORY_IMAGES[categoryLower]) {
    return CATEGORY_IMAGES[categoryLower]
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(CATEGORY_IMAGES)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value
    }
  }
  
  // Default fallback
  return CATEGORY_IMAGES.default
}

/**
 * Get all unique categories with images
 */
export function getAllCategories(): Array<{ category: string; image: { url: string; alt: string } }> {
  return Object.entries(CATEGORY_IMAGES)
    .filter(([key]) => key !== 'default')
    .map(([category, image]) => ({ category, image }))
}
