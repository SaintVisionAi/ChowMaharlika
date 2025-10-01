#!/usr/bin/env node

// Test Clover integration via Supabase Edge Functions
const TEST_CONFIG = {
  // You'll need to replace these with your actual Supabase credentials
  supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your_anon_key',
  
  // Test configuration
  testEdgeFunctions: true,
  testDirectClover: false // We'll test via edge functions instead
};

async function testCloverViaEdgeFunction() {
  console.log('🧪 Testing Clover Integration via Supabase Edge Functions\n');
  
  if (TEST_CONFIG.supabaseUrl.includes('your-project') || TEST_CONFIG.supabaseAnonKey.includes('your_')) {
    console.log('❌ Please set your Supabase credentials first:');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_ANON_KEY=your_anon_key');
    console.log('\n   Then run: SUPABASE_URL=... SUPABASE_ANON_KEY=... node test-edge-functions.js');
    return;
  }

  try {
    console.log('📋 Configuration:');
    console.log(`   Supabase URL: ${TEST_CONFIG.supabaseUrl}`);
    console.log(`   Anon Key: ${TEST_CONFIG.supabaseAnonKey.substring(0, 20)}...\n`);

    // Test 1: Call the clover-sync edge function
    console.log('🔄 Testing Clover inventory sync edge function...');
    const syncResponse = await fetch(
      `${TEST_CONFIG.supabaseUrl}/functions/v1/clover-sync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`   Response status: ${syncResponse.status}`);
    
    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.log(`❌ Sync function failed:`);
      console.log(`   Error: ${errorText}`);
      
      if (syncResponse.status === 404) {
        console.log('   💡 This usually means the edge function is not deployed yet.');
        console.log('   💡 Deploy with: supabase functions deploy clover-sync');
      } else if (syncResponse.status === 401) {
        console.log('   💡 Check your Supabase anon key and RLS policies');
      }
    } else {
      const result = await syncResponse.json();
      console.log('✅ Sync function success!');
      console.log(`   Message: ${result.message || 'No message'}`);
      console.log(`   Synced Count: ${result.syncedCount || 0}`);
      console.log(`   Error Count: ${result.errorCount || 0}`);
      console.log(`   Total Items: ${result.totalItems || 0}`);
    }

    // Test 2: Test the order creation function
    console.log('\n📦 Testing Clover order creation edge function...');
    const testOrder = {
      orderId: 'test-order-' + Date.now(),
      items: [
        { name: 'Test Fish', price: 15.99, quantity: 2 },
        { name: 'Test Shrimp', price: 12.50, quantity: 1 }
      ],
      total: 44.48
    };

    const orderResponse = await fetch(
      `${TEST_CONFIG.supabaseUrl}/functions/v1/clover-create-order`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOrder)
      }
    );

    console.log(`   Response status: ${orderResponse.status}`);
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.log(`❌ Order function failed:`);
      console.log(`   Error: ${errorText}`);
    } else {
      const result = await orderResponse.json();
      console.log('✅ Order function success!');
      console.log(`   Clover Order ID: ${result.cloverOrderId || 'None'}`);
      console.log(`   Message: ${result.message || 'No message'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function deploymentInstructions() {
  console.log('\n📚 Deployment Instructions:');
  console.log('');
  console.log('1. Set environment variables in Supabase:');
  console.log('   supabase secrets set CLOVER_MERCHANT_ID=526163795887');
  console.log('   supabase secrets set CLOVER_API_KEY=9a135bb3-8049-d54a-91d6-67a08b2dc9c9');
  console.log('   supabase secrets set CLOVER_BASE_URL=https://api.clover.com');
  console.log('');
  console.log('2. Deploy the edge functions:');
  console.log('   supabase functions deploy clover-sync');
  console.log('   supabase functions deploy clover-create-order');
  console.log('');
  console.log('3. Update your .env.local with proper Supabase credentials');
  console.log('');
  console.log('4. Test your UI integration');
}

// Run the tests
if (require.main === module) {
  testCloverViaEdgeFunction().then(() => {
    deploymentInstructions();
  });
}