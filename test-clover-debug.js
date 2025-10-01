#!/usr/bin/env node

// Direct test of Clover API with your credentials
const CLOVER_CONFIG = {
  merchantId: '526163795887',
  apiKey: '9a135bb3-8049-d54a-91d6-67a08b2dc9c9',
  baseUrl: 'https://api.clover.com/v3'
};

async function testCloverDirect() {
  console.log('🧪 Direct Clover API Test\n');
  
  try {
    console.log('📋 Configuration:');
    console.log(`   Merchant ID: ${CLOVER_CONFIG.merchantId}`);
    console.log(`   API Key: ${CLOVER_CONFIG.apiKey.substring(0, 12)}...`);
    console.log(`   Base URL: ${CLOVER_CONFIG.baseUrl}\n`);
    
    // Test different endpoint patterns to debug
    const endpoints = [
      // Try without /v3 in case that's the issue
      {
        name: 'Merchant (no v3)',
        url: `https://api.clover.com/merchants/${CLOVER_CONFIG.merchantId}`
      },
      // Try with /v3
      {
        name: 'Merchant (with v3)', 
        url: `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}`
      },
      // Try inventory
      {
        name: 'Inventory (with v3)',
        url: `${CLOVER_CONFIG.baseUrl}/merchants/${CLOVER_CONFIG.merchantId}/items`
      }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🌐 Testing ${endpoint.name}...`);
      console.log(`   URL: ${endpoint.url}`);
      
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${CLOVER_CONFIG.apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ SUCCESS!');
          
          if (endpoint.name.includes('Inventory')) {
            const count = data.elements ? data.elements.length : 0;
            console.log(`   Found ${count} items`);
            if (count > 0) {
              console.log(`   Sample: ${data.elements[0].name}`);
            }
          } else if (data.name) {
            console.log(`   Merchant: ${data.name}`);
          }
          
          // If we found a working endpoint, we can stop here
          console.log('\n🎉 Found working configuration!');
          console.log('Update your edge function to use:');
          console.log(`   Base URL: ${endpoint.url.includes('/v3') ? 'https://api.clover.com' : 'https://api.clover.com'}`);
          console.log(`   API Key: ${CLOVER_CONFIG.apiKey}`);
          console.log(`   Merchant ID: ${CLOVER_CONFIG.merchantId}`);
          break;
          
        } else {
          const errorText = await response.text();
          console.log(`❌ Failed: ${errorText.substring(0, 100)}...`);
          
          // Check for specific error patterns
          if (response.status === 401) {
            console.log('   🔑 Authentication issue');
          } else if (response.status === 403) {
            console.log('   🚫 Permission issue');
          } else if (response.status === 404) {
            console.log('   🔍 Endpoint not found');
          }
        }
        
      } catch (error) {
        console.log(`❌ Network error: ${error.message}`);
      }
      
      console.log(''); // spacer
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCloverDirect();