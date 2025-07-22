const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function cleanupTestData() {
    console.log('🧹 Cleaning up test data properly...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Get all test forms
        const { data: testForms, error: formsError } = await supabase
            .from('forms')
            .select('id, name, event_identifier')
            .or('event_identifier.ilike.%test%,name.ilike.%test%');
        
        if (formsError) {
            console.error('Error getting test forms:', formsError);
            return;
        }
        
        console.log(`Found ${testForms.length} test forms to delete`);
        
        for (const form of testForms) {
            console.log(`Deleting form: ${form.name}`);
            
            // Delete questions first
            const { data: sections } = await supabase
                .from('sections')
                .select('id')
                .eq('form_id', form.id);
            
            if (sections && sections.length > 0) {
                for (const section of sections) {
                    await supabase
                        .from('questions')
                        .delete()
                        .eq('section_id', section.id);
                }
            }
            
            // Delete sections
            await supabase
                .from('sections')
                .delete()
                .eq('form_id', form.id);
            
            // Delete responses
            await supabase
                .from('responses')
                .delete()
                .eq('form_id', form.id);
            
            // Finally delete the form
            await supabase
                .from('forms')
                .delete()
                .eq('id', form.id);
            
            console.log(`✅ Deleted form: ${form.name}`);
        }
        
        console.log('✅ Test data cleanup completed successfully');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

cleanupTestData();