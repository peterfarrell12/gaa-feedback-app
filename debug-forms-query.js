const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debugFormsQuery() {
    console.log('🔍 Debug Forms Query');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // First, check all forms
        const { data: allForms, error: allFormsError } = await supabase
            .from('forms')
            .select('id, name, event_identifier, status')
            .eq('status', 'active');
        
        console.log('\nAll active forms:');
        allForms.forEach(form => {
            console.log(`- ${form.name} (event_identifier: ${form.event_identifier || 'null'})`);
        });
        
        // Test filtering by event_identifier
        const testEventId = 'coach-test-event';
        console.log(`\nFiltering by event_identifier: ${testEventId}`);
        
        const { data: filteredForms, error: filteredError } = await supabase
            .from('forms')
            .select('id, name, event_identifier, status')
            .eq('event_identifier', testEventId)
            .eq('status', 'active');
        
        if (filteredError) {
            console.error('Error filtering forms:', filteredError);
        } else {
            console.log(`Found ${filteredForms.length} forms for event ${testEventId}:`);
            filteredForms.forEach(form => {
                console.log(`- ${form.name} (event_identifier: ${form.event_identifier})`);
            });
        }
        
        // Test the exact query from the API
        console.log('\nTesting exact API query...');
        const { data: apiQuery, error: apiError } = await supabase
            .from('forms')
            .select(`
                *,
                sections (
                    id,
                    title,
                    description,
                    order_index,
                    questions (
                        id,
                        question_text,
                        question_type,
                        options,
                        scale,
                        required,
                        order_index
                    )
                )
            `)
            .eq('event_identifier', testEventId)
            .eq('status', 'active');
        
        if (apiError) {
            console.error('API query error:', apiError);
        } else {
            console.log(`API query returned ${apiQuery.length} forms`);
            if (apiQuery.length > 0) {
                console.log(`First form: ${apiQuery[0].name} with ${apiQuery[0].sections.length} sections`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

debugFormsQuery();