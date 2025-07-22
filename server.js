const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Mock data store
let mockData = {
    users: [
        { id: 'coach_1', name: 'Seán Murphy', role: 'coach', club: 'cork_gaa' },
        { id: 'player_1', name: 'Cian O\'Sullivan', role: 'player', club: 'cork_gaa', position: 'Forward' },
        { id: 'player_2', name: 'Darragh McCarthy', role: 'player', club: 'cork_gaa', position: 'Midfielder' },
        { id: 'player_3', name: 'Tadhg Walsh', role: 'player', club: 'cork_gaa', position: 'Defender' }
    ],
    events: [
        { 
            id: 'event_1', 
            name: 'Cork vs Kerry Championship Final', 
            type: 'match', 
            date: '2024-03-15',
            club: 'cork_gaa'
        },
        { 
            id: 'event_2', 
            name: 'Weekly Training Session', 
            type: 'training', 
            date: '2024-03-12',
            club: 'cork_gaa'
        }
    ],
    forms: [],
    responses: [],
    templates: [
        {
            id: 'post_match_standard',
            name: 'Post-Match Standard Review',
            description: 'Performance, tactics, and team dynamics',
            type: 'post_game',
            sections: 3,
            questions: 12,
            estimatedTime: '5-7 min',
            icon: '⚽',
            structure: [
                {
                    title: 'Performance Assessment',
                    questions: [
                        { id: 'q1', type: 'rating', text: 'How would you rate your individual performance today?', scale: 10 },
                        { id: 'q2', type: 'rating', text: 'How would you rate the team\'s overall performance?', scale: 10 },
                        { id: 'q3', type: 'text', text: 'What was your strongest contribution to the team today?' },
                        { id: 'q4', type: 'text', text: 'What area would you most like to improve for next match?' }
                    ]
                },
                {
                    title: 'Tactical Analysis',
                    questions: [
                        { id: 'q5', type: 'rating', text: 'How well did we execute our game plan?', scale: 10 },
                        { id: 'q6', type: 'multiple_choice', text: 'Which tactical area needs most improvement?', options: ['Defensive Shape', 'Attack Transition', 'Set Pieces', 'Possession Play'] },
                        { id: 'q7', type: 'text', text: 'Any tactical suggestions for future matches?' }
                    ]
                },
                {
                    title: 'Team Dynamics',
                    questions: [
                        { id: 'q8', type: 'rating', text: 'How would you rate team communication today?', scale: 10 },
                        { id: 'q9', type: 'rating', text: 'How positive was the team atmosphere?', scale: 10 },
                        { id: 'q10', type: 'text', text: 'Any feedback for the coaching staff?' },
                        { id: 'q11', type: 'yes_no', text: 'Do you feel your voice is heard in team decisions?' },
                        { id: 'q12', type: 'text', text: 'Additional comments (optional)' }
                    ]
                }
            ]
        },
        {
            id: 'training_session',
            name: 'Training Session Review',
            description: 'Drills, fitness, and skill development',
            type: 'post_training',
            sections: 2,
            questions: 8,
            estimatedTime: '4-6 min',
            icon: '🏃',
            structure: [
                {
                    title: 'Session Quality',
                    questions: [
                        { id: 't1', type: 'rating', text: 'How would you rate today\'s training session?', scale: 10 },
                        { id: 't2', type: 'rating', text: 'How challenging was the session for your skill level?', scale: 10 },
                        { id: 't3', type: 'text', text: 'Which drill or activity was most beneficial?' },
                        { id: 't4', type: 'multiple_choice', text: 'Which area did you improve most?', options: ['Ball Skills', 'Fitness', 'Tactical Awareness', 'Communication'] }
                    ]
                },
                {
                    title: 'Training Environment',
                    questions: [
                        { id: 't5', type: 'rating', text: 'How clear were the coaching instructions?', scale: 10 },
                        { id: 't6', type: 'rating', text: 'How supportive was the team atmosphere?', scale: 10 },
                        { id: 't7', type: 'text', text: 'Suggestions for improving future training sessions?' },
                        { id: 't8', type: 'yes_no', text: 'Do you feel comfortable asking questions during training?' }
                    ]
                }
            ]
        }
    ]
};

