const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function addEventIdentifierColumn() {
    console.log('🔧 Adding event_identifier column to forms table...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // First, let's check the current structure
        const { data: forms, error: formsError } = await supabase
            .from('forms')
            .select('*')
            .limit(1);
        
        if (formsError) {
            console.error('Error fetching forms:', formsError);
            return;
        }
        
        console.log('✅ Current forms table accessed successfully');
        
        // Test if event_identifier column already exists
        const { data: testData, error: testError } = await supabase
            .from('forms')
            .select('event_identifier')
            .limit(1);
        
        if (testError && testError.code === '42703') {
            console.log('📝 event_identifier column does not exist, will be added via SQL editor');
        } else {
            console.log('✅ event_identifier column already exists');
        }
        
        // Create a test form with event_identifier (this will fail if column doesn't exist)
        const testIdentifier = 'test-event-' + Date.now();
        const { data: testForm, error: insertError } = await supabase
            .from('forms')
            .insert({
                name: 'Test Form',
                event_identifier: testIdentifier,
                status: 'active'
            })
            .select()
            .single();
        
        if (insertError) {
            console.error('❌ Error inserting test form:', insertError);
            console.log('Need to manually add event_identifier column in Supabase dashboard');
            console.log('SQL: ALTER TABLE forms ADD COLUMN event_identifier TEXT;');
        } else {
            console.log('✅ Test form created successfully with event_identifier:', testForm);
            
            // Clean up test form
            await supabase.from('forms').delete().eq('id', testForm.id);
            console.log('✅ Test form cleaned up');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addEventIdentifierColumn();