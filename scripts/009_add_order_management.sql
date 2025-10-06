-- ================================================
-- Migration 009: Order Management & AI Actions
-- Purpose: Enable order cancellation and AI action tracking
-- ================================================

-- Add cancellation fields to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES profiles(id);

-- Add index for cancelled orders lookup
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at) WHERE cancelled_at IS NOT NULL;

-- Create AI actions logging table
CREATE TABLE IF NOT EXISTS ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID,
  action_type TEXT NOT NULL, -- 'cancel_order', 'modify_order', 'refund_order', etc.
  action_data JSONB NOT NULL, -- Store action details
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, executed, failed, cancelled
  result JSONB, -- Store execution result
  error_message TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for AI actions
CREATE INDEX IF NOT EXISTS idx_ai_actions_user_id ON ai_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_status ON ai_actions(status);
CREATE INDEX IF NOT EXISTS idx_ai_actions_created_at ON ai_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_actions_conversation_id ON ai_actions(conversation_id);

-- Create AI conversations table for persistent memory
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  messages JSONB NOT NULL DEFAULT '[]', -- Array of message objects
  context JSONB, -- Cart, orders, preferences, etc.
  summary TEXT, -- AI-generated summary of conversation
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for AI conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- Add email preferences to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"marketing": true, "orders": true, "support": true, "promotions": true}';

-- Enable RLS on new tables
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_actions
CREATE POLICY "Users can view their own AI actions"
  ON ai_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI actions"
  ON ai_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending AI actions"
  ON ai_actions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all AI actions"
  ON ai_actions FOR ALL
  USING (is_admin());

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations"
  ON ai_conversations FOR SELECT
  USING (is_admin());

-- Create trigger to update updated_at on ai_actions
CREATE OR REPLACE FUNCTION update_ai_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_actions_updated_at
  BEFORE UPDATE ON ai_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_actions_updated_at();

-- Create trigger to update updated_at on ai_conversations
CREATE OR REPLACE FUNCTION update_ai_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversations_updated_at();

-- Add check constraint for order cancellation
ALTER TABLE orders ADD CONSTRAINT check_cancellation_fields
  CHECK (
    (cancelled_at IS NULL AND cancellation_reason IS NULL AND cancelled_by IS NULL) OR
    (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL)
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 009 completed successfully!';
  RAISE NOTICE '   - Added order cancellation fields';
  RAISE NOTICE '   - Created ai_actions table';
  RAISE NOTICE '   - Created ai_conversations table';
  RAISE NOTICE '   - Added email_preferences to profiles';
  RAISE NOTICE '   - Enabled RLS policies';
END $$;
