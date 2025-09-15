// Test script to verify investment thesis creation with new schema
const { createClient } = require('@supabase/supabase-js');

// Use environment variables directly (make sure they're set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInvestmentThesis() {
  console.log('🧪 Testing investment thesis creation...');
  
  // Test data for the new schema
  const testThesis = {
    investor_id: '123e4567-e89b-12d3-a456-426614174000', // Dummy UUID for testing
    min_funding_ask: 100000,
    max_funding_ask: 2000000,
    preferred_industries: ['AI/ML', 'FinTech', 'SaaS'],
    preferred_stages: ['Pre-Seed', 'Seed', 'Series A'],
    countries: ['US', 'CA', 'GB'], // New country-based system
    no_location_pref: false, // New field
    remote_ok: true, // New field
    industry_weight: 0.25,
    stage_weight: 0.20,
    funding_weight: 0.15,
    location_weight: 0.10,
    traction_weight: 0.20,
    team_weight: 0.10,
    keywords: ['AI', 'machine learning', 'automation'],
    exclude_keywords: ['crypto', 'gambling'],
    is_active: true
  };
  
  try {
    // Test table exists and can insert
    const { data, error } = await supabase
      .from('investor_theses')
      .insert(testThesis)
      .select();
    
    if (error) {
      console.error('❌ Insert failed:', error.message);
      return;
    }
    
    console.log('✅ Successfully created investment thesis!');
    console.log('📊 Data:', data[0]);
    
    // Test the new fields specifically
    const thesis = data[0];
    console.log('\n🌍 Location Preferences:');
    console.log(`  Countries: ${thesis.countries?.join(', ') || 'None'}`);
    console.log(`  No location preference: ${thesis.no_location_pref}`);
    console.log(`  Remote OK: ${thesis.remote_ok}`);
    
    // Clean up - delete the test record
    const { error: deleteError } = await supabase
      .from('investor_theses')
      .delete()
      .eq('id', thesis.id);
    
    if (deleteError) {
      console.warn('⚠️ Failed to clean up test record:', deleteError.message);
    } else {
      console.log('🧹 Test record cleaned up successfully');
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

async function testCountriesValidation() {
  console.log('\n🌐 Testing country validation...');
  
  // Test with no_location_pref = true (should allow empty countries)
  const globalThesis = {
    investor_id: '123e4567-e89b-12d3-a456-426614174001',
    countries: [], // Empty array
    no_location_pref: true, // This should make it valid
    remote_ok: true
  };
  
  try {
    const { data, error } = await supabase
      .from('investor_theses')
      .insert(globalThesis)
      .select();
    
    if (error) {
      console.error('❌ Global preference test failed:', error.message);
    } else {
      console.log('✅ Global preference validation works!');
      
      // Clean up
      await supabase.from('investor_theses').delete().eq('id', data[0].id);
    }
  } catch (err) {
    console.error('💥 Global preference test error:', err);
  }
}

// Run tests
testInvestmentThesis()
  .then(() => testCountriesValidation())
  .then(() => {
    console.log('\n🎉 All tests completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('🚨 Test suite failed:', err);
    process.exit(1);
  });
