// Quick script to check what's in the database
const { createClient } = require('@supabase/supabase-js')

// Use the same URLs from production since they work
const supabaseUrl = 'https://awbtuhmuefvfbumywvqn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3YnR1aG11ZWZ2ZmJ1bXl3dnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1ODQwNzQsImV4cCI6MjA1MTE2MDA3NH0.gT5CYZ1FYqx5P3FChgfp-5m3nvIXTMGmLCGlcRJJhsM'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n')
  
  // Check pitches table structure
  console.log('📋 PITCHES TABLE:')
  try {
    const { data: pitches, error } = await supabase
      .from('pitches')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Error fetching pitches:', error.message)
    } else {
      console.log(`Found ${pitches?.length || 0} pitches`)
      if (pitches && pitches.length > 0) {
        console.log('First pitch structure:', Object.keys(pitches[0]))
        console.log('Sample pitch:', pitches[0])
      }
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
  
  console.log('\n🏢 STARTUPS TABLE:')
  try {
    const { data: startups, error } = await supabase
      .from('startups')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Error fetching startups:', error.message)
    } else {
      console.log(`Found ${startups?.length || 0} startups`)
      if (startups && startups.length > 0) {
        console.log('First startup structure:', Object.keys(startups[0]))
        console.log('Sample startup:', startups[0])
      }
    }
  } catch (err) {
    console.error('Error:', err.message)
  }

  // Check if there are specific status values
  console.log('\n📊 PITCH STATUS CHECK:')
  try {
    const { data: allPitches, error } = await supabase
      .from('pitches')
      .select('id, title, status')
    
    if (error) {
      console.log('No status column or error:', error.message)
    } else {
      console.log('All pitches with status:', allPitches)
    }
  } catch (err) {
    console.log('Status column might not exist:', err.message)
  }
}

checkDatabase().then(() => {
  console.log('\n✅ Database check complete')
  process.exit(0)
}).catch(err => {
  console.error('❌ Database check failed:', err)
  process.exit(1)
})
