// Script to add tags column using supabase admin client
import { createAdminClient } from './src/lib/supabase-admin.js'

async function addTagsColumn() {
  const adminClient = createAdminClient()
  
  console.log('Adding tags column to startups table...')

  try {
    // Check if column already exists
    const { data: columns, error: columnError } = await adminClient
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'startups')
      .eq('column_name', 'tags')

    if (columnError) {
      console.error('Error checking column:', columnError)
      return
    }

    if (columns && columns.length > 0) {
      console.log('Tags column already exists')
      return
    }

    // Add the column using raw SQL
    const { error } = await adminClient.rpc('exec_sql', {
      sql: `
        ALTER TABLE startups 
        ADD COLUMN tags TEXT[] DEFAULT '{}';
        
        CREATE INDEX IF NOT EXISTS idx_startups_tags ON startups USING GIN (tags);
        
        COMMENT ON COLUMN startups.tags IS 'Cross-industry tags for enhanced categorization and search';
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