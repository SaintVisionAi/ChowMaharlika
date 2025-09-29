-- Add Clover integration fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS clover_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_products_clover_id ON products(clover_id);

-- Add Clover order ID to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS clover_order_id TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_clover_id ON orders(clover_order_id);

-- Add last sync timestamp
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
