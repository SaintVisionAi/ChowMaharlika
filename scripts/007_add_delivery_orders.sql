-- Create delivery_orders table for tracking third-party delivery orders
CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('grubhub', 'doordash', 'ubereats')),
  external_order_id TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')),
  estimated_delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, external_order_id)
);

-- Create indexes
CREATE INDEX idx_delivery_orders_platform ON delivery_orders(platform);
CREATE INDEX idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX idx_delivery_orders_created_at ON delivery_orders(created_at DESC);

-- Enable RLS
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all delivery orders"
  ON delivery_orders FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage delivery orders"
  ON delivery_orders FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_delivery_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_delivery_orders_updated_at
  BEFORE UPDATE ON delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_orders_updated_at();
