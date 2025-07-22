const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSchema() {
    console.log('🔍 Checking current schema...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Try to create a test form with a simple event_id
        const { data: testForm, error: testError } = await supabase
            .from('forms')
            .insert({
                name: 'Test Form',
                event_id: 'test-event-123',
                status: 'active'
            })
            .select()
            .single();
        
        if (testError) {
            console.error('❌ Error creating test form:', testError);
            console.log('This confirms that event_id field needs to be changed from UUID to TEXT');
        } else {
            console.log('✅ Test form created successfully:', testForm);
            
            // Clean up test form
            await supabase.from('forms').delete().eq('id', testForm.id);
            console.log('✅ Test form cleaned up');
        }
        
        // Also check existing forms
        const { data: forms, error: formsError } = await supabase
            .from('forms')
            .select('*')
            .limit(3);
        
        if (formsError) {
            console.error('❌ Error fetching forms:', formsError);
        } else {
            console.log('📊 Current forms in database:', forms.length);
            if (forms.length > 0) {
                console.log('Sample form:', forms[0]);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkSchema();