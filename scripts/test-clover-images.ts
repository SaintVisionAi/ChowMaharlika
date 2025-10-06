/**
 * Test Script: Check if Clover Products Have Images
 * 
 * This script checks a sample of products in Clover to see
 * if they have images available that we can sync.
 * 
 * Usage: npx tsx scripts/test-clover-images.ts
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

import { fetchCloverInventory, fetchCloverItemImage } from '../lib/clover'

async function testCloverImages() {
  console.log('🔍 Testing Clover Image Availability...\n')
  
  try {
    // Fetch first 10 products from Clover
    console.log('📦 Fetching products from Clover...')
    const products = await fetchCloverInventory()
    
    if (!products || products.length === 0) {
      console.log('❌ No products found in Clover')
      return
    }
    
    console.log(`✅ Found ${products.length} total products\n`)
    
    // Test first 10 products for images
    console.log('🖼️  Checking first 10 products for images:\n')
    
    const sampleProducts = products.slice(0, 10)
    let withImages = 0
    let withoutImages = 0
    
    for (const product of sampleProducts) {
      const imageUrl = await fetchCloverItemImage(product.id)
      
      if (imageUrl) {
        console.log(`✅ ${product.name}`)
        console.log(`   Image: ${imageUrl}\n`)
        withImages++
      } else {
        console.log(`❌ ${product.name}`)
        console.log(`   No image available\n`)
        withoutImages++
      }
      
      // Small delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('\n📊 Summary:')
    console.log(`   Products checked: ${sampleProducts.length}`)
    console.log(`   With images: ${withImages}`)
    console.log(`   Without images: ${withoutImages}`)
    console.log(`   Percentage: ${Math.round((withImages / sampleProducts.length) * 100)}%\n`)
    
    if (withImages > 0) {
      console.log('✅ Good news! Some products have images in Clover.')
      console.log('   You can run the full image sync to update your database.\n')
    } else {
      console.log('⚠️  No images found in Clover for these products.')
      console.log('   You may need to add product images in Clover first.\n')
    }
    
  } catch (error) {
    console.error('❌ Error testing Clover images:', error)
    if (error instanceof Error) {
      console.error('   Message:', error.message)
    }
  }
}

// Run the test
testCloverImages()
