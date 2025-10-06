-- Create SaintAthena interactions table for analytics and improvement
CREATE TABLE IF NOT EXISTS public.saint_athena_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'search', 'list_processing', 'deal_recommendation', 'chat'
    query_text TEXT,
    products_found INTEGER DEFAULT 0,
    deals_suggested INTEGER DEFAULT 0,
    conversion_success BOOLEAN DEFAULT FALSE,
    response_time_ms INTEGER,
    session_id UUID,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saint_athena_interactions_user_id ON public.saint_athena_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_saint_athena_interactions_type ON public.saint_athena_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_saint_athena_interactions_created ON public.saint_athena_interactions(created_at);

-- Enable RLS
ALTER TABLE public.saint_athena_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own interactions
CREATE POLICY "Users can view their own interactions"
    ON public.saint_athena_interactions
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Allow anonymous interactions (for tracking)
CREATE POLICY "Allow anonymous interactions"
    ON public.saint_athena_interactions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Admin can view all interactions
CREATE POLICY "Admin can view all interactions"
    ON public.saint_athena_interactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

COMMENT ON TABLE public.saint_athena_interactions IS 'Tracks user interactions with SaintAthena AI assistant for analytics and improvement';
