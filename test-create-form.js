const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testCreateForm() {
    console.log('🔧 Testing form creation...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // First get a template
        const { data: templates, error: templatesError } = await supabase
            .from('templates')
            .select('*')
            .limit(1);
        
        if (templatesError) {
            console.error('Error fetching templates:', templatesError);
            return;
        }
        
        if (templates.length === 0) {
            console.error('No templates found');
            return;
        }
        
        const template = templates[0];
        console.log('✅ Using template:', template.name);
        
        // Try to create a form with event_identifier
        console.log('🔄 Attempting to create form with event_identifier...');
        
        try {
            const { data: formData, error: insertError } = await supabase
                .from('forms')
                .insert({
                    name: `${template.name} - Test Event`,
                    template_id: template.id,
                    event_identifier: 'test-event',
                    status: 'active'
                })
                .select()
                .single();
            
            if (insertError) {
                console.error('Error with event_identifier:', insertError);
            } else {
                console.log('✅ Form created with event_identifier:', formData);
                return;
            }
        } catch (error) {
            console.log('❌ event_identifier failed:', error.message);
        }
        
        // Try to create a form without event_identifier
        console.log('🔄 Attempting to create form without event_identifier...');
        
        const { data: formData, error: insertError } = await supabase
            .from('forms')
            .insert({
                name: `${template.name} - Test Event`,
                template_id: template.id,
                status: 'active'
            })
            .select()
            .single();
        
        if (insertError) {
            console.error('Error without event_identifier:', insertError);
        } else {
            console.log('✅ Form created without event_identifier:', formData);
            
            // Clean up
            await supabase.from('forms').delete().eq('id', formData.id);
            console.log('✅ Test form cleaned up');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testCreateForm();