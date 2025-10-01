#!/usr/bin/env node

// Test Clover API with 204 response handling
const CLOVER_CONFIG = {
  merchantId: '526163795887',
  apiKey: '9a135bb3-8049-d54a-91d6-67a08b2dc9c9'
};

async function testClover204() {
  console.log('🧪 Testing Clover API with 204 Response Handling\n');
  
  const endpoints = [
    {
      name: 'Merchant Info',
      url: `https://api.clover.com/merchants/${CLOVER_CONFIG.merchantId}`
    },
    {
      name: 'Items/Inventory',
      url: `https://api.clover.com/merchants/${CLOVER_CONFIG.merchantId}/items`
    },
    {
      name: 'Categories',
      url: `https://api.clover.com/merchants/${CLOVER_CONFIG.merchantId}/categories`
    },
    {
      name: 'Orders',
      url: `https://api.clover.com/merchants/${CLOVER_CONFIG.merchantId}/orders`
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
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.status === 204) {
        console.log('✅ 204 No Content - This usually means the request worked but no data available');
        console.log('   This could indicate:');
        console.log('   - Empty inventory/no items set up in Clover');
        console.log('   - Correct authentication but no data');
        console.log('   - Or it might be a different API version');
        
      } else if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ SUCCESS with data!');
          
          if (data.elements) {
            console.log(`   Found ${data.elements.length} items`);
            if (data.elements.length > 0) {
              console.log(`   Sample: ${JSON.stringify(data.elements[0], null, 2)}`);
            }
          } else {
            console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
          }
        } else {
          const text = await response.text();
          console.log(`✅ SUCCESS: ${text}`);
        }
        
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText}`);
        
        if (response.status === 401) {
          console.log('   🔑 Authentication issue - API key may be invalid or expired');
        } else if (response.status === 403) {
          console.log('   🚫 Permission issue - API key lacks required permissions');
        } else if (response.status === 404) {
          console.log('   🔍 Endpoint not found - merchant ID may be incorrect');
        }
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
    
    console.log(''); // spacer
  }
  
  // Try to test with the private token as well
  console.log('\n🔄 Testing with private token...');
  const privateToken = 'b8970583-8365-bee2-54ec-dc2f2ad8194f';
  
  try {
    const response = await fetch(
      `https://api.clover.com/merchants/${CLOVER_CONFIG.merchantId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${privateToken}`,
          'Accept': 'application/json',
        }
      }
    );
    
    console.log(`Private token status: ${response.status}`);
    
    if (response.status === 204) {
      console.log('✅ Private token also returns 204 - likely working but no inventory data');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Private token works with data!');
      console.log(`   Found ${data.elements ? data.elements.length : 'unknown'} items`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Private token failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Private token error: ${error.message}`);
  }
}

testClover204();