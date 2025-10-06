#!/bin/bash

# Maharlika Rewards - Database Migration Runner
# This script runs the rewards system migration on your Supabase database

set -e  # Exit on error

echo "🎁 Maharlika Rewards - Database Migration"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if Supabase URL is set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    exit 1
fi

# Extract project ID from URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo "📊 Supabase Project: $PROJECT_ID"
echo "🗄️  Database URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Open Supabase SQL Editor
SUPABASE_SQL_URL="https://supabase.com/dashboard/project/$PROJECT_ID/sql"

echo "✨ Opening Supabase SQL Editor..."
echo ""
echo "📋 INSTRUCTIONS:"
echo "1. SQL Editor will open in your browser"
echo "2. Click 'New Query'"
echo "3. Copy and paste the contents from:"
echo "   scripts/020_maharlika_rewards_system.sql"
echo "4. Click 'Run' (or press Cmd+Enter)"
echo ""
echo "⏳ Opening browser in 3 seconds..."
sleep 3

# Open browser
if command -v open &> /dev/null; then
    open "$SUPABASE_SQL_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$SUPABASE_SQL_URL"
else
    echo "Please visit: $SUPABASE_SQL_URL"
fi

echo ""
echo "📄 Migration file location:"
echo "   $(pwd)/scripts/020_maharlika_rewards_system.sql"
echo ""
echo "💡 After running the migration, verify with:"
echo "   SELECT table_name FROM information_schema.tables"
echo "   WHERE table_schema = 'public'"
echo "   AND (table_name LIKE 'loyalty%' OR table_name LIKE 'reward%');"
echo ""
echo "✅ Expected: 7 tables (loyalty_tiers, loyalty_members, loyalty_transactions,"
echo "              rewards_catalog, reward_redemptions, loyalty_promotions, loyalty_referrals)"
echo ""
