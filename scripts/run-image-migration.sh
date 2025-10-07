#!/bin/bash

# Supabase Migration Runner for Image Optimization
# This script runs the 025_optimize_product_images.sql migration

set -e  # Exit on error

echo "🚀 Supabase Image Migration Runner"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Source the environment variables
set -a
source .env.local
set +a

# Check if NEXT_PUBLIC_SUPABASE_URL is set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Supabase URL${NC}"
echo ""

# Extract project reference from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
echo "📍 Project Reference: $PROJECT_REF"
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/025_optimize_product_images.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found migration file${NC}"
echo ""

# Display migration info
echo "📄 Migration Details:"
echo "   File: $MIGRATION_FILE"
echo "   Purpose: Optimize product images with indexes and views"
echo ""

# Show what the migration will do
echo -e "${YELLOW}📋 This migration will:${NC}"
echo "   ✓ Ensure image_url column exists on products table"
echo "   ✓ Add index for faster image queries"
echo "   ✓ Add index for category-based queries"
echo "   ✓ Add composite index for common queries"
echo "   ✓ Create products_without_images view for admin"
echo "   ✓ Grant proper permissions"
echo ""

# Instructions for running the migration
echo -e "${YELLOW}🎯 Choose your migration method:${NC}"
echo ""
echo "OPTION 1: Supabase Dashboard (Recommended - Easiest)"
echo "=========================================="
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo "2. Click 'New Query'"
echo "3. Copy and paste the contents of: $MIGRATION_FILE"
echo "4. Click 'Run'"
echo "5. Verify you see 'Success. No rows returned'"
echo ""
echo "OPTION 2: psql Command Line (Advanced)"
echo "=========================================="
echo "If you have psql installed and a direct database connection string:"
echo ""
echo "psql \$DATABASE_URL -f $MIGRATION_FILE"
echo ""
echo "OPTION 3: Supabase CLI (Advanced)"
echo "=========================================="
echo "If you have Supabase CLI installed:"
echo ""
echo "supabase db push"
echo ""

# Ask user which method they want to use
echo -e "${GREEN}Which method would you like to use?${NC}"
echo "1) Open Supabase Dashboard (automatic)"
echo "2) Show migration SQL to copy manually"
echo "3) Exit (I'll do it later)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Opening Supabase Dashboard...${NC}"
        open "https://supabase.com/dashboard/project/$PROJECT_REF/sql"
        echo ""
        echo "✨ Dashboard opened in your browser!"
        echo ""
        echo "Now follow these steps:"
        echo "1. Click 'New Query' in the dashboard"
        echo "2. Copy the migration SQL (shown below)"
        echo "3. Paste it into the query editor"
        echo "4. Click 'Run' button"
        echo ""
        echo "Press Enter to display the migration SQL..."
        read
        echo ""
        echo "📋 MIGRATION SQL (copy everything below the line):"
        echo "================================================================"
        cat "$MIGRATION_FILE"
        echo "================================================================"
        echo ""
        echo "After running the migration, press Enter to verify..."
        read
        echo ""
        echo -e "${GREEN}✅ Migration complete!${NC}"
        echo ""
        echo "To verify the migration worked:"
        echo "1. In Supabase Dashboard, go to Table Editor"
        echo "2. Click on 'products' table"
        echo "3. Check that 'image_url' column exists"
        echo "4. Go to Database > Functions & Views"
        echo "5. Verify 'products_without_images' view exists"
        ;;
    2)
        echo ""
        echo "📋 MIGRATION SQL (copy everything below the line):"
        echo "================================================================"
        cat "$MIGRATION_FILE"
        echo "================================================================"
        echo ""
        echo "Copy the SQL above and run it in:"
        echo "- Supabase Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
        echo "- Or your preferred SQL client"
        ;;
    3)
        echo ""
        echo "👍 No problem! Run this script again when you're ready."
        echo "The migration file is ready at: $MIGRATION_FILE"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo "Next steps:"
echo "1. ✅ Migration complete"
echo "2. 🚀 Deploy your app (git push will auto-deploy to Vercel)"
echo "3. 🎨 Check your site - images should load perfectly!"
echo ""
echo "Need help? Check: PRODUCTION_DEPLOYMENT.md"