// Load plugin code
function loadPluginCode() {
    try {
        return fs.readFileSync(path.join(__dirname, 'feedback-system.js'), 'utf8');
    } catch (error) {
        console.log('Plugin file not found, using fallback');
        return 'Plugin code not loaded';
    }
}

// API Routes

// Get all mock data
app.get('/api/data', (req, res) => {
    res.json(mockData);
});

// Get templates
app.get('/api/templates', (req, res) => {
    res.json(mockData.templates);
});

// Create form from template
app.post('/api/forms/create', (req, res) => {
    const { templateId, eventId, customizations } = req.body;
    const template = mockData.templates.find(t => t.id === templateId);
    
    if (!template) {
        return res.status(404).json({ error: 'Template not found' });
    }
    
    const newForm = {
        id: uuidv4(),
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        templateId: template.id,
        eventId: eventId,
        structure: template.structure,
        createdAt: new Date().toISOString(),
        status: 'active',
        allowAnonymous: true,
        ...customizations
    };
    
    mockData.forms.push(newForm);
    res.json(newForm);
});

// Submit response
app.post('/api/responses/submit', (req, res) => {
    const { formId, userId, responses, isAnonymous } = req.body;
    
    const newResponse = {
        id: uuidv4(),
        formId: formId,
        userId: isAnonymous ? null : userId,
        responses: responses,
        isAnonymous: isAnonymous,
        submittedAt: new Date().toISOString(),
        completionTimeSeconds: Math.floor(Math.random() * 300 + 120)
    };
    
    mockData.responses.push(newResponse);
    res.json(newResponse);
});

// Get form analytics
app.get('/api/forms/:formId/analytics', (req, res) => {
    const { formId } = req.params;
    const form = mockData.forms.find(f => f.id === formId);
    const responses = mockData.responses.filter(r => r.formId === formId);
    
    if (!form) {
        return res.status(404).json({ error: 'Form not found' });
    }
    
    // Calculate analytics
    const analytics = {
        formId: formId,
        formName: form.name,
        totalResponses: responses.length,
        anonymousResponses: responses.filter(r => r.isAnonymous).length,
        responseRate: responses.length > 0 ? Math.round((responses.length / mockData.users.filter(u => u.role === 'player').length) * 100) : 0,
        averageCompletionTime: responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + r.completionTimeSeconds, 0) / responses.length) : 0,
        questionAnalysis: calculateQuestionAnalytics(form, responses),
        insights: generateInsights(responses)
    };
    
    res.json(analytics);
});

// Test endpoints
app.post('/api/test/template-selector', (req, res) => {
    const result = {
        success: true,
        message: 'Template selector test completed',
        data: {
            templatesLoaded: mockData.templates.length,
            availableTypes: [...new Set(mockData.templates.map(t => t.type))]
        }
    };
    res.json(result);
});

app.post('/api/test/form-builder', (req, res) => {
    const { templateId } = req.body;
    const template = mockData.templates.find(t => t.id === templateId);
    
    const result = {
        success: true,
        message: 'Form builder test completed',
        data: {
            templateFound: !!template,
            questionTypes: ['rating', 'text', 'multiple_choice', 'yes_no'],
            validationPassed: true
        }
    };
    res.json(result);
});

app.post('/api/test/form-renderer', (req, res) => {
    const { formId } = req.body;
    
    // Simulate form completion
    const mockPlayer = mockData.users.find(u => u.role === 'player');
    const form = mockData.forms.find(f => f.id === formId) || mockData.templates[0];
    
    const responses = {};
    let questionCount = 0;
    
    for (const section of form.structure) {
        for (const question of section.questions) {
            questionCount++;
            let response;
            
            if (question.type === 'rating') {
                response = Math.floor(Math.random() * question.scale) + 1;
            } else if (question.type === 'text') {
                response = 'This is a simulated response for testing purposes.';
            } else if (question.type === 'yes_no') {
                response = Math.random() > 0.5 ? 'yes' : 'no';
            } else if (question.type === 'multiple_choice') {
                response = question.options[Math.floor(Math.random() * question.options.length)];
            }
            
            responses[question.id] = response;
        }
    }
    
    const result = {
        success: true,
        message: 'Form renderer test completed',
        data: {
            playerId: mockPlayer.id,
            playerName: mockPlayer.name,
            totalQuestions: questionCount,
            responses: responses,
            isAnonymous: Math.random() > 0.5
        }
    };
    
    res.json(result);
});

