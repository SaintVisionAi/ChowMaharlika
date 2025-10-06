#!/bin/bash

# SaintAthena API Testing Script
# Run this after starting the dev server: pnpm dev

BASE_URL="http://localhost:3000/api/saint-athena"

echo "🌸 Testing SaintAthena APIs 🌸"
echo "================================"
echo ""

# Test 1: Search API Health Check
echo "1️⃣ Testing Search API (Health Check)..."
curl -s -X GET "$BASE_URL/search" | jq '.'
echo ""

# Test 2: Search for shrimp
echo "2️⃣ Testing Search API (Search for 'shrimp')..."
curl -s -X POST "$BASE_URL/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "shrimp", "options": {"limit": 3}}' | jq '.matches[:3] | .[] | {name: .product.name, price: .product.price, matchScore}'
echo ""

# Test 3: Search with Filipino name
echo "3️⃣ Testing Filipino Search ('hipon')..."
curl -s -X POST "$BASE_URL/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "hipon", "options": {"limit": 3}}' | jq '.matches[:3] | .[] | {name: .product.name, relevanceReason}'
echo ""

# Test 4: Shopping List
echo "4️⃣ Testing Shopping List ('shrimp, salmon, rice')..."
curl -s -X POST "$BASE_URL/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "shrimp, salmon, rice", "mode": "list"}' | jq '.items | .[] | {query, bestMatch: .bestMatch.product.name}'
echo ""

# Test 5: Deals API Health
echo "5️⃣ Testing Deals API (Health Check)..."
curl -s -X GET "$BASE_URL/deals" | jq '.'
echo ""

# Test 6: Get Best Deals
echo "6️⃣ Testing Best Deals..."
curl -s -X POST "$BASE_URL/deals" \
  -H "Content-Type: application/json" \
  -d '{"action": "best_deals", "limit": 5}' | jq '.deals[:5] | .[] | {product: .product.name, savings: .savingsPercentage, reason: .dealReason}'
echo ""

# Test 7: Daily Specials
echo "7️⃣ Testing Daily Specials..."
curl -s -X POST "$BASE_URL/deals" \
  -H "Content-Type: application/json" \
  -d '{"action": "daily_specials"}' | jq '.specials[:3] | .[] | {name, price, discount_percentage}'
echo ""

# Test 8: Chat API Health
echo "8️⃣ Testing Chat API (Health Check)..."
curl -s -X GET "$BASE_URL/chat" | jq '.'
echo ""

# Test 9: Chat Message (if Anthropic key is set)
echo "9️⃣ Testing Chat (Simple Message)..."
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What fresh seafood do you have today?"}' | jq '{mode, message: .message[:200]}'
echo ""

# Test 10: List Processing via Chat
echo "🔟 Testing List Processing via Chat..."
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "I need shrimp, salmon, and soy sauce", "mode": "list"}' | jq '{totalMatches: .processedList.totalMatches, dealsFound: .processedList.dealsFound, total: .processedList.estimatedTotal}'
echo ""

echo "================================"
echo "✅ All tests complete!"
echo ""
echo "🌸 SaintAthena is ready to serve! 🌸"
