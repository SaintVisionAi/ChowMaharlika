#!/usr/bin/env tsx
/**
 * Sync Products from Clover POS
 * 
 * Pulls all items from Clover and syncs them to Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const cloverMerchantId = process.env.CLOVER_MERCHANT_ID!
const cloverApiKey = process.env.CLOVER_API_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface CloverItem {
  id: string
  name: string
  price: number
  priceType?: string
  cost?: number
  isRevenue?: boolean
  description?: string
  categories?: { name: string }[]
  stockCount?: number
  modifiedTime?: number
  code?: string
}

async function syncFromClover() {
  console.log('🚀 Starting Clover Product Sync\n')
  console.log(`📊 Merchant ID: ${cloverMerchantId}`)
  console.log(`📊 API Key: ${cloverApiKey?.substring(0, 12)}...\n`)

  try {
    // Test multiple API endpoints to find the working one
    const endpoints = [
      `https://api.clover.com/v3/merchants/${cloverMerchantId}/items`,
      `https://api.clover.com/merchants/${cloverMerchantId}/items`,
    ]

    let cloverItems: CloverItem[] = []
    let successUrl = ''

    for (const url of endpoints) {
      console.log(`🔍 Trying endpoint: ${url}`)
      
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${cloverApiKey}`,
            'Accept': 'application/json'
          }
        })

        console.log(`   Status: ${response.status} ${response.statusText}`)

        if (response.ok) {
          const data = await response.json()
          cloverItems = data.elements || []
          successUrl = url
          console.log(`   ✅ Success! Found ${cloverItems.length} items\n`)
          break
        } else {
          const errorText = await response.text()
          console.log(`   ❌ Error: ${errorText.substring(0, 200)}...\n`)
        }
      } catch (error) {
        console.log(`   ❌ Request failed: ${error}\n`)
      }
    }

    if (cloverItems.length === 0) {
      console.error('❌ Could not fetch items from Clover')
      console.log('\n💡 Possible issues:')
      console.log('   1. API key might be expired or invalid')
      console.log('   2. Merchant ID might be incorrect')
      console.log('   3. Network/firewall blocking requests')
      console.log('\n🔗 Check your Clover dashboard:')
      console.log(`   https://www.clover.com/dashboard/merchants/${cloverMerchantId}`)
      process.exit(1)
    }

    console.log(`\n📦 Processing ${cloverItems.length} products from Clover...\n`)

    let synced = 0
    let errors = 0

    // Process in batches
    const batchSize = 100
    for (let i = 0; i < cloverItems.length; i += batchSize) {
      const batch = cloverItems.slice(i, i + batchSize)
      console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, cloverItems.length)} of ${cloverItems.length})`)

      for (const item of batch) {
        try {
          // Check if product exists
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('clover_id', item.id)
            .single()

          const productData = {
            name: item.name,
            description: item.description || '',
            price: item.price ? item.price / 100 : 0, // Convert cents to dollars
            category: item.categories?.[0]?.name?.toLowerCase() || 'general',
            stock_quantity: item.stockCount || 0,
            clover_id: item.id,
            is_available: true,
            last_synced_at: new Date().toISOString(),
          }

          if (existing) {
            // Update
            const { error } = await supabase
              .from('products')
              .update(productData)
              .eq('id', existing.id)

            if (error) throw error
            console.log(`   ✓ Updated: ${item.name}`)
          } else {
            // Insert
            const { error } = await supabase
              .from('products')
              .insert(productData)

            if (error) throw error
            console.log(`   + Created: ${item.name}`)
          }

          synced++
        } catch (error) {
          console.error(`   ❌ Error with "${item.name}":`, error instanceof Error ? error.message : error)
          errors++
        }
      }

      // Small delay between batches
      if (i + batchSize < cloverItems.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Clover Sync Complete!\n')
    console.log(`📊 Statistics:`)
    console.log(`   Total items in Clover: ${cloverItems.length}`)
    console.log(`   ✅ Successfully synced: ${synced}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log('='.repeat(60))
    
    console.log('\n💡 Next step: Run the image update script!')
    console.log('   npx tsx scripts/update-product-images.ts')

  } catch (error) {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  }
}

syncFromClover()
