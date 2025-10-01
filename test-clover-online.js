#!/usr/bin/env node

// Test Clover Online Shopping API
// This tests the online shopping specific endpoints

const MERCHANT_ID = '526163795887';
const API_KEY = '201e59e6-682a-6a2d-b481-632de79ad2fe';
const BASE_URL = 'https://api.clover.com';

async function testCloverOnlineAPI() {
    console.log('[TEST] Testing Clover Online Shopping API...\n');

    const endpoints = [
        {
            name: 'Online Categories',
            url: `/v3/merchants/${MERCHANT_ID}/online_categories`,
            description: 'Categories for online shopping'
        },
        {
            name: 'Online Items', 
            url: `/v3/merchants/${MERCHANT_ID}/online_items?limit=5`,
            description: 'Items available for online shopping'
        },
        {
            name: 'Regular Categories',
            url: `/v3/merchants/${MERCHANT_ID}/categories`,
            description: 'All categories (should work now)'
        },
        {
            name: 'Regular Items',
            url: `/v3/merchants/${MERCHANT_ID}/items?limit=5`,
            description: 'All items (should work now)'
        }
    ];

    for (const endpoint of endpoints) {
        console.log(`🔍 Testing ${endpoint.name}...`);
        console.log(`   ${endpoint.description}`);
        
        try {
            const response = await fetch(`${BASE_URL}${endpoint.url}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`   Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                const count = data.elements?.length || 0;
                console.log(`   ✅ Success! Found ${count} items`);
                
                if (data.elements && data.elements.length > 0) {
                    console.log(`   Sample data:`);
                    data.elements.slice(0, 3).forEach((item, index) => {
                        if (item.name) {
                            const price = item.price ? ` - $${(item.price / 100).toFixed(2)}` : '';
                            console.log(`     ${index + 1}. ${item.name}${price}`);
                        } else {
                            console.log(`     ${index + 1}. ${JSON.stringify(item).substring(0, 60)}...`);
                        }
                    });
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Failed: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log();
    }

    // Test the online shopping site directly
    console.log('🌐 Testing Online Shopping Website...');
    try {
        const siteResponse = await fetch('https://chowmaharlika.cloveronline.com');
        console.log(`   Status: ${siteResponse.status} ${siteResponse.statusText}`);
        if (siteResponse.ok) {
            console.log('   ✅ Your Clover online shopping site is live!');
        } else {
            console.log('   ⚠️  Site may still be setting up...');
        }
    } catch (error) {
        console.log(`   ❌ Site Error: ${error.message}`);
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('If you see ✅ success above, your integration is ready!');
    console.log('If you see ❌ errors, wait 5-10 minutes and try again.');
    console.log('The API can take time to activate after enabling online shopping.');
}

testCloverOnlineAPI();