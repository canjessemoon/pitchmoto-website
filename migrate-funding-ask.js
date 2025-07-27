import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function addFundingAskColumn() {
  try {
    console.log('Adding funding_ask column to pitches table...')
    
    // Add the column
    const { error: addColumnError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE pitches ADD COLUMN IF NOT EXISTS funding_ask BIGINT;'
    })
    
    if (addColumnError) {
      console.error('Error adding column:', addColumnError)
      return
    }
    
    console.log('Column added successfully')
    
    // Set default values
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'UPDATE pitches SET funding_ask = 100000 WHERE funding_ask IS NULL;'
    })
    
    if (updateError) {
      console.error('Error setting defaults:', updateError)
      return
    }
    
    console.log('Default values set')
    
    // Make NOT NULL
    const { error: notNullError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE pitches ALTER COLUMN funding_ask SET NOT NULL;'
    })
    
    if (notNullError) {
      console.error('Error setting NOT NULL:', notNullError)
      return
    }
    
    console.log('Column set to NOT NULL')
    
    // Add constraint
    const { error: constraintError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE pitches ADD CONSTRAINT IF NOT EXISTS pitches_funding_ask_min CHECK (funding_ask >= 1000);'
    })
    
    if (constraintError) {
      console.error('Error adding constraint:', constraintError)
      return
    }
    
    console.log('Constraint added successfully')
    console.log('Schema migration completed!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

addFundingAskColumn()