app.post('/api/test/results-dashboard', (req, res) => {
    const { formId } = req.body;
    const analytics = generateMockAnalytics();
    
    const result = {
        success: true,
        message: 'Results dashboard test completed',
        data: analytics
    };
    
    res.json(result);
});

// Generate mock data
app.post('/api/generate-mock-data', (req, res) => {
    const { playerCount = 25, eventCount = 10, formCount = 5 } = req.body;
    
    // Generate players
    const firstNames = ['Seán', 'Cian', 'Darragh', 'Tadhg', 'Conor', 'Eoin', 'Pádraic', 'Ruairí'];
    const lastNames = ['Murphy', 'O\'Sullivan', 'McCarthy', 'Walsh', 'O\'Brien', 'Kelly', 'Fitzgerald', 'O\'Connor'];
    const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
    
    // Clear existing players except the first few
    mockData.users = mockData.users.filter(u => u.role === 'coach');
    
    for (let i = 0; i < playerCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const player = {
            id: `player_${i + 1}`,
            name: `${firstName} ${lastName}`,
            role: 'player',
            club: 'cork_gaa',
            position: positions[Math.floor(Math.random() * positions.length)],
            age: Math.floor(Math.random() * 15) + 16,
            jerseyNumber: i + 1
        };
        mockData.users.push(player);
    }
    
    // Generate events
    mockData.events = [];
    const eventTypes = [
        { type: 'match', name: 'vs Kerry', opponent: 'Kerry GAA' },
        { type: 'match', name: 'vs Dublin', opponent: 'Dublin GAA' },
        { type: 'training', name: 'Weekly Training', opponent: null },
        { type: 'training', name: 'Tactical Session', opponent: null }
    ];
    
    for (let i = 0; i < eventCount; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        const event = {
            id: `event_${i + 1}`,
            name: eventType.name,
            type: eventType.type,
            opponent: eventType.opponent,
            date: date.toISOString().split('T')[0],
            club: 'cork_gaa',
            location: 'Páirc Uí Chaoimh'
        };
        mockData.events.push(event);
    }
    
    // Generate forms and responses
    mockData.forms = [];
    mockData.responses = [];
    
    for (let i = 0; i < formCount; i++) {
        const template = mockData.templates[Math.floor(Math.random() * mockData.templates.length)];
        const event = mockData.events[i];
        
        const form = {
            id: `form_${i + 1}`,
            name: `${event.name} Feedback`,
            eventId: event.id,
            templateId: template.id,
            structure: template.structure,
            createdAt: event.date,
            status: 'active',
            allowAnonymous: true
        };
        
        mockData.forms.push(form);
        
        // Generate responses
        const players = mockData.users.filter(u => u.role === 'player');
        const responseCount = Math.floor(Math.random() * players.length * 0.8) + Math.floor(players.length * 0.2);
        
        for (let j = 0; j < responseCount; j++) {
            const player = players[j];
            const isAnonymous = Math.random() > 0.6;
            
            const responses = {};
            
            for (const section of form.structure) {
                for (const question of section.questions) {
                    if (question.type === 'rating') {
                        responses[question.id] = Math.min(10, Math.max(1, Math.round(Math.random() * 4 + 6)));
                    } else if (question.type === 'text') {
                        const textResponses = [
                            'Great team performance overall',
                            'Communication could be improved',
                            'Really enjoyed the tactical approach',
                            'Fitness levels felt good',
                            'Looking forward to next session'
                        ];
                        responses[question.id] = textResponses[Math.floor(Math.random() * textResponses.length)];
                    } else if (question.type === 'yes_no') {
                        responses[question.id] = Math.random() > 0.3 ? 'yes' : 'no';
                    } else if (question.type === 'multiple_choice') {
                        responses[question.id] = question.options[Math.floor(Math.random() * question.options.length)];
                    }
                }
            }
            
            const response = {
                id: `response_${Date.now()}_${j}`,
                formId: form.id,
                userId: isAnonymous ? null : player.id,
                responses: responses,
                isAnonymous: isAnonymous,
                submittedAt: new Date(event.date + 'T' + (18 + Math.random() * 4).toFixed(0) + ':00:00').toISOString(),
                completionTimeSeconds: Math.floor(Math.random() * 300 + 120)
            };
            
            mockData.responses.push(response);
        }
    }
    
    res.json({
        success: true,
        message: 'Mock data generated successfully',
        data: {
            usersGenerated: mockData.users.length,
            eventsGenerated: mockData.events.length,
            formsGenerated: mockData.forms.length,
            responsesGenerated: mockData.responses.length
        }
    });
});

