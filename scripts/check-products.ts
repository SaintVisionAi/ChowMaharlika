#!/usr/bin/env tsx
/**
 * Quick script to check products in the database
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts() {
  console.log('🔍 Checking products in database...\n')

  // Get total count
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Error counting products:', countError)
    return
  }

  console.log(`📊 Total products in database: ${count}\n`)

  // Get available count
  const { count: availableCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true)

  console.log(`✅ Available products: ${availableCount}`)
  console.log(`❌ Unavailable products: ${count! - availableCount!}\n`)

  // Get sample products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, price, stock_quantity, image_url, is_available')
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('📦 Sample of latest products:')
  console.log('═'.repeat(100))
  products?.forEach((p, i) => {
    const hasImage = p.image_url && !p.image_url.includes('placeholder')
    console.log(`${i + 1}. ${p.name.substring(0, 40).padEnd(40)} | ${p.category?.padEnd(10)} | $${p.price} | Stock: ${p.stock_quantity} | Image: ${hasImage ? '✓' : '✗'} | Available: ${p.is_available ? '✓' : '✗'}`)
  })
  console.log('═'.repeat(100))

  // Check images
  const { count: withImages } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'is', null)
    .not('image_url', 'like', '%placeholder%')

  console.log(`\n🖼️  Products with real images: ${withImages}`)
  console.log(`🖼️  Products without images: ${count! - withImages!}`)
}

checkProducts().catch(console.error)
