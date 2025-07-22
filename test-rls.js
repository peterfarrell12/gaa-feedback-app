const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testing RLS and permissions...')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseKey.substring(0, 20) + '...')
console.log('Service Key:', serviceKey ? serviceKey.substring(0, 20) + '...' : 'NOT SET')

async function testRLS() {
  
  // Test with anon key
  const anonClient = createClient(supabaseUrl, supabaseKey)
  
  console.log('\n🔍 Testing with anon key...')
  const { data: anonData, error: anonError } = await anonClient
    .from('templates')
    .select('*')
  
  if (anonError) {
    console.log('❌ Anon error:', anonError)
  } else {
    console.log('✅ Anon data:', anonData.length, 'records')
  }
  
  // Test with service key if available
  if (serviceKey) {
    console.log('\n🔍 Testing with service role key...')
    const serviceClient = createClient(supabaseUrl, serviceKey)
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('templates')
      .select('*')
    
    if (serviceError) {
      console.log('❌ Service error:', serviceError)
    } else {
      console.log('✅ Service data:', serviceData.length, 'records')
      if (serviceData.length > 0) {
        console.log('First template:', serviceData[0])
      }
    }
  }
  
  // Test table existence
  console.log('\n🔍 Testing table existence...')
  try {
    const { data, error } = await anonClient
      .from('templates')
      .select('count', { count: 'exact' })
      .limit(0)
    
    if (error) {
      console.log('❌ Table access error:', error)
    } else {
      console.log('✅ Table exists, count:', data)
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }
}

testRLS()