const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applySchemaFix() {
    console.log('🔧 Applying schema fix...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Read the SQL file
        const sql = fs.readFileSync('fix-event-id-schema.sql', 'utf8');
        
        // Execute the SQL commands one by one
        const commands = sql.split(';').filter(cmd => cmd.trim());
        
        for (const command of commands) {
            if (command.trim()) {
                console.log('Executing:', command.trim().substring(0, 50) + '...');
                const { error } = await supabase.rpc('exec_sql', { sql: command.trim() });
                if (error) {
                    console.error('Error executing command:', error);
                } else {
                    console.log('✅ Command executed successfully');
                }
            }
        }
        
        console.log('🎉 Schema fix completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

applySchemaFix();