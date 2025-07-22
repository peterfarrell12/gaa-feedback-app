const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Database error:', error.message)
      console.log('💡 Make sure you\'ve run the schema SQL in Supabase dashboard')
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Test if we have sample data
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('*')
    
    if (templatesError) {
      console.error('❌ Templates table error:', templatesError.message)
      return false
    }
    
    console.log(`✅ Found ${templates.length} templates in database`)
    
    if (templates.length > 0) {
      console.log('📋 Sample templates:')
      templates.forEach(template => {
        console.log(`  - ${template.name} (${template.type})`)
      })
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Database setup complete! You can now run: npm run dev -- --port 3009')
  } else {
    console.log('\n❌ Database setup failed. Please check the steps above.')
  }
})