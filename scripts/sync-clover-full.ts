/**
 * Full Clover Inventory Sync for SaintAthena
 * Syncs ALL 2300+ items with enhanced search keywords and categorization
 */

import { createClient } from "@supabase/supabase-js"

const CLOVER_CONFIG = {
  merchantId: process.env.CLOVER_MERCHANT_ID!,
  apiKey: process.env.CLOVER_API_KEY!,
  baseUrl: "https://api.clover.com/v3",
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CloverItem {
  id: string
  name: string
  price: number
  priceType?: string
  cost?: number
  isRevenue?: boolean
  available?: boolean
  hidden?: boolean
  code?: string
  sku?: string
  alternateName?: string
  categories?: { elements: Array<{ id: string; name: string }> }
  modifiedTime?: number
  deleted?: boolean
  stockCount?: number
}

/**
 * Generate search keywords based on product name and category
 */
function generateSearchKeywords(name: string, category?: string): string[] {
  const keywords = new Set<string>()
  
  // Add name parts
  const nameParts = name.toLowerCase().split(/[\s\-_,\/]+/)
  nameParts.forEach(part => {
    if (part.length > 2) keywords.add(part)
  })
  
  // Add category
  if (category) {
    keywords.add(category.toLowerCase())
  }
  
  // Common seafood terms
  const seafoodTerms = ['fresh', 'frozen', 'raw', 'cooked', 'wild', 'farm', 'premium', 'quality']
  seafoodTerms.forEach(term => {
    if (name.toLowerCase().includes(term)) {
      keywords.add(term)
    }
  })
  
  return Array.from(keywords)
}

/**
 * Map product names to Filipino alternatives
 */
function getFilipinoAlternatives(name: string): string[] {
  const alternatives: string[] = []
  const nameLower = name.toLowerCase()
  
  const filipinoMap: Record<string, string[]> = {
    'shrimp': ['hipon', 'sugpo'],
    'prawn': ['hipon', 'sugpo'],
    'crab': ['alimasag', 'alimango'],
    'fish': ['isda'],
    'salmon': ['salmon'],
    'tilapia': ['tilapya'],
    'tuna': ['tuna', 'bariles'],
    'squid': ['pusit'],
    'octopus': ['pugita'],
    'oyster': ['talaba'],
    'clam': ['halaan', 'tulya'],
    'mussel': ['tahong'],
    'scallop': ['kabibe'],
    'lobster': ['ulang'],
    'rice': ['bigas', 'kanin'],
    'noodles': ['pancit'],
    'soy sauce': ['toyo'],
    'vinegar': ['suka'],
    'garlic': ['bawang'],
    'onion': ['sibuyas'],
    'ginger': ['luya'],
    'pepper': ['paminta'],
    'salt': ['asin'],
    'sugar': ['asukal'],
    'oil': ['langis'],
    'egg': ['itlog'],
    'meat': ['karne'],
    'pork': ['baboy'],
    'chicken': ['manok'],
    'beef': ['baka'],
  }
  
  for (const [english, filipino] of Object.entries(filipinoMap)) {
    if (nameLower.includes(english)) {
      alternatives.push(...filipino)
    }
  }
  
  return alternatives
}

/**
 * Intelligent category mapping from Clover categories
 */
function mapCategory(cloverCategories?: { elements: Array<{ name: string }> }): string {
  if (!cloverCategories || cloverCategories.elements.length === 0) {
    return 'general'
  }
  
  const categoryName = cloverCategories.elements[0].name.toLowerCase()
  
  // Map to our standard categories
  if (categoryName.includes('seafood') || categoryName.includes('fish')) return 'seafood'
  if (categoryName.includes('meat') || categoryName.includes('pork') || categoryName.includes('beef') || categoryName.includes('chicken')) return 'meat'
  if (categoryName.includes('produce') || categoryName.includes('vegetable') || categoryName.includes('fruit')) return 'produce'
  if (categoryName.includes('dairy') || categoryName.includes('milk') || categoryName.includes('cheese')) return 'dairy'
  if (categoryName.includes('frozen')) return 'frozen'
  if (categoryName.includes('beverage') || categoryName.includes('drink')) return 'beverages'
  if (categoryName.includes('snack')) return 'snacks'
  if (categoryName.includes('sauce') || categoryName.includes('condiment')) return 'condiments'
  if (categoryName.includes('rice') || categoryName.includes('noodle') || categoryName.includes('pasta')) return 'grains'
  if (categoryName.includes('canned') || categoryName.includes('packaged')) return 'packaged'
  
  return categoryName
}

/**
 * Fetch all items from Clover with pagination
 */
async function fetchAllCloverItems(): Promise<CloverItem[]> {
  const allItems: CloverItem[] = []
  let offset = 0
  const limit = 1000 // Max per request
  
  console.log('🔄 Starting Clover inventory sync...')
  
  while (true) {
    const url = `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/items?limit=${limit}&offset=${offset}&expand=categories`
    
    console.log(`📦 Fetching items ${offset} to ${offset + limit}...`)
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${CLOVER_CONFIG.apiKey}`,
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Clover API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    const items = data.elements || []
    
    if (items.length === 0) {
      break // No more items
    }
    
    allItems.push(...items)
    console.log(`✅ Fetched ${items.length} items (Total: ${allItems.length})`)
    
    if (items.length < limit) {
      break // Last page
    }
    
    offset += limit
  }
  
  console.log(`🎉 Completed! Fetched ${allItems.length} total items from Clover`)
  return allItems
}

/**
 * Sync items to Supabase with SaintAthena features
 */
async function syncToSupabase(cloverItems: CloverItem[]) {
  console.log('💾 Starting Supabase sync...')
  
  let successCount = 0
  let errorCount = 0
  let skippedCount = 0
  
  for (const item of cloverItems) {
    // Skip deleted or hidden items
    if (item.deleted || item.hidden) {
      skippedCount++
      continue
    }
    
    // Skip non-revenue items
    if (item.isRevenue === false) {
      skippedCount++
      continue
    }
    
    // Convert price from cents to dollars
    const price = item.price ? item.price / 100 : 0
    
    // Skip items with no price
    if (price === 0) {
      skippedCount++
      continue
    }
    
    const category = mapCategory(item.categories)
    const searchKeywords = generateSearchKeywords(item.name, category)
    const alternativeNames = getFilipinoAlternatives(item.name)
    
    const productData = {
      clover_id: item.id,
      name: item.name,
      description: item.alternateName || null,
      price: price,
      category: category,
      stock_quantity: item.stockCount || 0,
      is_available: item.available !== false,
      search_keywords: searchKeywords,
      alternative_names: alternativeNames.length > 0 ? alternativeNames : null,
      updated_at: new Date().toISOString(),
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .upsert(productData, {
          onConflict: 'clover_id',
          ignoreDuplicates: false,
        })
      
      if (error) {
        console.error(`❌ Error syncing "${item.name}":`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 100 === 0) {
          console.log(`✅ Synced ${successCount} products...`)
        }
      }
    } catch (err) {
      console.error(`❌ Exception syncing "${item.name}":`, err)
      errorCount++
    }
  }
  
  console.log('\n📊 Sync Complete!')
  console.log(`✅ Success: ${successCount}`)
  console.log(`⏭️  Skipped: ${skippedCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📦 Total processed: ${cloverItems.length}`)
}

/**
 * Main sync function
 */
async function main() {
  try {
    console.log('🚀 SaintAthena - Full Clover Inventory Sync')
    console.log('='.repeat(50))
    
    // Validate environment
    if (!CLOVER_CONFIG.merchantId || !CLOVER_CONFIG.apiKey) {
      throw new Error('Missing Clover credentials in environment variables')
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials in environment variables')
    }
    
    console.log(`🏪 Merchant ID: ${CLOVER_CONFIG.merchantId}`)
    console.log(`🗄️  Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    console.log('')
    
    // Fetch all items from Clover
    const cloverItems = await fetchAllCloverItems()
    
    // Sync to Supabase
    await syncToSupabase(cloverItems)
    
    console.log('\n🎉 All done! SaintAthena now knows your entire inventory!')
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run the sync
main()
