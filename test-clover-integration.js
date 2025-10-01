#!/usr/bin/env node

// Test Clover API Integration
// Run this after enabling the online shopping toggle

const MERCHANT_ID = '526163795887';
const API_KEY = '9a135bb3-8049-d54a-91d6-67a08b2dc9c9'; // Updated from .env.local
const BASE_URL = 'https://api.clover.com';

async function testCloverIntegration() {
    console.log('[TEST] Starting Clover API Integration Test...\n');

    try {
        // Test 1: Fetch Categories
        console.log('📂 Testing Categories API...');
        const categoriesResponse = await fetch(
            `${BASE_URL}/v3/merchants/${MERCHANT_ID}/categories`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(`   Status: ${categoriesResponse.status}`);
        
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            console.log(`   ✅ Found ${categories.elements?.length || 0} categories`);
            
            if (categories.elements && categories.elements.length > 0) {
                console.log('   Categories:');
                categories.elements.slice(0, 5).forEach(cat => {
                    console.log(`     - ${cat.name} (ID: ${cat.id})`);
                });
                if (categories.elements.length > 5) {
                    console.log(`     ... and ${categories.elements.length - 5} more`);
                }
            }
        } else {
            console.log(`   ❌ Failed: ${categoriesResponse.statusText}`);
            const errorText = await categoriesResponse.text();
            console.log(`   Error: ${errorText}`);
        }

        console.log();

        // Test 2: Fetch Items
        console.log('🍽️  Testing Items API...');
        const itemsResponse = await fetch(
            `${BASE_URL}/v3/merchants/${MERCHANT_ID}/items?limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(`   Status: ${itemsResponse.status}`);
        
        if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            console.log(`   ✅ Found ${items.elements?.length || 0} items (showing first 10)`);
            
            if (items.elements && items.elements.length > 0) {
                console.log('   Sample Items:');
                items.elements.forEach(item => {
                    const price = item.price ? `$${(item.price / 100).toFixed(2)}` : 'No price';
                    console.log(`     - ${item.name} (${price})`);
                });
            }
        } else {
            console.log(`   ❌ Failed: ${itemsResponse.statusText}`);
            const errorText = await itemsResponse.text();
            console.log(`   Error: ${errorText}`);
        }

        console.log('\n🎉 Test completed!');
        
        // Success message
        if (categoriesResponse.ok && itemsResponse.ok) {
            console.log('\n✅ INTEGRATION SUCCESS!');
            console.log('Your Clover online shopping is now enabled and API is working!');
            console.log('You can now run your inventory sync in your Next.js app.');
        } else {
            console.log('\n⚠️  PARTIAL SUCCESS');
            console.log('Some API calls failed. Check the errors above.');
            console.log('You may need to wait a few minutes after enabling online shopping.');
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure you enabled the "Clover Online Shopping" toggle');
        console.log('2. Wait 2-5 minutes after enabling for API to activate');
        console.log('3. Check your internet connection');
        console.log('4. Verify your API key is correct');
    }
}

testCloverIntegration();