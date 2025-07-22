// Debug version of app.js with extra logging
console.log('Debug app.js loading...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting debug...');
    
    // Test basic DOM elements
    const coachInterface = document.getElementById('coach-interface');
    const playerInterface = document.getElementById('player-interface');
    const coachNoForm = document.getElementById('coach-no-form');
    
    console.log('DOM elements found:', {
        coachInterface: !!coachInterface,
        playerInterface: !!playerInterface,
        coachNoForm: !!coachNoForm
    });
    
    // Test URL params
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event-id');
    console.log('Event ID from URL:', eventId);
    
    // Test API calls
    fetch('/api/templates')
        .then(r => r.json())
        .then(data => console.log('Templates loaded:', data.length))
        .catch(err => console.error('Templates error:', err));
        
    fetch(`/api/forms?event_id=${eventId}`)
        .then(r => r.json())
        .then(data => console.log('Forms loaded:', data.length))
        .catch(err => console.error('Forms error:', err));
    
    // Test showing coach interface manually
    setTimeout(() => {
        console.log('Manually showing coach interface...');
        
        // Hide all interfaces
        document.querySelectorAll('.interface').forEach(el => el.classList.add('hidden'));
        
        // Show coach interface
        coachInterface.classList.remove('hidden');
        console.log('Coach interface classes:', coachInterface.className);
        
        // Show no form screen
        document.querySelectorAll('#coach-interface .screen').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
        
        coachNoForm.classList.remove('hidden');
        coachNoForm.classList.add('active');
        console.log('Coach no form classes:', coachNoForm.className);
        
    }, 2000);
});