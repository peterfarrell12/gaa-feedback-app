const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTables() {
  console.log('🔍 Testing database tables...')
  
  try {
    // Test each table
    const tables = ['users', 'events', 'templates', 'sections', 'questions', 'forms', 'responses']
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: ${count} records`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }
    
    // Try to select from templates specifically
    console.log('\n🔍 Detailed templates check:')
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
    
    if (error) {
      console.log('❌ Templates error:', error)
    } else {
      console.log('✅ Templates data:', templates)
    }
    
  } catch (error) {
    console.error('❌ General error:', error)
  }
}

testTables()