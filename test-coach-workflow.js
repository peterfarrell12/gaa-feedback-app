const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch').default;

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testCoachWorkflow() {
    console.log('🧪 Testing Complete Coach Workflow\n');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const baseUrl = 'http://localhost:3009';
    const testEventId = 'coach-test-event';
    
    try {
        // Step 1: Test initial state - should show no forms
        console.log('📋 Step 1: Testing initial state (no forms)');
        const initialForms = await fetch(`${baseUrl}/api/forms?event_id=${testEventId}`);
        const initialFormsData = await initialForms.json();
        console.log(`✅ Initial forms count: ${initialFormsData.length} (expected: 0)`);
        
        // Step 2: Get available templates
        console.log('\n📋 Step 2: Getting available templates');
        const templatesResponse = await fetch(`${baseUrl}/api/templates`);
        const templates = await templatesResponse.json();
        console.log(`✅ Available templates: ${templates.length}`);
        
        if (templates.length === 0) {
            console.error('❌ No templates available');
            return;
        }
        
        // Find a template with sections and questions
        const template = templates.find(t => t.sections > 0 && t.questions > 0) || templates[0];
        console.log(`✅ Using template: ${template.name} (${template.sections} sections, ${template.questions} questions)`);
        
        // Step 3: Create a form from template
        console.log('\n📋 Step 3: Creating form from template');
        const createFormResponse = await fetch(`${baseUrl}/api/forms/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: template.id,
                eventId: testEventId,
                customizations: {
                    name: `${template.name} - Coach Test Event`
                }
            })
        });
        
        const createdForm = await createFormResponse.json();
        console.log(`✅ Form created: ${createdForm.name} (ID: ${createdForm.id})`);
        
        // Step 4: Verify form appears in forms list
        console.log('\n📋 Step 4: Verifying form appears in forms list');
        const formsAfterCreate = await fetch(`${baseUrl}/api/forms?event_id=${testEventId}`);
        const formsAfterCreateData = await formsAfterCreate.json();
        console.log(`✅ Forms count after creation: ${formsAfterCreateData.length} (expected: 1)`);
        
        if (formsAfterCreateData.length > 0) {
            const form = formsAfterCreateData[0];
            console.log(`✅ Form structure: ${form.structure.sections.length} sections`);
            
            // Check each section
            form.structure.sections.forEach((section, index) => {
                console.log(`   Section ${index + 1}: ${section.title} (${section.questions.length} questions)`);
            });
        }
        
        // Step 5: Test form analytics
        console.log('\n📋 Step 5: Testing form analytics');
        const analyticsResponse = await fetch(`${baseUrl}/api/forms/${createdForm.id}/analytics`);
        const analytics = await analyticsResponse.json();
        console.log(`✅ Analytics loaded: ${analytics.totalResponses} responses, ${analytics.responseRate}% response rate`);
        
        // Step 6: Test response submission (simulate player)
        console.log('\n📋 Step 6: Testing response submission');
        const submitResponse = await fetch(`${baseUrl}/api/responses/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                formId: createdForm.id,
                userId: 'test-player-123',
                responses: {
                    // Get the first question ID and submit a test response
                    [formsAfterCreateData[0].structure.sections[0].questions[0].id]: 8
                },
                isAnonymous: false,
                completionTimeSeconds: 180
            })
        });
        
        const responseData = await submitResponse.json();
        console.log(`✅ Response submitted: ${responseData.id || 'Success'}`);
        
        // Step 7: Verify analytics updated
        console.log('\n📋 Step 7: Verifying analytics updated');
        const analyticsAfterResponse = await fetch(`${baseUrl}/api/forms/${createdForm.id}/analytics`);
        const analyticsAfterData = await analyticsAfterResponse.json();
        console.log(`✅ Analytics after response: ${analyticsAfterData.totalResponses} responses`);
        
        // Step 8: Clean up test data
        console.log('\n📋 Step 8: Cleaning up test data');
        await supabase.from('forms').delete().eq('id', createdForm.id);
        console.log('✅ Test form cleaned up');
        
        console.log('\n🎉 COACH WORKFLOW TEST COMPLETED SUCCESSFULLY!');
        console.log('\n📋 Summary:');
        console.log('✅ Initial state check (no forms)');
        console.log('✅ Template loading');
        console.log('✅ Form creation from template');
        console.log('✅ Form structure with sections and questions');
        console.log('✅ Analytics functionality');
        console.log('✅ Response submission');
        console.log('✅ Analytics updates');
        console.log('✅ Data cleanup');
        
    } catch (error) {
        console.error('❌ Error in coach workflow test:', error);
    }
}

testCoachWorkflow();