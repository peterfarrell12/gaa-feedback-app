// Test UUID generation to verify it works the same way as the frontend
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

function generateUUIDFromString(str) {
    const hash = simpleHash(str);
    
    // Create a deterministic UUID from the hash
    // Generate 32 hex characters from the hash
    let hexString = '';
    let currentHash = hash;
    
    for (let i = 0; i < 32; i++) {
        hexString += (currentHash % 16).toString(16);
        currentHash = Math.floor(currentHash / 16);
        if (currentHash === 0) {
            currentHash = hash; // Repeat if needed
        }
    }
    
    // Format as UUID
    const uuid = `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-4${hexString.slice(12, 15)}-a${hexString.slice(15, 18)}-${hexString.slice(18, 30)}`;
    
    return uuid;
}

// Test with our example
const testEventId = 'test-event';
const uuid = generateUUIDFromString(testEventId);
console.log('Test Event ID:', testEventId);
console.log('Generated UUID:', uuid);

// Test API call
const fetch = require('node-fetch').default;

async function testFormsAPI() {
    try {
        const response = await fetch(`http://localhost:3009/api/forms?event_id=${uuid}`);
        const data = await response.json();
        console.log('Forms API Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testFormsAPI();