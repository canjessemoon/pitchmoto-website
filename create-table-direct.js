const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
});

async function createInvestorThesesTable() {
  console.log('Creating investor_theses table...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS investor_theses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        investor_id UUID NOT NULL,
        
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
  `;

  try {
    // Use the REST API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createTableSQL })
    });

    if (!response.ok) {
      console.log('❌ HTTP Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Table creation response:', result);

    // Verify the table was created
    const { data: testData, error: testError } = await supabase
      .from('investor_theses')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Table verification failed:', testError.message);
    } else {
      console.log('✅ investor_theses table created and accessible!');
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

createInvestorThesesTable();
