#!/usr/bin/env node

// Test Clover API connection
const CLOVER_CONFIG = {
  merchantId: '526163795887',
  publicToken: '6f165c2b476bb19cd5598846557b0f81',
  privateToken: 'b8970583-8365-bee2-54ec-dc2f2ad8194f',
  apiKey: '9a135bb3-8049-d54a-91d6-67a08b2dc9c9', // Full authority API key
  baseUrl: 'https://api.clover.com/v3',
  sandboxUrl: 'https://sandbox.dev.clover.com/v3'
};

// Test both production and sandbox
const TEST_ENVIRONMENTS = [
  { name: 'Production', url: CLOVER_CONFIG.baseUrl },
  { name: 'Sandbox', url: CLOVER_CONFIG.sandboxUrl }
];

async function testEnvironment(environment) {
  console.log(`\n🌍 Testing ${environment.name} environment...`);
  console.log(`   URL: ${environment.url}`);
  
  let success = false;
  
  try {
    // Test 1: Fetch merchant info
    console.log('🏪 Testing merchant info...');
    const merchantResponse = await fetch(
      `${environment.url}/merchants/${CLOVER_CONFIG.merchantId}`, 
      {
        headers: {
          'Authorization': `Bearer ${CLOVER_CONFIG.apiKey}`
        }
      }
    );
    
    if (!merchantResponse.ok) {
      console.log(`❌ Merchant info failed: ${merchantResponse.status}`);
      const errorText = await merchantResponse.text();
      console.log(`   Error: ${errorText}`);
    } else {
      const merchantData = await merchantResponse.json();
      console.log(`✅ Merchant info success: ${merchantData.name || 'Unknown'}`);
      success = true;
    }
    
    // Test 2: Fetch inventory/items
    console.log('📦 Testing inventory catalog...');
    const inventoryResponse = await fetch(
      `${environment.url}/merchants/${CLOVER_CONFIG.merchantId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${CLOVER_CONFIG.apiKey}`
        }
      }
    );
    
    if (!inventoryResponse.ok) {
      console.log(`❌ Inventory fetch failed: ${inventoryResponse.status}`);
      const errorText = await inventoryResponse.text();
      console.log(`   Error: ${errorText}`);
      
      // Try to provide helpful debugging info
      if (inventoryResponse.status === 401) {
        console.log('   🔑 Authentication issue - check API key');
      } else if (inventoryResponse.status === 403) {
        console.log('   🚫 Permissions issue - check API token permissions');
      }
    } else {
      const inventoryData = await inventoryResponse.json();
      const itemCount = inventoryData.elements ? inventoryData.elements.length : 0;
      console.log(`✅ Inventory catalog success: ${itemCount} items found`);
      success = true;
      
      if (itemCount > 0 && inventoryData.elements) {
        console.log('\n📋 Sample items:');
        inventoryData.elements.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - $${(item.price / 100).toFixed(2)}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   Error: ${error.message}`);
  }
  
  return success;
}

async function testCloverConnection() {
  console.log('🧪 Testing Clover API connection...\n');
  console.log('📋 Configuration:');
  console.log(`   Merchant ID: ${CLOVER_CONFIG.merchantId}`);
  console.log(`   API Key: ${CLOVER_CONFIG.apiKey.substring(0, 8)}...`);
  
  let anySuccess = false;
  
  for (const environment of TEST_ENVIRONMENTS) {
    const success = await testEnvironment(environment);
    if (success) anySuccess = true;
  }
  
  console.log('\n' + '='.repeat(50));
  if (anySuccess) {
    console.log('🎉 SUCCESS: At least one environment is working!');
  } else {
    console.log('❌ FAILED: No environments are working.');
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('   1. Verify your API key is still valid in Clover Dashboard');
    console.log('   2. Check if the merchant ID is correct');
    console.log('   3. Ensure API permissions include inventory access');
    console.log('   4. Try generating a new API token');
  }
}

// Run the test
testCloverConnection();