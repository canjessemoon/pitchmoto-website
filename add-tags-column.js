// Script to add tags column to startups table
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function addTagsColumn() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )

  console.log('Adding tags column to startups table...')

  try {
    // Add tags column
    const { error } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE startups 
        ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
        
        CREATE INDEX IF NOT EXISTS idx_startups_tags ON startups USING GIN (tags);
      `
    })

    if (error) {
      console.error('Error adding tags column:', error)
    } else {
      console.log('Successfully added tags column to startups table')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

addTagsColumn()