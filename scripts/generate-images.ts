#!/usr/bin/env tsx
/**
 * Generate Product Images from Unsplash
 * 
 * This script automatically finds and assigns real product photos
 * from Unsplash's free image library.
 * 
 * Usage:
 *   npx tsx scripts/generate-images.ts          # Test mode (10 products)
 *   npx tsx scripts/generate-images.ts --full   # Full run (all products)
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

import { bulkGenerateProductImages } from '../lib/product-image-generator'

async function main() {
  const args = process.argv.slice(2)
  const fullMode = args.includes('--full')

  console.log('🎨 Maharlika Product Image Generator')
  console.log('═'.repeat(50))
  console.log()

  // Check if Unsplash key is configured
  if (!process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY === 'YOUR_KEY_WILL_GO_HERE') {
    console.log('❌ Unsplash API key not configured!')
    console.log()
    console.log('Please add your Unsplash API key to .env.local:')
    console.log('1. Get key from: https://unsplash.com/developers')
    console.log('2. Edit .env.local and replace YOUR_KEY_WILL_GO_HERE')
    console.log('3. Run this script again')
    console.log()
    process.exit(1)
  }

  if (!fullMode) {
    console.log('🧪 TEST MODE - Processing first 10 products')
    console.log('   (Use --full flag to process all products)')
    console.log()
  } else {
    console.log('🚀 FULL MODE - Processing up to 500 products')
    console.log('   This will take 1-2 hours due to API rate limits')
    console.log()
  }

  console.log('Starting in 3 seconds...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log()

  try {
    const result = await bulkGenerateProductImages({
      method: 'unsplash',
      batchSize: fullMode ? 10 : 5,  // Smaller batches in test mode
      delay: 2000, // 2 seconds between batches
    })

    console.log()
    console.log('═'.repeat(50))
    console.log('✅ IMAGE GENERATION COMPLETE!')
    console.log('═'.repeat(50))
    console.log()
    console.log('📊 Results:')
    console.log(`   Total products: ${result.stats?.total || 0}`)
    console.log(`   Successfully updated: ${result.stats?.updated || 0}`)
    console.log(`   Failed: ${result.stats?.failed || 0}`)
    console.log()

    if (result.stats?.updated > 0) {
      const successRate = Math.round((result.stats.updated / result.stats.total) * 100)
      console.log(`   Success rate: ${successRate}%`)
      console.log()
      console.log('🎉 Your products now have real photos!')
      console.log('   Visit your site to see the results.')
      
      if (!fullMode) {
        console.log()
        console.log('💡 To process all products, run:')
        console.log('   npx tsx scripts/generate-images.ts --full')
      }
    }

    console.log()

  } catch (error) {
    console.error()
    console.error('❌ Error generating images:', error)
    if (error instanceof Error) {
      console.error('   ', error.message)
    }
    console.error()
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)
