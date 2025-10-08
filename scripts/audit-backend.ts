#!/usr/bin/env tsx
/**
 * Complete Backend Audit Script
 * Tests all database tables, API routes, and integrations
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 CHOWMAHARLIKA BACKEND AUDIT\n')
console.log('=' .repeat(60))

// Test database tables
async function testDatabaseTables() {
  console.log('\n📊 DATABASE TABLES CHECK\n')

  const tables = [
    'profiles',
    'products',
    'orders',
    'order_items',
    'cart_items',
    'loyalty_members',
    'loyalty_tiers',
    'loyalty_transactions',
    'rewards_catalog',
    'reward_redemptions',
    'loyalty_referrals',
  ]

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`   ❌ ${table.padEnd(25)} - ERROR: ${error.message}`)
      } else {
        console.log(`   ✓ ${table.padEnd(25)} - ${count} records`)
      }
    } catch (e) {
      console.log(`   ❌ ${table.padEnd(25)} - ERROR: ${e}`)
    }
  }
}

// Test rewards system
async function testRewardsSystem() {
  console.log('\n🎁 REWARDS SYSTEM CHECK\n')

  // Check tiers
  const { data: tiers, error: tiersError } = await supabase
    .from('loyalty_tiers')
    .select('*')
    .order('tier_level')

  if (tiersError) {
    console.log(`   ❌ Loyalty Tiers: ${tiersError.message}`)
  } else {
    console.log(`   ✓ Loyalty Tiers: ${tiers?.length || 0} tiers configured`)
    tiers?.forEach(tier => {
      console.log(`      - ${tier.tier_name} (Level ${tier.tier_level}): ${tier.points_threshold}+ pts`)
    })
  }

  // Check rewards catalog
  const { data: rewards, error: rewardsError } = await supabase
    .from('rewards_catalog')
    .select('*')
    .eq('is_active', true)

  if (rewardsError) {
    console.log(`   ❌ Rewards Catalog: ${rewardsError.message}`)
  } else {
    console.log(`   ✓ Rewards Catalog: ${rewards?.length || 0} active rewards`)
  }

  // Check members
  const { count: memberCount } = await supabase
    .from('loyalty_members')
    .select('*', { count: 'exact', head: true })

  console.log(`   ✓ Enrolled Members: ${memberCount}`)
}

// Test products
async function testProducts() {
  console.log('\n🛒 PRODUCTS CHECK\n')

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: availableProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true)

  const { count: productsWithImages } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'is', null)
    .not('image_url', 'like', '%placeholder%')

  const { count: seafoodProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'seafood')
    .eq('is_available', true)

  const { count: groceryProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'grocery')
    .eq('is_available', true)

  console.log(`   ✓ Total Products: ${totalProducts}`)
  console.log(`   ✓ Available Products: ${availableProducts}`)
  console.log(`   ✓ Products with Images: ${productsWithImages}`)
  console.log(`   ✓ Seafood Products: ${seafoodProducts}`)
  console.log(`   ✓ Grocery Products: ${groceryProducts}`)
}

// Test authentication tables
async function testAuthTables() {
  console.log('\n🔐 AUTHENTICATION CHECK\n')

  const { count: profileCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  console.log(`   ✓ User Profiles: ${profileCount}`)
}

// Test orders
async function testOrders() {
  console.log('\n📦 ORDERS CHECK\n')

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: completedOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  console.log(`   ✓ Total Orders: ${orderCount}`)
  console.log(`   ✓ Pending Orders: ${pendingOrders}`)
  console.log(`   ✓ Completed Orders: ${completedOrders}`)
}

// Check environment variables
function testEnvironmentVars() {
  console.log('\n🔧 ENVIRONMENT VARIABLES CHECK\n')

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLOVER_MERCHANT_ID',
    'CLOVER_API_KEY',
    'ANTHROPIC_API_KEY',
  ]

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (value) {
      const masked = value.substring(0, 15) + '...'
      console.log(`   ✓ ${varName.padEnd(35)} ${masked}`)
    } else {
      console.log(`   ❌ ${varName.padEnd(35)} MISSING`)
    }
  }
}

// Check views
async function testViews() {
  console.log('\n👁️  DATABASE VIEWS CHECK\n')

  try {
    const { data, error } = await supabase
      .from('loyalty_member_summary')
      .select('*')
      .limit(1)

    if (error) {
      console.log(`   ❌ loyalty_member_summary view: ${error.message}`)
    } else {
      console.log(`   ✓ loyalty_member_summary view: Working`)
    }
  } catch (e) {
    console.log(`   ❌ loyalty_member_summary view: ${e}`)
  }
}

// Run all tests
async function runAudit() {
  try {
    testEnvironmentVars()
    await testDatabaseTables()
    await testViews()
    await testProducts()
    await testAuthTables()
    await testOrders()
    await testRewardsSystem()

    console.log('\n' + '='.repeat(60))
    console.log('✅ AUDIT COMPLETE')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n💥 AUDIT FAILED:', error)
    process.exit(1)
  }
}

runAudit()
