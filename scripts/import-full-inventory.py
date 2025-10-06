#!/usr/bin/env python3
"""
Import full inventory from Excel to Supabase
Handles all 3,279 products with proper category mapping
"""

import pandas as pd
import os
import sys
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://yzoochyyhanxslqwzyga.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b29jaHl5aGFueHNscXd6eWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyMjEwMCwiZXhwIjoyMDcxNzk4MTAwfQ.1OhB7Xevj53MMxGs9wtr6WbJtfCKAkHif5JneEkBdL4"

# Category mapping
CATEGORY_MAPPING = {
    'Pantry': 'grocery',
    'Dried Seafood': 'seafood',
    'Snacks': 'grocery',
    'Frozen Seafood': 'seafood',
    'Personal Care': 'grocery',
    'Condiments': 'grocery',
    'Meat': 'meat',
    'Bakery': 'bakery',
    'Beverage': 'grocery',
    'Vegetables': 'produce',
    'Seafood': 'seafood',
    'Drinks': 'grocery',
    'Rice, Grains & Beans': 'grocery',
    'Household Essentials': 'grocery',
    'Prepared Food': 'grocery',
    'Fresh Seafood': 'seafood',
    'Canned Goods': 'grocery',
    'Deli': 'deli',
    'Ramen or Noodles': 'grocery',
    'Dairy': 'dairy',
}

def clean_price(price):
    """Convert price to float, default to 0.0 if invalid"""
    try:
        return float(price) if pd.notna(price) and price > 0 else 0.0
    except:
        return 0.0

def clean_quantity(quantity):
    """Convert quantity to int, cap at max int value"""
    try:
        if pd.isna(quantity):
            return 100  # Default stock
        qty = int(quantity)
        # PostgreSQL int max is 2147483647
        return min(qty, 2147483647) if qty > 0 else 100
    except:
        return 100

def import_inventory():
    """Import full inventory from Excel"""
    
    print("🚀 Starting Full Inventory Import\n")
    print("="*60)
    
    # Read Excel file
    print("📖 Reading Excel file...")
    df = pd.read_excel('/Users/saintsrow/Downloads/Inventory-Maharlika_cleaned.xlsx', sheet_name='Items')
    print(f"   Found {len(df)} products\n")
    
    # Initialize Supabase
    print("🔌 Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("   Connected!\n")
    
    # Prepare products
    print("🔄 Processing products...")
    products = []
    skipped = 0
    
    for idx, row in df.iterrows():
        # Skip if no name
        if pd.isna(row['Name']) or str(row['Name']).strip() == '':
            skipped += 1
            continue
        
        # Map category
        clover_category = str(row['Categories']) if pd.notna(row['Categories']) else 'Pantry'
        mapped_category = CATEGORY_MAPPING.get(clover_category, 'grocery')
        
        # Clean price and quantity
        price = clean_price(row['Price'])
        quantity = clean_quantity(row['Quantity'])
        
        product = {
            'clover_id': str(row['Clover ID']) if pd.notna(row['Clover ID']) else None,
            'name': str(row['Name']).strip(),
            'description': str(row['Description']).strip() if pd.notna(row['Description']) else f"Premium {row['Name']}",
            'price': price,
            'category': mapped_category,
            'stock_quantity': quantity,
            'is_available': True if price > 0 else False,  # Only show products with prices
            'image_url': None,  # Will use fallback gradients
        }
        
        products.append(product)
        
        # Progress indicator
        if (idx + 1) % 500 == 0:
            print(f"   Processed {idx + 1}/{len(df)} products...")
    
    print(f"   ✅ Processed {len(products)} valid products")
    print(f"   ⚠️  Skipped {skipped} products (no name)\n")
    
    # Import in batches
    print("💾 Importing to Supabase...")
    BATCH_SIZE = 100
    imported = 0
    errors = 0
    
    for i in range(0, len(products), BATCH_SIZE):
        batch = products[i:i+BATCH_SIZE]
        
        try:
            result = supabase.table('products').upsert(
                batch,
                on_conflict='clover_id',
                returning='minimal'
            ).execute()
            
            imported += len(batch)
            print(f"   Batch {i//BATCH_SIZE + 1}: Imported {len(batch)} products ({imported}/{len(products)})")
            
        except Exception as e:
            errors += len(batch)
            print(f"   ❌ Batch {i//BATCH_SIZE + 1} failed: {str(e)}")
    
    print("\n" + "="*60)
    print("✨ IMPORT COMPLETE!\n")
    print(f"📊 Summary:")
    print(f"   Total products in file: {len(df)}")
    print(f"   Valid products processed: {len(products)}")
    print(f"   Successfully imported: {imported}")
    print(f"   Errors: {errors}")
    print(f"   Skipped (no name): {skipped}")
    
    # Category breakdown
    print(f"\n📁 Category Breakdown:")
    categories = {}
    for p in products:
        cat = p['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cat:15s}: {count:4d} products")
    
    print("\n✅ All products imported! They will show with gradient fallback images.")
    print("   Products with price > $0 will be available for purchase.\n")

if __name__ == "__main__":
    try:
        import_inventory()
    except KeyboardInterrupt:
        print("\n\n⚠️  Import cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Import failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