// Get plugin code
app.get('/api/plugin-code', (req, res) => {
    const pluginCode = loadPluginCode();
    res.json({ code: pluginCode });
});

// Helper functions
function calculateQuestionAnalytics(form, responses) {
    const analytics = [];
    
    for (const section of form.structure) {
        for (const question of section.questions) {
            const questionResponses = responses
                .map(r => r.responses[question.id])
                .filter(response => response !== undefined && response !== null && response !== '');
            
            let analysis = {
                questionId: question.id,
                questionText: question.text,
                questionType: question.type,
                responseCount: questionResponses.length
            };
            
            if (question.type === 'rating') {
                const ratings = questionResponses.filter(r => !isNaN(r)).map(r => Number(r));
                if (ratings.length > 0) {
                    analysis.averageRating = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
                    analysis.distribution = {};
                    for (let i = 1; i <= (question.scale || 10); i++) {
                        analysis.distribution[i] = ratings.filter(r => r === i).length;
                    }
                }
            } else if (question.type === 'multiple_choice') {
                analysis.distribution = {};
                question.options.forEach(option => {
                    analysis.distribution[option] = questionResponses.filter(r => r === option).length;
                });
            } else if (question.type === 'yes_no') {
                analysis.distribution = {
                    yes: questionResponses.filter(r => r === 'yes').length,
                    no: questionResponses.filter(r => r === 'no').length
                };
            }
            
            analytics.push(analysis);
        }
    }
    
    return analytics;
}

function generateInsights(responses) {
    const insights = [];
    
    if (responses.length > 0) {
        const anonymousCount = responses.filter(r => r.isAnonymous).length;
        const anonymousPercentage = Math.round((anonymousCount / responses.length) * 100);
        
        insights.push(`${anonymousPercentage}% of responses were submitted anonymously`);
        
        const avgCompletionTime = responses.reduce((sum, r) => sum + r.completionTimeSeconds, 0) / responses.length;
        insights.push(`Average completion time: ${Math.round(avgCompletionTime / 60)} minutes`);
        
        if (responses.length >= 10) {
            insights.push('Good response rate indicates high player engagement');
        } else {
            insights.push('Consider follow-up reminders to increase response rate');
        }
    }
    
    return insights;
}

function generateMockAnalytics() {
    const totalResponses = Math.floor(Math.random() * 20) + 15;
    const anonymousResponses = Math.floor(totalResponses * (Math.random() * 0.5 + 0.3));
    
    return {
        totalResponses,
        anonymousResponses,
        responseRate: Math.floor((totalResponses / 30) * 100),
        avgPerformanceRating: (Math.random() * 3 + 6.5).toFixed(1),
        insights: [
            'Team communication rated highly (8.2/10 average)',
            'Defensive shape identified as area for improvement',
            '75% of players feel their voice is heard in team decisions',
            'Suggested focus: Set piece execution and fitness levels'
        ],
        questionAnalysis: [
            { question: 'Individual Performance', avgRating: 7.8, responseCount: totalResponses },
            { question: 'Team Performance', avgRating: 8.1, responseCount: totalResponses },
            { question: 'Communication', avgRating: 8.2, responseCount: totalResponses }
        ]
    };
}

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🏈 TeamSync Feedback Dev Tool running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
});

module.exports = app;