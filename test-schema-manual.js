const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Please run this SQL in your Supabase dashboard:');
console.log('');
console.log('ALTER TABLE forms ADD COLUMN IF NOT EXISTS event_identifier TEXT;');
console.log('CREATE INDEX IF NOT EXISTS idx_forms_event_identifier ON forms(event_identifier);');
console.log('');
console.log('Then press Enter to continue...');

process.stdin.once('data', async () => {
    console.log('🔧 Testing schema changes...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Test creating a form with event_identifier
        const testIdentifier = 'test-event-manual';
        const { data: testForm, error: insertError } = await supabase
            .from('forms')
            .insert({
                name: 'Test Form Manual',
                event_identifier: testIdentifier,
                status: 'active'
            })
            .select()
            .single();
        
        if (insertError) {
            console.error('❌ Error creating test form:', insertError);
            console.log('Please make sure you ran the SQL commands above.');
            process.exit(1);
        }
        
        console.log('✅ Test form created successfully:', testForm);
        
        // Test querying by event_identifier
        const { data: forms, error: queryError } = await supabase
            .from('forms')
            .select('*')
            .eq('event_identifier', testIdentifier);
        
        if (queryError) {
            console.error('❌ Error querying forms:', queryError);
        } else {
            console.log('✅ Successfully queried forms by event_identifier:', forms.length);
        }
        
        // Clean up
        await supabase.from('forms').delete().eq('id', testForm.id);
        console.log('✅ Test form cleaned up');
        
        console.log('🎉 Schema test completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
});