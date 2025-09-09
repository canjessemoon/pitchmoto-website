-- Migration: Create Matching System Tables
-- Date: 2025-09-08
-- Description: Creates investor_theses, startup_matches, and match_interactions tables for the new matching system

-- Create investor_theses table
CREATE TABLE investor_theses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Investment preferences
    min_funding_ask BIGINT DEFAULT 0,
    max_funding_ask BIGINT DEFAULT 10000000,
    preferred_industries TEXT[] DEFAULT '{}',
    preferred_stages TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    
    -- Deal terms preferences
    min_equity_percentage DECIMAL(5,2) DEFAULT 0.0,
    max_equity_percentage DECIMAL(5,2) DEFAULT 100.0,
    
    -- Scoring criteria weights (0.0 to 1.0)
    industry_weight DECIMAL(3,2) DEFAULT 0.25,
    stage_weight DECIMAL(3,2) DEFAULT 0.20,
    funding_weight DECIMAL(3,2) DEFAULT 0.15,
    location_weight DECIMAL(3,2) DEFAULT 0.10,
    traction_weight DECIMAL(3,2) DEFAULT 0.20,
    team_weight DECIMAL(3,2) DEFAULT 0.10,
    
    -- Additional criteria
    keywords TEXT[] DEFAULT '{}',
    exclude_keywords TEXT[] DEFAULT '{}',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT investor_must_be_investor CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = investor_id AND user_type = 'investor'
        )
    ),
    CONSTRAINT valid_funding_range CHECK (min_funding_ask <= max_funding_ask),
    CONSTRAINT valid_equity_range CHECK (min_equity_percentage <= max_equity_percentage),
    CONSTRAINT valid_weights CHECK (
        industry_weight >= 0 AND industry_weight <= 1 AND
        stage_weight >= 0 AND stage_weight <= 1 AND
        funding_weight >= 0 AND funding_weight <= 1 AND
        location_weight >= 0 AND location_weight <= 1 AND
        traction_weight >= 0 AND traction_weight <= 1 AND
        team_weight >= 0 AND team_weight <= 1
    )
);

-- Create startup_matches table
CREATE TABLE startup_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    thesis_id UUID NOT NULL REFERENCES investor_theses(id) ON DELETE CASCADE,
    
    -- Match scoring
    overall_score DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    industry_score DECIMAL(5,2) DEFAULT 0.0,
    stage_score DECIMAL(5,2) DEFAULT 0.0,
    funding_score DECIMAL(5,2) DEFAULT 0.0,
    location_score DECIMAL(5,2) DEFAULT 0.0,
    traction_score DECIMAL(5,2) DEFAULT 0.0,
    team_score DECIMAL(5,2) DEFAULT 0.0,
    
    -- Match metadata
    match_reason TEXT,
    confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'interested', 'not_interested', 'contacted')),
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(startup_id, investor_id, thesis_id),
    CONSTRAINT valid_scores CHECK (
        overall_score >= 0 AND overall_score <= 100 AND
        industry_score >= 0 AND industry_score <= 100 AND
        stage_score >= 0 AND stage_score <= 100 AND
        funding_score >= 0 AND funding_score <= 100 AND
        location_score >= 0 AND location_score <= 100 AND
        traction_score >= 0 AND traction_score <= 100 AND
        team_score >= 0 AND team_score <= 100
    ),
    CONSTRAINT investor_must_be_investor CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = investor_id AND user_type = 'investor'
        )
    )
);

-- Create match_interactions table
CREATE TABLE match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES startup_matches(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    
    -- Interaction details
    interaction_type TEXT NOT NULL CHECK (
        interaction_type IN ('view', 'like', 'pass', 'save', 'contact', 'note')
    ),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT investor_must_be_investor CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = investor_id AND user_type = 'investor'
        )
    )
);

-- Create indexes for performance
CREATE INDEX idx_investor_theses_investor_id ON investor_theses(investor_id);
CREATE INDEX idx_investor_theses_active ON investor_theses(is_active) WHERE is_active = true;

CREATE INDEX idx_startup_matches_startup_id ON startup_matches(startup_id);
CREATE INDEX idx_startup_matches_investor_id ON startup_matches(investor_id);
CREATE INDEX idx_startup_matches_thesis_id ON startup_matches(thesis_id);
CREATE INDEX idx_startup_matches_score ON startup_matches(overall_score DESC);
CREATE INDEX idx_startup_matches_status ON startup_matches(status);
CREATE INDEX idx_startup_matches_created_at ON startup_matches(created_at DESC);

CREATE INDEX idx_match_interactions_match_id ON match_interactions(match_id);
CREATE INDEX idx_match_interactions_investor_id ON match_interactions(investor_id);
CREATE INDEX idx_match_interactions_startup_id ON match_interactions(startup_id);
CREATE INDEX idx_match_interactions_type ON match_interactions(interaction_type);
CREATE INDEX idx_match_interactions_created_at ON match_interactions(created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_investor_theses_updated_at 
    BEFORE UPDATE ON investor_theses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_matches_updated_at 
    BEFORE UPDATE ON startup_matches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE investor_theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_theses
CREATE POLICY "Investors can view their own theses" ON investor_theses
    FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "Investors can create their own theses" ON investor_theses
    FOR INSERT WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own theses" ON investor_theses
    FOR UPDATE USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own theses" ON investor_theses
    FOR DELETE USING (investor_id = auth.uid());

-- RLS Policies for startup_matches
CREATE POLICY "Investors can view their matches" ON startup_matches
    FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "Founders can view matches for their startups" ON startup_matches
    FOR SELECT USING (
        startup_id IN (
            SELECT id FROM startups WHERE founder_id = auth.uid()
        )
    );

CREATE POLICY "System can create matches" ON startup_matches
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Investors can update their match status" ON startup_matches
    FOR UPDATE USING (investor_id = auth.uid());

-- RLS Policies for match_interactions
CREATE POLICY "Investors can view their interactions" ON match_interactions
    FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "Founders can view interactions on their startups" ON match_interactions
    FOR SELECT USING (
        startup_id IN (
            SELECT id FROM startups WHERE founder_id = auth.uid()
        )
    );

CREATE POLICY "Investors can create interactions" ON match_interactions
    FOR INSERT WITH CHECK (investor_id = auth.uid());

-- Grant permissions
GRANT ALL ON investor_theses TO authenticated;
GRANT ALL ON startup_matches TO authenticated;
GRANT ALL ON match_interactions TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE investor_theses IS 'Stores investor investment criteria and preferences for matching';
COMMENT ON TABLE startup_matches IS 'Stores calculated matches between startups and investors with scores';
COMMENT ON TABLE match_interactions IS 'Tracks investor interactions with startup matches';
