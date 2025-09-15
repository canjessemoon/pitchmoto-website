-- Create investor_theses table first (since it doesn't exist)
CREATE TABLE IF NOT EXISTS investor_theses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investor_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    -- Investment preferences
    min_funding_ask BIGINT DEFAULT 0,
    max_funding_ask BIGINT DEFAULT 10000000,
    preferred_industries TEXT[] DEFAULT '{}',
    preferred_stages TEXT[] DEFAULT '{}',
    countries TEXT[] DEFAULT '{}',
    
    -- New location preferences
    no_location_pref BOOLEAN DEFAULT false,
    remote_ok BOOLEAN DEFAULT true,
    
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
            SELECT 1 FROM user_profiles 
            WHERE user_id = investor_id AND user_type = 'investor'
        )
    ),
    CONSTRAINT valid_funding_range CHECK (min_funding_ask <= max_funding_ask),
    CONSTRAINT valid_weights CHECK (
        industry_weight >= 0 AND industry_weight <= 1 AND
        stage_weight >= 0 AND stage_weight <= 1 AND
        funding_weight >= 0 AND funding_weight <= 1 AND
        location_weight >= 0 AND location_weight <= 1 AND
        traction_weight >= 0 AND traction_weight <= 1 AND
        team_weight >= 0 AND team_weight <= 1
    ),
    CONSTRAINT location_preference_required 
    CHECK (no_location_pref = true OR array_length(countries, 1) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_theses_investor_id ON investor_theses(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_theses_active ON investor_theses(is_active) WHERE is_active = true;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_investor_theses_updated_at 
    BEFORE UPDATE ON investor_theses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE investor_theses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_theses
CREATE POLICY "Investors can view their own theses" ON investor_theses
    FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "Investors can create their own theses" ON investor_theses
    FOR INSERT WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own theses" ON investor_theses
    FOR UPDATE USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own theses" ON investor_theses
    FOR DELETE USING (investor_id = auth.uid());
