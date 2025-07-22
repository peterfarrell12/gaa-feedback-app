const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function cleanupTestData() {
    console.log('🧹 Cleaning up test data...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Delete all forms that have test-related event_identifiers
        const { data: deletedForms, error: deleteError } = await supabase
            .from('forms')
            .delete()
            .or('event_identifier.ilike.%test%,name.ilike.%test%')
            .select();
        
        if (deleteError) {
            console.error('Error deleting forms:', deleteError);
        } else {
            console.log(`✅ Deleted ${deletedForms.length} test forms`);
        }
        
        console.log('✅ Test data cleanup completed');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

cleanupTestData();