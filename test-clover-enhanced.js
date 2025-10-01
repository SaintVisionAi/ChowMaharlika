#!/usr/bin/env node

// Enhanced Clover API test with all available tokens
const CLOVER_CONFIG = {
  merchantId: '526163795887',
  publicToken: '6f165c2b476bb19cd5598846557b0f81',
  privateToken: 'b8970583-8365-bee2-54ec-dc2f2ad8194f',
  apiKey: '9a135bb3-8049-d54a-91d6-67a08b2dc9c9',
  baseUrl: 'https://api.clover.com/v3',
  sandboxUrl: 'https://sandbox.dev.clover.com/v3'
};

// Test with all available tokens
const TEST_TOKENS = [
  { name: 'Full Authority API Key', token: CLOVER_CONFIG.apiKey },
  { name: 'Private Token', token: CLOVER_CONFIG.privateToken },
  { name: 'Public Token', token: CLOVER_CONFIG.publicToken }
];

const TEST_ENVIRONMENTS = [
  { name: 'Production', url: CLOVER_CONFIG.baseUrl },
  { name: 'Sandbox', url: CLOVER_CONFIG.sandboxUrl }
];

async function testTokenAndEnvironment(environment, tokenInfo) {
  console.log(`\n🌍 Testing ${environment.name} with ${tokenInfo.name}...`);
  console.log(`   URL: ${environment.url}`);
  console.log(`   Token: ${tokenInfo.token.substring(0, 8)}...`);
  
  let success = false;
  
  try {
    // Test merchant info
    console.log('🏪 Testing merchant info...');
    const merchantResponse = await fetch(
      `${environment.url}/merchants/${CLOVER_CONFIG.merchantId}`, 
      {
        headers: {
          'Authorization': `Bearer ${tokenInfo.token}`
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
    
    // Test inventory
    console.log('📦 Testing inventory catalog...');
    const inventoryResponse = await fetch(
      `${environment.url}/merchants/${CLOVER_CONFIG.merchantId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${tokenInfo.token}`
        }
      }
    );
    
    if (!inventoryResponse.ok) {
      console.log(`❌ Inventory failed: ${inventoryResponse.status}`);
      const errorText = await inventoryResponse.text();
      console.log(`   Error: ${errorText}`);
    } else {
      const inventoryData = await inventoryResponse.json();
      const itemCount = inventoryData.elements ? inventoryData.elements.length : 0;
      console.log(`✅ Inventory success: ${itemCount} items found`);
      success = true;
      
      if (itemCount > 0 && inventoryData.elements) {
        console.log('\n📋 Sample items:');
        inventoryData.elements.slice(0, 3).forEach((item, index) => {
          const price = item.price ? (item.price / 100).toFixed(2) : 'N/A';
          console.log(`   ${index + 1}. ${item.name} - $${price}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
  
  return success;
}

async function testCloverConnection() {
  console.log('🧪 Enhanced Clover API Connection Test\n');
  console.log('📋 Configuration:');
  console.log(`   Merchant ID: ${CLOVER_CONFIG.merchantId}`);
  console.log(`   Testing ${TEST_TOKENS.length} tokens across ${TEST_ENVIRONMENTS.length} environments\n`);
  
  let successfulCombinations = [];
  
  for (const environment of TEST_ENVIRONMENTS) {
    for (const tokenInfo of TEST_TOKENS) {
      const success = await testTokenAndEnvironment(environment, tokenInfo);
      if (success) {
        successfulCombinations.push({
          environment: environment.name,
          token: tokenInfo.name,
          url: environment.url,
          tokenValue: tokenInfo.token
        });
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (successfulCombinations.length > 0) {
    console.log('🎉 SUCCESS! Found working combinations:');
    successfulCombinations.forEach((combo, index) => {
      console.log(`\n   ${index + 1}. ${combo.environment} + ${combo.token}`);
      console.log(`      URL: ${combo.url}`);
      console.log(`      Token: ${combo.tokenValue.substring(0, 12)}...`);
    });
    
    console.log('\n💡 Recommended for your .env.local:');
    const best = successfulCombinations[0];
    console.log(`CLOVER_BASE_URL=${best.url.replace('/v3', '')}`);
    console.log(`CLOVER_API_KEY=${best.tokenValue}`);
    console.log(`CLOVER_MERCHANT_ID=${CLOVER_CONFIG.merchantId}`);
    
  } else {
    console.log('❌ FAILED: No working combinations found.');
    console.log('\n🔧 Next steps:');
    console.log('   1. Log into your Clover Dashboard');
    console.log('   2. Go to Setup > API Tokens');
    console.log('   3. Verify these tokens are still active');
    console.log('   4. Check if your merchant account is properly configured');
    console.log('   5. Ensure you have the right permissions for inventory access');
  }
}

// Run the enhanced test
testCloverConnection();