/**
 * TeamSync Feedback System - Bubble Plugin
 * Production-ready plugin for TeamSync Bubble app
 * 
 * Elements:
 * - FeedbackTemplateSelector
 * - FeedbackFormBuilder  
 * - FeedbackFormRenderer
 * - FeedbackResultsDashboard
 * 
 * Actions:
 * - CreateFeedbackForm
 * - SubmitFeedbackResponse
 * - ExportFeedbackResults
 */

// =============================================================================
// FEEDBACK TEMPLATE SELECTOR ELEMENT
// =============================================================================

function(instance, context) {
    // Plugin instance and context
    var instance = this;
    var canvas = instance.canvas;
    var properties = instance.data;
    
    // State management
    var state = {
        selectedTemplate: null,
        eventType: null,
        customTemplates: [],
        questionBank: [],
        isLoading: false
    };
    
    // Initialize plugin
    instance.init = function() {
        console.log('TeamSync Feedback - Template Selector initialized');
        
        // Get properties from Bubble
        state.eventType = properties.event_type || 'post_game';
        state.customTemplates = properties.saved_templates || [];
        state.questionBank = properties.question_bank || [];
        
        // Set up canvas
        canvas.empty();
        canvas.css({
            'min-height': '400px',
            'width': '100%',
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });
        
        // Render initial interface
        renderTemplateSelector();
        
        // Trigger ready event
        instance.trigger('template_selector_ready', {
            event_type: state.eventType,
            templates_loaded: getAvailableTemplates().length
        });
    };
    
    // Update when properties change
    instance.update = function() {
        console.log('TeamSync Feedback - Template Selector updated');
        
        // Check for property changes
        var newEventType = properties.event_type || 'post_game';
        var newCustomTemplates = properties.saved_templates || [];
        var newQuestionBank = properties.question_bank || [];
        
        if (newEventType !== state.eventType || 
            JSON.stringify(newCustomTemplates) !== JSON.stringify(state.customTemplates) ||
            JSON.stringify(newQuestionBank) !== JSON.stringify(state.questionBank)) {
            
            state.eventType = newEventType;
            state.customTemplates = newCustomTemplates;
            state.questionBank = newQuestionBank;
            
            // Re-render with new data
            renderTemplateSelector();
            
            // Trigger update event
            instance.trigger('template_selector_updated', {
                event_type: state.eventType,
                templates_count: getAvailableTemplates().length
            });
        }
    };
    
    // Default GAA templates
    function getDefaultTemplates() {
        return [
            {
                id: 'post_match_standard',
                name: 'Post-Match Standard Review',
                description: 'Performance, tactics, and team dynamics',
                type: 'post_game',
                icon: '⚽',
                sections: 3,
                questions: 12,
                estimatedTime: '5-7 min',
                isDefault: true,
                structure: [
                    {
                        title: 'Performance Assessment',
                        questions: [
                            { type: 'rating', text: 'How would you rate your individual performance today?', scale: 10 },
                            { type: 'rating', text: 'How would you rate the team\'s overall performance?', scale: 10 },
                            { type: 'text', text: 'What was your strongest contribution to the team today?' },
                            { type: 'text', text: 'What area would you most like to improve for next match?' }
                        ]
                    },
                    {
                        title: 'Tactical Analysis', 
                        questions: [
                            { type: 'rating', text: 'How well did we execute our game plan?', scale: 10 },
                            { type: 'multiple_choice', text: 'Which tactical area needs most improvement?', options: ['Defensive Shape', 'Attack Transition', 'Set Pieces', 'Possession Play'] },
                            { type: 'text', text: 'Any tactical suggestions for future matches?' }
                        ]
                    },
                    {
                        title: 'Team Dynamics',
                        questions: [
                            { type: 'rating', text: 'How would you rate team communication today?', scale: 10 },
                            { type: 'rating', text: 'How positive was the team atmosphere?', scale: 10 },
                            { type: 'text', text: 'Any feedback for the coaching staff?' },
                            { type: 'yes_no', text: 'Do you feel your voice is heard in team decisions?' },
                            { type: 'text', text: 'Additional comments (optional)' }
                        ]
                    }
                ]
            },
            {
                id: 'post_training_standard',
                name: 'Training Session Review',
                description: 'Drills, fitness, and skill development',
                type: 'post_training',
                icon: '🏃',
                sections: 2,
                questions: 8,
                estimatedTime: '4-6 min',
                isDefault: true,
                structure: [
                    {
                        title: 'Session Quality',
                        questions: [
                            { type: 'rating', text: 'How would you rate today\'s training session?', scale: 10 },
                            { type: 'rating', text: 'How challenging was the session for your skill level?', scale: 10 },
                            { type: 'text', text: 'Which drill or activity was most beneficial?' },
                            { type: 'multiple_choice', text: 'Which area did you improve most?', options: ['Ball Skills', 'Fitness', 'Tactical Awareness', 'Communication'] }
                        ]
                    },
                    {
                        title: 'Training Environment',
                        questions: [
                            { type: 'rating', text: 'How clear were the coaching instructions?', scale: 10 },
                            { type: 'rating', text: 'How supportive was the team atmosphere?', scale: 10 },
                            { type: 'text', text: 'Suggestions for improving future training sessions?' },
                            { type: 'yes_no', text: 'Do you feel comfortable asking questions during training?' }
                        ]
                    }
                ]
            },
            {
                id: 'development_review',
                name: 'Player Development Review',
                description: 'Personal growth and goal setting',
                type: 'development',
                icon: '📈',
                sections: 2,
                questions: 6,
                estimatedTime: '6-8 min',
                isDefault: true,
                structure: [
                    {
                        title: 'Self Assessment',
                        questions: [
                            { type: 'rating', text: 'How would you rate your progress this season?', scale: 10 },
                            { type: 'text', text: 'What are you most proud of in your development?' },
                            { type: 'text', text: 'What areas do you want to focus on improving?' }
                        ]
                    },
                    {
                        title: 'Goal Setting',
                        questions: [
                            { type: 'text', text: 'What is your main goal for next month?' },
                            { type: 'multiple_choice', text: 'What type of support would help you most?', options: ['Extra Training', 'Tactical Education', 'Mental Coaching', 'Physical Conditioning'] },
                            { type: 'yes_no', text: 'Would you be interested in additional leadership responsibilities?' }
                        ]
                    }
                ]
            }
        ];
    }
    
    // Get all available templates (default + custom)
    function getAvailableTemplates() {
        var defaultTemplates = getDefaultTemplates();
        var filteredDefaults = defaultTemplates.filter(function(template) {
            return !state.eventType || template.type === state.eventType || template.type === 'development';
        });
        
        var filteredCustom = state.customTemplates.filter(function(template) {
            return !state.eventType || template.type === state.eventType;
        });
        
        return filteredDefaults.concat(filteredCustom);
    }
    
    // Render template selector interface
    function renderTemplateSelector() {
        var templates = getAvailableTemplates();
        
        var html = `
            <div class="teamsync-template-selector">
                <style>
                    .teamsync-template-selector {
                        background: #fff;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .teamsync-header {
                        background: #0E79B2;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    .teamsync-header h2 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    .teamsync-header p {
                        margin: 8px 0 0 0;
                        opacity: 0.9;
                        font-size: 14px;
                    }
                    .teamsync-content {
                        padding: 24px;
                    }
                    .teamsync-template-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 16px;
                        margin-bottom: 24px;
                    }
                    .teamsync-template-card {
                        border: 2px solid #e5e5e5;
                        border-radius: 8px;
                        padding: 20px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        background: white;
                    }
                    .teamsync-template-card:hover {
                        border-color: #0E79B2;
                        box-shadow: 0 4px 12px rgba(14, 121, 178, 0.15);
                    }
                    .teamsync-template-card.selected {
                        border-color: #0E79B2;
                        background: #f8fcff;
                    }
                    .teamsync-template-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 12px;
                    }
                    .teamsync-template-icon {
                        font-size: 24px;
                        margin-right: 12px;
                    }
                    .teamsync-template-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1a1a1a;
                        margin: 0;
                    }
                    .teamsync-template-meta {
                        font-size: 12px;
                        color: #666;
                        margin-top: 8px;
                    }
                    .teamsync-template-description {
                        color: #666;
                        font-size: 14px;
                        margin: 12px 0 0 0;
                    }
                    .teamsync-template-badge {
                        display: inline-block;
                        background: #22c55e;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 500;
                        margin-top: 8px;
                    }
                    .teamsync-template-badge.custom {
                        background: #f59e0b;
                    }
                    .teamsync-actions {
                        text-align: center;
                        margin-top: 24px;
                    }
                    .teamsync-btn {
                        background: #0E79B2;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background 0.2s ease;
                        margin: 0 6px;
                    }
                    .teamsync-btn:hover {
                        background: #0c6a9a;
                    }
                    .teamsync-btn:disabled {
                        background: #ccc;
                        cursor: not-allowed;
                    }
                    .teamsync-btn-secondary {
                        background: #f8f9fa;
                        color: #0E79B2;
                        border: 2px solid #0E79B2;
                    }
                    .teamsync-btn-secondary:hover {
                        background: #e9ecef;
                    }
                    .teamsync-event-type {
                        background: #f8f9fa;
                        padding: 12px;
                        border-radius: 6px;
                        margin-bottom: 20px;
                        font-size: 14px;
                        color: #666;
                    }
                    @media (max-width: 768px) {
                        .teamsync-template-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
                
                <div class="teamsync-header">
                    <h2>Select Feedback Template</h2>
                    <p>Choose a template for your ${getEventTypeLabel(state.eventType)} feedback form</p>
                </div>
                
                <div class="teamsync-content">
                    <div class="teamsync-event-type">
                        <strong>Event Type:</strong> ${getEventTypeLabel(state.eventType)}
                    </div>
                    
                    <div class="teamsync-template-grid">
                        ${templates.map(function(template) {
                            return `
                                <div class="teamsync-template-card" data-template-id="${template.id}">
                                    <div class="teamsync-template-header">
                                        <span class="teamsync-template-icon">${template.icon}</span>
                                        <h3 class="teamsync-template-title">${template.name}</h3>
                                    </div>
                                    <div class="teamsync-template-meta">
                                        ${template.sections} sections • ${template.questions} questions • ${template.estimatedTime}
                                    </div>
                                    <p class="teamsync-template-description">${template.description}</p>
                                    <div class="teamsync-template-badge ${template.isDefault ? '' : 'custom'}">
                                        ${template.isDefault ? 'Default' : 'Custom'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="teamsync-actions">
                        <button class="teamsync-btn teamsync-btn-secondary" onclick="createFromScratch()">
                            Start from Scratch
                        </button>
                        <button class="teamsync-btn" onclick="useSelectedTemplate()" id="use-template-btn" disabled>
                            Use Selected Template
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        canvas.html(html);
        
        // Add event listeners
        canvas.find('.teamsync-template-card').on('click', function() {
            var templateId = $(this).data('template-id');
            selectTemplate(templateId);
        });
        
        // Global functions for buttons
        window.createFromScratch = function() {
            instance.trigger('template_from_scratch', {
                event_type: state.eventType,
                timestamp: new Date().toISOString()
            });
        };
        
        window.useSelectedTemplate = function() {
            if (state.selectedTemplate) {
                instance.trigger('template_selected', {
                    template_id: state.selectedTemplate.id,
                    template_name: state.selectedTemplate.name,
                    template_data: state.selectedTemplate,
                    event_type: state.eventType,
                    timestamp: new Date().toISOString()
                });
            }
        };
    }
    
    // Select template function
    function selectTemplate(templateId) {
        // Remove previous selection
        canvas.find('.teamsync-template-card').removeClass('selected');
        
        // Find and select template
        var template = getAvailableTemplates().find(function(t) {
            return t.id === templateId;
        });
        
        if (template) {
            state.selectedTemplate = template;
            canvas.find(`[data-template-id="${templateId}"]`).addClass('selected');
            canvas.find('#use-template-btn').prop('disabled', false);
            
            // Trigger selection event
            instance.trigger('template_preview', {
                template_id: template.id,
                template_name: template.name,
                sections: template.sections,
                questions: template.questions,
                estimated_time: template.estimatedTime
            });
        }
    }
    
    // Helper function to get event type label
    function getEventTypeLabel(eventType) {
        switch(eventType) {
            case 'post_game': return 'Post-Match';
            case 'post_training': return 'Post-Training';
            case 'development': return 'Player Development';
            default: return 'General';
        }
    }
    
    // Public methods
    instance.getSelectedTemplate = function() {
        return state.selectedTemplate;
    };
    
    instance.refreshTemplates = function() {
        renderTemplateSelector();
    };
    
    instance.setEventType = function(eventType) {
        state.eventType = eventType;
        renderTemplateSelector();
    };
    
    // Initialize on load
    instance.init();
}

// =============================================================================
// FEEDBACK FORM BUILDER ELEMENT
// =============================================================================

function(instance, context) {
    var instance = this;
    var canvas = instance.canvas;
    var properties = instance.data;
    
    // State management
    var state = {
        currentForm: { sections: [], metadata: {} },
        selectedQuestion: null,
        selectedSection: null,
        questionBank: [],
        isEditing: false,
        isDirty: false
    };
    
    // Initialize plugin
    instance.init = function() {
        console.log('TeamSync Feedback - Form Builder initialized');
        
        // Get properties from Bubble
        state.questionBank = properties.question_bank || getDefaultQuestionBank();
        state.eventType = properties.event_type || 'post_game';
        
        // Load existing form if provided
        if (properties.existing_form) {
            state.currentForm = JSON.parse(properties.existing_form);
        }
        
        // Set up canvas
        canvas.empty();
        canvas.css({
            'min-height': '600px',
            'width': '100%',
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });
        
        // Render form builder interface
        renderFormBuilder();
        
        // Trigger ready event
        instance.trigger('form_builder_ready', {
            sections_count: state.currentForm.sections.length,
            event_type: state.eventType
        });
    };
    
    // Update when properties change
    instance.update = function() {
        console.log('TeamSync Feedback - Form Builder updated');
        
        var newQuestionBank = properties.question_bank || getDefaultQuestionBank();
        var newEventType = properties.event_type || 'post_game';
        var newExistingForm = properties.existing_form;
        
        if (JSON.stringify(newQuestionBank) !== JSON.stringify(state.questionBank) ||
            newEventType !== state.eventType ||
            newExistingForm !== JSON.stringify(state.currentForm)) {
            
            state.questionBank = newQuestionBank;
            state.eventType = newEventType;
            
            if (newExistingForm) {
                state.currentForm = JSON.parse(newExistingForm);
            }
            
            renderFormBuilder();
            
            instance.trigger('form_builder_updated', {
                sections_count: state.currentForm.sections.length,
                event_type: state.eventType
            });
        }
    };
    
    // Default question bank
    function getDefaultQuestionBank() {
        return [
            {
                id: 'perf_1',
                category: 'performance',
                type: 'rating',
                text: 'How would you rate your individual performance today?',
                scale: 10,
                icon: '⭐'
            },
            {
                id: 'perf_2',
                category: 'performance',
                type: 'rating',
                text: 'How would you rate the team\'s overall performance?',
                scale: 10,
                icon: '⭐'
            },
            {
                id: 'perf_3',
                category: 'performance',
                type: 'text',
                text: 'What was your strongest contribution to the team today?',
                icon: '💪'
            },
            {
                id: 'tact_1',
                category: 'tactics',
                type: 'rating',
                text: 'How well did we execute our game plan?',
                scale: 10,
                icon: '📋'
            },
            {
                id: 'tact_2',
                category: 'tactics',
                type: 'multiple_choice',
                text: 'Which tactical area needs most improvement?',
                options: ['Defensive Shape', 'Attack Transition', 'Set Pieces', 'Possession Play'],
                icon: '🎯'
            },
            {
                id: 'team_1',
                category: 'team',
                type: 'rating',
                text: 'How would you rate team communication today?',
                scale: 10,
                icon: '💬'
            },
            {
                id: 'team_2',
                category: 'team',
                type: 'yes_no',
                text: 'Do you feel your voice is heard in team decisions?',
                icon: '🗣️'
            },
            {
                id: 'train_1',
                category: 'training',
                type: 'rating',
                text: 'How would you rate today\'s training session?',
                scale: 10,
                icon: '🏃'
            }
        ];
    }
    
    // Render form builder interface
    function renderFormBuilder() {
        var html = `
            <div class="teamsync-form-builder">
                <style>
                    .teamsync-form-builder {
                        display: flex;
                        height: 100%;
                        min-height: 600px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .builder-panel {
                        flex: 1;
                        background: white;
                        border-right: 1px solid #e5e5e5;
                        display: flex;
                        flex-direction: column;
                    }
                    .builder-panel:last-child {
                        border-right: none;
                    }
                    .panel-header {
                        background: #0E79B2;
                        color: white;
                        padding: 16px;
                        font-weight: 600;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .panel-content {
                        flex: 1;
                        padding: 16px;
                        overflow-y: auto;
                    }
                    .form-section {
                        border: 2px solid #e5e5e5;
                        border-radius: 8px;
                        margin-bottom: 16px;
                        background: white;
                    }
                    .form-section.selected {
                        border-color: #0E79B2;
                    }
                    .section-header {
                        background: #f8f9fa;
                        padding: 12px 16px;
                        border-bottom: 1px solid #e5e5e5;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        cursor: pointer;
                    }
                    .section-questions {
                        padding: 16px;
                        min-height: 60px;
                        border: 2px dashed #e5e5e5;
                        border-radius: 4px;
                        margin: 12px;
                    }
                    .section-questions.drag-over {
                        border-color: #0E79B2;
                        background: #f8fcff;
                    }
                    .question-item {
                        background: #f8f9fa;
                        border: 1px solid #e5e5e5;
                        border-radius: 4px;
                        padding: 12px;
                        margin-bottom: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .question-item:hover {
                        background: #e9ecef;
                    }
                    .question-item.selected {
                        background: #f8fcff;
                        border-color: #0E79B2;
                    }
                    .question-bank-item {
                        background: white;
                        border: 1px solid #e5e5e5;
                        border-radius: 4px;
                        padding: 12px;
                        margin-bottom: 8px;
                        cursor: grab;
                        transition: all 0.2s ease;
                    }
                    .question-bank-item:hover {
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .question-bank-item.dragging {
                        opacity: 0.5;
                    }
                    .question-editor {
                        background: #f8f9fa;
                        border-radius: 4px;
                        padding: 16px;
                        margin-bottom: 16px;
                    }
                    .form-group {
                        margin-bottom: 16px;
                    }
                    .form-group label {
                        display: block;
                        margin-bottom: 4px;
                        font-weight: 500;
                        color: #333;
                    }
                    .form-group input,
                    .form-group select,
                    .form-group textarea {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #e5e5e5;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    .btn {
                        background: #0E79B2;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: background 0.2s ease;
                    }
                    .btn:hover {
                        background: #0c6a9a;
                    }
                    .btn-sm {
                        padding: 4px 8px;
                        font-size: 12px;
                    }
                    .btn-secondary {
                        background: #6c757d;
                    }
                    .btn-secondary:hover {
                        background: #5a6268;
                    }
                    .btn-danger {
                        background: #dc3545;
                    }
                    .btn-danger:hover {
                        background: #c82333;
                    }
                    .empty-state {
                        text-align: center;
                        color: #666;
                        padding: 40px 20px;
                    }
                    .empty-state i {
                        font-size: 32px;
                        color: #ccc;
                        margin-bottom: 16px;
                    }
                    .category-filter {
                        margin-bottom: 16px;
                    }
                    .category-filter select {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #e5e5e5;
                        border-radius: 4px;
                    }
                </style>
                
                <!-- Form Structure Panel -->
                <div class="builder-panel">
                    <div class="panel-header">
                        <span>📝 Form Structure</span>
                        <button class="btn btn-sm" onclick="addSection()">+ Add Section</button>
                    </div>
                    <div class="panel-content">
                        <div id="form-structure">
                            ${renderFormStructure()}
                        </div>
                    </div>
                </div>
                
                <!-- Question Editor Panel -->
                <div class="builder-panel">
                    <div class="panel-header">
                        <span>✏️ Question Editor</span>
                        <button class="btn btn-sm" onclick="saveQuestion()" id="save-question-btn" disabled>Save</button>
                    </div>
                    <div class="panel-content">
                        <div id="question-editor">
                            ${renderQuestionEditor()}
                        </div>
                    </div>
                </div>
                
                <!-- Question Bank Panel -->
                <div class="builder-panel">
                    <div class="panel-header">
                        <span>🗂️ Question Bank</span>
                        <button class="btn btn-sm" onclick="createCustomQuestion()">+ Custom</button>
                    </div>
                    <div class="panel-content">
                        <div class="category-filter">
                            <select id="category-filter" onchange="filterQuestionBank()">
                                <option value="all">All Categories</option>
                                <option value="performance">Performance</option>
                                <option value="tactics">Tactics</option>
                                <option value="team">Team Dynamics</option>
                                <option value="training">Training</option>
                            </select>
                        </div>
                        <div id="question-bank">
                            ${renderQuestionBank()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        canvas.html(html);
        setupDragAndDrop();
        
        // Global functions
        window.addSection = function() {
            var sectionId = 'section_' + Date.now();
            var section = {
                id: sectionId,
                title: 'New Section',
                questions: []
            };
            
            state.currentForm.sections.push(section);
            state.selectedSection = section;
            state.isDirty = true;
            
            renderFormBuilder();
            
            instance.trigger('section_added', {
                section_id: sectionId,
                sections_count: state.currentForm.sections.length
            });
        };
        
        window.saveQuestion = function() {
            if (state.selectedQuestion) {
                state.isDirty = true;
                canvas.find('#save-question-btn').prop('disabled', true);
                
                instance.trigger('question_saved', {
                    question_id: state.selectedQuestion.id,
                    question_type: state.selectedQuestion.type
                });
            }
        };
        
        window.createCustomQuestion = function() {
            var customQuestion = {
                id: 'custom_' + Date.now(),
                category: 'custom',
                type: 'text',
                text: 'Custom Question',
                icon: '❓'
            };
            
            state.questionBank.push(customQuestion);
            state.selectedQuestion = customQuestion;
            
            renderFormBuilder();
            
            instance.trigger('custom_question_created', {
                question_id: customQuestion.id
            });
        };
        
        window.filterQuestionBank = function() {
            renderQuestionBank();
        };
    }
    
    // Render form structure
    function renderFormStructure() {
        if (state.currentForm.sections.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>No sections yet. Add your first section to get started.</p>
                </div>
            `;
        }
        
        return state.currentForm.sections.map(function(section) {
            return `
                <div class="form-section ${state.selectedSection && state.selectedSection.id === section.id ? 'selected' : ''}" 
                     onclick="selectSection('${section.id}')">
                    <div class="section-header">
                        <span>${section.title}</span>
                        <div>
                            <button class="btn btn-sm btn-secondary" onclick="editSection('${section.id}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteSection('${section.id}')">Delete</button>
                        </div>
                    </div>
                    <div class="section-questions" 
                         ondrop="dropQuestion(event, '${section.id}')" 
                         ondragover="allowDrop(event)">
                        ${section.questions.map(function(question) {
                            return `
                                <div class="question-item ${state.selectedQuestion && state.selectedQuestion.id === question.id ? 'selected' : ''}" 
                                     onclick="selectQuestion('${question.id}')">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span>${question.icon || '❓'}</span>
                                        <span>${question.text}</span>
                                        <span style="margin-left: auto; font-size: 12px; color: #666;">${question.type}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        ${section.questions.length === 0 ? '<div style="text-align: center; color: #666; padding: 20px;">Drop questions here</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Render question editor
    function renderQuestionEditor() {
        if (!state.selectedQuestion) {
            return `
                <div class="empty-state">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Select a question to edit or drag from Question Bank</p>
                </div>
            `;
        }
        
        return `
            <div class="question-editor">
                <div class="form-group">
                    <label>Question Text</label>
                    <textarea id="question-text" rows="3" onchange="updateQuestion()">${state.selectedQuestion.text}</textarea>
                </div>
                <div class="form-group">
                    <label>Question Type</label>
                    <select id="question-type" onchange="updateQuestion()">
                        <option value="text" ${state.selectedQuestion.type === 'text' ? 'selected' : ''}>Text</option>
                        <option value="rating" ${state.selectedQuestion.type === 'rating' ? 'selected' : ''}>Rating</option>
                        <option value="multiple_choice" ${state.selectedQuestion.type === 'multiple_choice' ? 'selected' : ''}>Multiple Choice</option>
                        <option value="yes_no" ${state.selectedQuestion.type === 'yes_no' ? 'selected' : ''}>Yes/No</option>
                    </select>
                </div>
                ${state.selectedQuestion.type === 'rating' ? `
                    <div class="form-group">
                        <label>Rating Scale</label>
                        <select id="question-scale" onchange="updateQuestion()">
                            <option value="5" ${state.selectedQuestion.scale === 5 ? 'selected' : ''}>1-5</option>
                            <option value="10" ${state.selectedQuestion.scale === 10 ? 'selected' : ''}>1-10</option>
                        </select>
                    </div>
                ` : ''}
                ${state.selectedQuestion.type === 'multiple_choice' ? `
                    <div class="form-group">
                        <label>Options (one per line)</label>
                        <textarea id="question-options" rows="4" onchange="updateQuestion()">${(state.selectedQuestion.options || []).join('\\n')}</textarea>
                    </div>
                ` : ''}
                <div class="form-group">
                    <label>Icon</label>
                    <input type="text" id="question-icon" value="${state.selectedQuestion.icon || ''}" onchange="updateQuestion()">
                </div>
            </div>
        `;
    }
    
    // Render question bank
    function renderQuestionBank() {
        var category = canvas.find('#category-filter').val() || 'all';
        var filteredQuestions = state.questionBank.filter(function(question) {
            return category === 'all' || question.category === category;
        });
        
        return filteredQuestions.map(function(question) {
            return `
                <div class="question-bank-item" 
                     draggable="true" 
                     ondragstart="dragStart(event, '${question.id}')">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${question.icon || '❓'}</span>
                        <div>
                            <div style="font-weight: 500;">${question.text}</div>
                            <div style="font-size: 12px; color: #666;">${question.type} • ${question.category}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Set up drag and drop
    function setupDragAndDrop() {
        window.dragStart = function(event, questionId) {
            event.dataTransfer.setData('text/plain', questionId);
        };
        
        window.allowDrop = function(event) {
            event.preventDefault();
        };
        
        window.dropQuestion = function(event, sectionId) {
            event.preventDefault();
            var questionId = event.dataTransfer.getData('text/plain');
            var question = state.questionBank.find(function(q) { return q.id === questionId; });
            
            if (question) {
                var section = state.currentForm.sections.find(function(s) { return s.id === sectionId; });
                if (section) {
                    // Create copy of question
                    var questionCopy = Object.assign({}, question);
                    questionCopy.id = question.id + '_' + Date.now();
                    
                    section.questions.push(questionCopy);
                    state.isDirty = true;
                    
                    renderFormBuilder();
                    
                    instance.trigger('question_added', {
                        question_id: questionCopy.id,
                        section_id: sectionId,
                        question_type: question.type
                    });
                }
            }
        };
        
        window.selectSection = function(sectionId) {
            state.selectedSection = state.currentForm.sections.find(function(s) { return s.id === sectionId; });
            renderFormBuilder();
        };
        
        window.selectQuestion = function(questionId) {
            // Find question in any section
            for (var i = 0; i < state.currentForm.sections.length; i++) {
                var question = state.currentForm.sections[i].questions.find(function(q) { return q.id === questionId; });
                if (question) {
                    state.selectedQuestion = question;
                    break;
                }
            }
            renderFormBuilder();
        };
        
        window.updateQuestion = function() {
            if (state.selectedQuestion) {
                state.selectedQuestion.text = canvas.find('#question-text').val();
                state.selectedQuestion.type = canvas.find('#question-type').val();
                state.selectedQuestion.icon = canvas.find('#question-icon').val();
                
                if (state.selectedQuestion.type === 'rating') {
                    state.selectedQuestion.scale = parseInt(canvas.find('#question-scale').val());
                }
                
                if (state.selectedQuestion.type === 'multiple_choice') {
                    state.selectedQuestion.options = canvas.find('#question-options').val().split('\\n').filter(Boolean);
                }
                
                state.isDirty = true;
                canvas.find('#save-question-btn').prop('disabled', false);
                
                // Update structure view
                canvas.find('#form-structure').html(renderFormStructure());
            }
        };
    }
    
    // Public methods
    instance.getCurrentForm = function() {
        return state.currentForm;
    };
    
    instance.saveForm = function() {
        state.isDirty = false;
        
        instance.trigger('form_created', {
            form_data: state.currentForm,
            sections_count: state.currentForm.sections.length,
            questions_count: state.currentForm.sections.reduce(function(total, section) {
                return total + section.questions.length;
            }, 0)
        });
        
        return state.currentForm;
    };
    
    instance.loadForm = function(formData) {
        state.currentForm = formData;
        renderFormBuilder();
        
        instance.trigger('form_loaded', {
            sections_count: state.currentForm.sections.length
        });
    };
    
    // Initialize
    instance.init();
}

// =============================================================================
// FEEDBACK FORM RENDERER ELEMENT
// =============================================================================

function(instance, context) {
    var instance = this;
    var canvas = instance.canvas;
    var properties = instance.data;
    
    // State management
    var state = {
        formData: null,
        currentSection: 0,
        responses: {},
        isAnonymous: false,
        isSubmitting: false,
        progress: 0,
        userId: null
    };
    
    // Initialize plugin
    instance.init = function() {
        console.log('TeamSync Feedback - Form Renderer initialized');
        
        // Get properties from Bubble
        state.formData = properties.form_data ? JSON.parse(properties.form_data) : null;
        state.isAnonymous = properties.anonymous_mode || false;
        state.userId = properties.user_id || null;
        
        // Set up canvas
        canvas.empty();
        canvas.css({
            'min-height': '400px',
            'width': '100%',
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'background': '#f8f9fa'
        });
        
        if (state.formData) {
            renderFormRenderer();
        } else {
            renderNoFormMessage();
        }
        
        // Trigger ready event
        instance.trigger('form_renderer_ready', {
            form_loaded: !!state.formData,
            anonymous_mode: state.isAnonymous,
            sections_count: state.formData ? state.formData.sections.length : 0
        });
    };
    
    // Update when properties change
    instance.update = function() {
        console.log('TeamSync Feedback - Form Renderer updated');
        
        var newFormData = properties.form_data ? JSON.parse(properties.form_data) : null;
        var newAnonymous = properties.anonymous_mode || false;
        var newUserId = properties.user_id || null;
        
        if (JSON.stringify(newFormData) !== JSON.stringify(state.formData) ||
            newAnonymous !== state.isAnonymous ||
            newUserId !== state.userId) {
            
            state.formData = newFormData;
            state.isAnonymous = newAnonymous;
            state.userId = newUserId;
            
            // Reset form state
            state.currentSection = 0;
            state.responses = {};
            state.progress = 0;
            
            if (state.formData) {
                renderFormRenderer();
            } else {
                renderNoFormMessage();
            }
            
            instance.trigger('form_renderer_updated', {
                form_loaded: !!state.formData,
                anonymous_mode: state.isAnonymous
            });
        }
    };
    
    // Render no form message
    function renderNoFormMessage() {
        var html = `
            <div class="teamsync-form-renderer">
                <style>
                    .teamsync-form-renderer {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        padding: 40px;
                        text-align: center;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .no-form-icon {
                        font-size: 48px;
                        color: #ccc;
                        margin-bottom: 20px;
                    }
                    .no-form-message {
                        color: #666;
                        font-size: 16px;
                        margin-bottom: 8px;
                    }
                    .no-form-subtitle {
                        color: #999;
                        font-size: 14px;
                    }
                </style>
                <div class="no-form-icon">📋</div>
                <div class="no-form-message">No feedback form available</div>
                <div class="no-form-subtitle">Please check with your coach</div>
            </div>
        `;
        
        canvas.html(html);
    }
    
    // Render form renderer interface
    function renderFormRenderer() {
        if (!state.formData || !state.formData.sections || state.formData.sections.length === 0) {
            renderNoFormMessage();
            return;
        }
        
        var currentSectionData = state.formData.sections[state.currentSection];
        var totalQuestions = state.formData.sections.reduce(function(total, section) {
            return total + section.questions.length;
        }, 0);
        var answeredQuestions = Object.keys(state.responses).length;
        state.progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
        
        var html = `
            <div class="teamsync-form-renderer">
                <style>
                    .teamsync-form-renderer {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .form-header {
                        background: #0E79B2;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        position: relative;
                    }
                    .form-title {
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 8px;
                    }
                    .form-subtitle {
                        opacity: 0.9;
                        font-size: 14px;
                    }
                    .anonymous-badge {
                        position: absolute;
                        top: 10px;
                        right: 15px;
                        background: rgba(255,255,255,0.2);
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                    }
                    .progress-bar {
                        height: 4px;
                        background: rgba(255,255,255,0.3);
                        position: relative;
                        overflow: hidden;
                    }
                    .progress-fill {
                        height: 100%;
                        background: #22c55e;
                        transition: width 0.3s ease;
                        width: ${state.progress}%;
                    }
                    .section-header {
                        background: #f8f9fa;
                        padding: 20px;
                        border-bottom: 1px solid #e5e5e5;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1a1a1a;
                        margin-bottom: 4px;
                    }
                    .section-progress {
                        font-size: 14px;
                        color: #666;
                    }
                    .form-content {
                        padding: 24px;
                    }
                    .question-item {
                        margin-bottom: 32px;
                        padding-bottom: 24px;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    .question-item:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                    }
                    .question-header {
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    .question-icon {
                        font-size: 20px;
                        margin-top: 2px;
                    }
                    .question-text {
                        font-size: 16px;
                        font-weight: 500;
                        color: #1a1a1a;
                        line-height: 1.5;
                    }
                    .question-input {
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e5e5e5;
                        border-radius: 6px;
                        font-size: 14px;
                        transition: border-color 0.2s ease;
                    }
                    .question-input:focus {
                        outline: none;
                        border-color: #0E79B2;
                    }
                    .question-textarea {
                        min-height: 80px;
                        resize: vertical;
                    }
                    .rating-scale {
                        display: flex;
                        gap: 8px;
                        align-items: center;
                        margin-top: 8px;
                    }
                    .rating-button {
                        background: #f8f9fa;
                        border: 2px solid #e5e5e5;
                        color: #666;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                        min-width: 40px;
                        text-align: center;
                    }
                    .rating-button:hover {
                        background: #e9ecef;
                        border-color: #dee2e6;
                    }
                    .rating-button.selected {
                        background: #0E79B2;
                        border-color: #0E79B2;
                        color: white;
                    }
                    .rating-labels {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 8px;
                        font-size: 12px;
                        color: #666;
                    }
                    .choice-options {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .choice-option {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: #f8f9fa;
                        border: 2px solid #e5e5e5;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .choice-option:hover {
                        background: #e9ecef;
                        border-color: #dee2e6;
                    }
                    .choice-option.selected {
                        background: #f8fcff;
                        border-color: #0E79B2;
                    }
                    .choice-radio {
                        width: 16px;
                        height: 16px;
                        border: 2px solid #e5e5e5;
                        border-radius: 50%;
                        position: relative;
                        transition: border-color 0.2s ease;
                    }
                    .choice-option.selected .choice-radio {
                        border-color: #0E79B2;
                    }
                    .choice-option.selected .choice-radio::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 8px;
                        height: 8px;
                        background: #0E79B2;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                    }
                    .yes-no-buttons {
                        display: flex;
                        gap: 12px;
                    }
                    .yes-no-button {
                        flex: 1;
                        padding: 12px;
                        background: #f8f9fa;
                        border: 2px solid #e5e5e5;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        text-align: center;
                        transition: all 0.2s ease;
                    }
                    .yes-no-button:hover {
                        background: #e9ecef;
                        border-color: #dee2e6;
                    }
                    .yes-no-button.selected {
                        background: #0E79B2;
                        border-color: #0E79B2;
                        color: white;
                    }
                    .form-actions {
                        background: #f8f9fa;
                        padding: 20px 24px;
                        border-top: 1px solid #e5e5e5;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .btn-primary {
                        background: #0E79B2;
                        color: white;
                    }
                    .btn-primary:hover {
                        background: #0c6a9a;
                    }
                    .btn-secondary {
                        background: #f8f9fa;
                        color: #666;
                        border: 2px solid #e5e5e5;
                    }
                    .btn-secondary:hover {
                        background: #e9ecef;
                        border-color: #dee2e6;
                    }
                    .btn-success {
                        background: #22c55e;
                        color: white;
                    }
                    .btn-success:hover {
                        background: #16a34a;
                    }
                    .btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                    .section-indicator {
                        display: flex;
                        gap: 4px;
                        align-items: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .section-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #e5e5e5;
                    }
                    .section-dot.active {
                        background: #0E79B2;
                    }
                    .section-dot.completed {
                        background: #22c55e;
                    }
                    @media (max-width: 768px) {
                        .teamsync-form-renderer {
                            margin: 0;
                            border-radius: 0;
                        }
                        .form-content {
                            padding: 16px;
                        }
                        .question-item {
                            margin-bottom: 24px;
                            padding-bottom: 16px;
                        }
                        .rating-scale {
                            flex-wrap: wrap;
                        }
                        .yes-no-buttons {
                            flex-direction: column;
                        }
                    }
                </style>
                
                <div class="form-header">
                    ${state.isAnonymous ? '<div class="anonymous-badge">🔒 Anonymous</div>' : ''}
                    <div class="form-title">${state.formData.title || 'Feedback Form'}</div>
                    <div class="form-subtitle">Section ${state.currentSection + 1} of ${state.formData.sections.length}</div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
                
                <div class="section-header">
                    <div class="section-title">${currentSectionData.title}</div>
                    <div class="section-progress">
                        <div class="section-indicator">
                            ${state.formData.sections.map(function(section, index) {
                                var className = 'section-dot';
                                if (index < state.currentSection) className += ' completed';
                                if (index === state.currentSection) className += ' active';
                                return `<div class="${className}"></div>`;
                            }).join('')}
                            <span>${answeredQuestions} of ${totalQuestions} questions answered</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-content">
                    ${currentSectionData.questions.map(function(question, index) {
                        return renderQuestion(question, index);
                    }).join('')}
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="previousSection()" ${state.currentSection === 0 ? 'disabled' : ''}>
                        ← Previous
                    </button>
                    <div class="section-indicator">
                        ${state.formData.sections.map(function(section, index) {
                            var className = 'section-dot';
                            if (index < state.currentSection) className += ' completed';
                            if (index === state.currentSection) className += ' active';
                            return `<div class="${className}"></div>`;
                        }).join('')}
                    </div>
                    ${state.currentSection === state.formData.sections.length - 1 ? 
                        `<button class="btn btn-success" onclick="submitForm()" ${state.isSubmitting ? 'disabled' : ''}>
                            ${state.isSubmitting ? 'Submitting...' : 'Submit Form'}
                        </button>` :
                        `<button class="btn btn-primary" onclick="nextSection()">
                            Next →
                        </button>`
                    }
                </div>
            </div>
        `;
        
        canvas.html(html);
        
        // Set up event handlers
        setupFormHandlers();
        
        // Global functions
        window.nextSection = function() {
            if (state.currentSection < state.formData.sections.length - 1) {
                state.currentSection++;
                renderFormRenderer();
                
                instance.trigger('section_changed', {
                    section_index: state.currentSection,
                    section_title: state.formData.sections[state.currentSection].title
                });
            }
        };
        
        window.previousSection = function() {
            if (state.currentSection > 0) {
                state.currentSection--;
                renderFormRenderer();
                
                instance.trigger('section_changed', {
                    section_index: state.currentSection,
                    section_title: state.formData.sections[state.currentSection].title
                });
            }
        };
        
        window.submitForm = function() {
            if (state.isSubmitting) return;
            
            state.isSubmitting = true;
            canvas.find('.btn-success').prop('disabled', true).text('Submitting...');
            
            var responseData = {
                form_id: state.formData.id,
                user_id: state.isAnonymous ? null : state.userId,
                is_anonymous: state.isAnonymous,
                responses: state.responses,
                submitted_at: new Date().toISOString(),
                completion_time: Date.now() - (state.startTime || Date.now())
            };
            
            // Simulate submission delay
            setTimeout(function() {
                instance.trigger('response_submitted', responseData);
                
                // Show success message
                canvas.html(`
                    <div class="teamsync-form-renderer">
                        <div class="form-header">
                            <div class="form-title">✅ Thank You!</div>
                            <div class="form-subtitle">Your feedback has been submitted successfully</div>
                        </div>
                        <div style="padding: 40px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                            <div style="font-size: 16px; color: #666; margin-bottom: 8px;">
                                Your feedback helps improve the team
                            </div>
                            <div style="font-size: 14px; color: #999;">
                                ${state.isAnonymous ? 'Submitted anonymously' : 'Submitted successfully'}
                            </div>
                        </div>
                    </div>
                `);
                
                state.isSubmitting = false;
            }, 1500);
        };
    }
    
    // Render individual question
    function renderQuestion(question, index) {
        var questionId = question.id;
        var currentResponse = state.responses[questionId];
        
        var html = `
            <div class="question-item">
                <div class="question-header">
                    <div class="question-icon">${question.icon || '❓'}</div>
                    <div class="question-text">${question.text}</div>
                </div>
        `;
        
        switch (question.type) {
            case 'text':
                html += `
                    <textarea class="question-input question-textarea" 
                              id="${questionId}" 
                              placeholder="Your answer..."
                              onchange="updateResponse('${questionId}', this.value)">${currentResponse || ''}</textarea>
                `;
                break;
                
            case 'rating':
                var scale = question.scale || 10;
                html += `
                    <div class="rating-scale">
                        ${Array.from({length: scale}, function(_, i) {
                            var value = i + 1;
                            var selected = currentResponse == value ? 'selected' : '';
                            return `<button class="rating-button ${selected}" onclick="updateResponse('${questionId}', ${value})">${value}</button>`;
                        }).join('')}
                    </div>
                    <div class="rating-labels">
                        <span>Poor</span>
                        <span>Excellent</span>
                    </div>
                `;
                break;
                
            case 'multiple_choice':
                html += `
                    <div class="choice-options">
                        ${(question.options || []).map(function(option) {
                            var selected = currentResponse === option ? 'selected' : '';
                            return `
                                <div class="choice-option ${selected}" onclick="updateResponse('${questionId}', '${option}')">
                                    <div class="choice-radio"></div>
                                    <span>${option}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                break;
                
            case 'yes_no':
                html += `
                    <div class="yes-no-buttons">
                        <button class="yes-no-button ${currentResponse === 'Yes' ? 'selected' : ''}" 
                                onclick="updateResponse('${questionId}', 'Yes')">
                            Yes
                        </button>
                        <button class="yes-no-button ${currentResponse === 'No' ? 'selected' : ''}" 
                                onclick="updateResponse('${questionId}', 'No')">
                            No
                        </button>
                    </div>
                `;
                break;
        }
        
        html += `</div>`;
        return html;
    }
    
    // Set up form handlers
    function setupFormHandlers() {
        window.updateResponse = function(questionId, value) {
            state.responses[questionId] = value;
            
            // Update UI
            if (canvas.find(`#${questionId}`).length > 0) {
                canvas.find(`#${questionId}`).val(value);
            }
            
            // Update progress
            var totalQuestions = state.formData.sections.reduce(function(total, section) {
                return total + section.questions.length;
            }, 0);
            var answeredQuestions = Object.keys(state.responses).length;
            state.progress = (answeredQuestions / totalQuestions) * 100;
            
            // Update progress bar
            canvas.find('.progress-fill').css('width', state.progress + '%');
            
            // Trigger response event
            instance.trigger('response_updated', {
                question_id: questionId,
                response_value: value,
                progress: state.progress
            });
        };
        
        // Record start time
        if (!state.startTime) {
            state.startTime = Date.now();
        }
    }
    
    // Public methods
    instance.getResponses = function() {
        return state.responses;
    };
    
    instance.getProgress = function() {
        return state.progress;
    };
    
    instance.resetForm = function() {
        state.currentSection = 0;
        state.responses = {};
        state.progress = 0;
        state.isSubmitting = false;
        renderFormRenderer();
    };
    
    instance.setAnonymousMode = function(anonymous) {
        state.isAnonymous = anonymous;
        renderFormRenderer();
    };
    
    // Initialize
    instance.init();
}

// =============================================================================
// FEEDBACK RESULTS DASHBOARD ELEMENT
// =============================================================================

function(instance, context) {
    var instance = this;
    var canvas = instance.canvas;
    var properties = instance.data;
    
    // State management
    var state = {
        formData: null,
        responses: [],
        analytics: null,
        currentView: 'overview',
        filters: {
            dateRange: 'all',
            anonymous: 'all',
            section: 'all'
        },
        isLoading: false
    };
    
    // Initialize plugin
    instance.init = function() {
        console.log('TeamSync Feedback - Results Dashboard initialized');
        
        // Get properties from Bubble
        state.formData = properties.form_data ? JSON.parse(properties.form_data) : null;
        state.responses = properties.responses ? JSON.parse(properties.responses) : [];
        
        // Set up canvas
        canvas.empty();
        canvas.css({
            'min-height': '500px',
            'width': '100%',
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });
        
        if (state.formData) {
            calculateAnalytics();
            renderResultsDashboard();
        } else {
            renderNoDataMessage();
        }
        
        // Trigger ready event
        instance.trigger('results_dashboard_ready', {
            form_loaded: !!state.formData,
            responses_count: state.responses.length,
            analytics_generated: !!state.analytics
        });
    };
    
    // Update when properties change
    instance.update = function() {
        console.log('TeamSync Feedback - Results Dashboard updated');
        
        var newFormData = properties.form_data ? JSON.parse(properties.form_data) : null;
        var newResponses = properties.responses ? JSON.parse(properties.responses) : [];
        
        if (JSON.stringify(newFormData) !== JSON.stringify(state.formData) ||
            JSON.stringify(newResponses) !== JSON.stringify(state.responses)) {
            
            state.formData = newFormData;
            state.responses = newResponses;
            
            if (state.formData) {
                calculateAnalytics();
                renderResultsDashboard();
            } else {
                renderNoDataMessage();
            }
            
            instance.trigger('results_dashboard_updated', {
                form_loaded: !!state.formData,
                responses_count: state.responses.length,
                analytics_generated: !!state.analytics
            });
        }
    };
    
    // Calculate analytics from responses
    function calculateAnalytics() {
        if (!state.formData || !state.responses.length) {
            state.analytics = null;
            return;
        }
        
        var totalResponses = state.responses.length;
        var anonymousResponses = state.responses.filter(function(r) { return r.is_anonymous; }).length;
        var avgCompletionTime = state.responses.reduce(function(sum, r) { 
            return sum + (r.completion_time || 0); 
        }, 0) / totalResponses;
        
        // Question-level analytics
        var questionAnalytics = {};
        state.formData.sections.forEach(function(section) {
            section.questions.forEach(function(question) {
                var questionResponses = state.responses.map(function(r) {
                    return r.responses[question.id];
                }).filter(Boolean);
                
                var analytics = {
                    question_id: question.id,
                    question_text: question.text,
                    question_type: question.type,
                    response_count: questionResponses.length,
                    response_rate: (questionResponses.length / totalResponses) * 100
                };
                
                if (question.type === 'rating') {
                    var ratings = questionResponses.map(Number).filter(function(n) { return !isNaN(n); });
                    analytics.average_rating = ratings.length > 0 ? 
                        ratings.reduce(function(sum, r) { return sum + r; }, 0) / ratings.length : 0;
                    analytics.rating_distribution = {};
                    for (var i = 1; i <= (question.scale || 10); i++) {
                        analytics.rating_distribution[i] = ratings.filter(function(r) { return r === i; }).length;
                    }
                }
                
                if (question.type === 'multiple_choice') {
                    analytics.choice_distribution = {};
                    (question.options || []).forEach(function(option) {
                        analytics.choice_distribution[option] = questionResponses.filter(function(r) { 
                            return r === option; 
                        }).length;
                    });
                }
                
                if (question.type === 'yes_no') {
                    analytics.yes_count = questionResponses.filter(function(r) { return r === 'Yes'; }).length;
                    analytics.no_count = questionResponses.filter(function(r) { return r === 'No'; }).length;
                }
                
                if (question.type === 'text') {
                    analytics.text_responses = questionResponses.slice(0, 10); // Sample responses
                }
                
                questionAnalytics[question.id] = analytics;
            });
        });
        
        state.analytics = {
            overview: {
                total_responses: totalResponses,
                anonymous_responses: anonymousResponses,
                identified_responses: totalResponses - anonymousResponses,
                response_rate: 100, // Placeholder - would need total invitations
                avg_completion_time: avgCompletionTime,
                completion_rate: 100 // Placeholder - would need partial submissions
            },
            questions: questionAnalytics,
            trends: {
                daily_responses: generateDailyTrends(),
                completion_times: generateCompletionTrends()
            }
        };
    }
    
    // Generate daily response trends
    function generateDailyTrends() {
        var trends = {};
        state.responses.forEach(function(response) {
            var date = new Date(response.submitted_at).toDateString();
            trends[date] = (trends[date] || 0) + 1;
        });
        return trends;
    }
    
    // Generate completion time trends
    function generateCompletionTrends() {
        return state.responses.map(function(response) {
            return {
                date: new Date(response.submitted_at).toDateString(),
                completion_time: response.completion_time || 0
            };
        });
    }
    
    // Render no data message
    function renderNoDataMessage() {
        var html = `
            <div class="teamsync-results-dashboard">
                <style>
                    .teamsync-results-dashboard {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        padding: 40px;
                        text-align: center;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .no-data-icon {
                        font-size: 48px;
                        color: #ccc;
                        margin-bottom: 20px;
                    }
                    .no-data-message {
                        color: #666;
                        font-size: 16px;
                        margin-bottom: 8px;
                    }
                    .no-data-subtitle {
                        color: #999;
                        font-size: 14px;
                    }
                </style>
                <div class="no-data-icon">📊</div>
                <div class="no-data-message">No feedback data available</div>
                <div class="no-data-subtitle">Results will appear here once responses are collected</div>
            </div>
        `;
        
        canvas.html(html);
    }
    
    // Render results dashboard
    function renderResultsDashboard() {
        if (!state.analytics) {
            renderNoDataMessage();
            return;
        }
        
        var html = `
            <div class="teamsync-results-dashboard">
                <style>
                    .teamsync-results-dashboard {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .dashboard-header {
                        background: #0E79B2;
                        color: white;
                        padding: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .dashboard-title {
                        font-size: 20px;
                        font-weight: 600;
                    }
                    .dashboard-filters {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                    }
                    .filter-select {
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    .dashboard-nav {
                        background: #f8f9fa;
                        padding: 16px 20px;
                        border-bottom: 1px solid #e5e5e5;
                    }
                    .nav-tabs {
                        display: flex;
                        gap: 8px;
                    }
                    .nav-tab {
                        padding: 8px 16px;
                        background: transparent;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        color: #666;
                        transition: all 0.2s ease;
                    }
                    .nav-tab.active {
                        background: #0E79B2;
                        color: white;
                    }
                    .nav-tab:hover:not(.active) {
                        background: #e9ecef;
                    }
                    .dashboard-content {
                        padding: 24px;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                        margin-bottom: 32px;
                    }
                    .stat-card {
                        background: #f8f9fa;
                        border: 1px solid #e5e5e5;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                    }
                    .stat-number {
                        font-size: 32px;
                        font-weight: 700;
                        color: #0E79B2;
                        margin-bottom: 8px;
                    }
                    .stat-label {
                        font-size: 14px;
                        color: #666;
                        font-weight: 500;
                    }
                    .stat-sublabel {
                        font-size: 12px;
                        color: #999;
                        margin-top: 4px;
                    }
                    .questions-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                        gap: 24px;
                    }
                    .question-card {
                        background: #f8f9fa;
                        border: 1px solid #e5e5e5;
                        border-radius: 8px;
                        padding: 20px;
                    }
                    .question-header {
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    .question-icon {
                        font-size: 18px;
                        margin-top: 2px;
                    }
                    .question-text {
                        font-size: 16px;
                        font-weight: 500;
                        color: #1a1a1a;
                        flex: 1;
                    }
                    .question-type {
                        font-size: 12px;
                        color: #666;
                        background: #e9ecef;
                        padding: 2px 6px;
                        border-radius: 4px;
                    }
                    .question-stats {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 16px;
                        font-size: 14px;
                        color: #666;
                    }
                    .rating-bars {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    .rating-bar {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 12px;
                    }
                    .rating-label {
                        min-width: 20px;
                        text-align: right;
                    }
                    .rating-fill {
                        flex: 1;
                        height: 16px;
                        background: #e5e5e5;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .rating-value {
                        height: 100%;
                        background: #0E79B2;
                        border-radius: 8px;
                        transition: width 0.3s ease;
                    }
                    .rating-count {
                        min-width: 30px;
                        text-align: left;
                        color: #666;
                    }
                    .choice-bars {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .choice-bar {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-size: 14px;
                    }
                    .choice-label {
                        flex: 1;
                        font-weight: 500;
                    }
                    .choice-fill {
                        flex: 2;
                        height: 20px;
                        background: #e5e5e5;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .choice-value {
                        height: 100%;
                        background: #0E79B2;
                        border-radius: 10px;
                        transition: width 0.3s ease;
                    }
                    .choice-count {
                        min-width: 40px;
                        text-align: right;
                        color: #666;
                        font-weight: 500;
                    }
                    .yes-no-chart {
                        display: flex;
                        gap: 16px;
                        justify-content: center;
                        align-items: center;
                    }
                    .yes-no-item {
                        text-align: center;
                    }
                    .yes-no-circle {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        font-weight: 700;
                        color: white;
                        margin-bottom: 8px;
                    }
                    .yes-circle {
                        background: #22c55e;
                    }
                    .no-circle {
                        background: #ef4444;
                    }
                    .yes-no-label {
                        font-size: 14px;
                        font-weight: 500;
                        color: #666;
                    }
                    .text-responses {
                        max-height: 200px;
                        overflow-y: auto;
                        border: 1px solid #e5e5e5;
                        border-radius: 4px;
                        padding: 12px;
                        background: white;
                    }
                    .text-response {
                        padding: 8px 0;
                        border-bottom: 1px solid #f0f0f0;
                        font-size: 14px;
                        color: #333;
                    }
                    .text-response:last-child {
                        border-bottom: none;
                    }
                    .average-rating {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 18px;
                        font-weight: 600;
                        color: #0E79B2;
                        margin-bottom: 16px;
                    }
                    .rating-stars {
                        color: #fbbf24;
                    }
                    @media (max-width: 768px) {
                        .dashboard-header {
                            flex-direction: column;
                            gap: 16px;
                            align-items: flex-start;
                        }
                        .dashboard-filters {
                            width: 100%;
                            justify-content: flex-start;
                        }
                        .stats-grid {
                            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        }
                        .questions-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
                
                <div class="dashboard-header">
                    <div class="dashboard-title">📊 Feedback Results</div>
                    <div class="dashboard-filters">
                        <select class="filter-select" id="date-filter" onchange="updateFilters()">
                            <option value="all">All Time</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                        </select>
                        <select class="filter-select" id="anonymous-filter" onchange="updateFilters()">
                            <option value="all">All Responses</option>
                            <option value="anonymous">Anonymous Only</option>
                            <option value="identified">Identified Only</option>
                        </select>
                    </div>
                </div>
                
                <div class="dashboard-nav">
                    <div class="nav-tabs">
                        <button class="nav-tab ${state.currentView === 'overview' ? 'active' : ''}" 
                                onclick="changeView('overview')">Overview</button>
                        <button class="nav-tab ${state.currentView === 'questions' ? 'active' : ''}" 
                                onclick="changeView('questions')">Questions</button>
                        <button class="nav-tab ${state.currentView === 'trends' ? 'active' : ''}" 
                                onclick="changeView('trends')">Trends</button>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    ${renderCurrentView()}
                </div>
            </div>
        `;
        
        canvas.html(html);
        
        // Set up event handlers
        setupDashboardHandlers();
    }
    
    // Render current view content
    function renderCurrentView() {
        switch (state.currentView) {
            case 'overview':
                return renderOverviewContent();
            case 'questions':
                return renderQuestionsContent();
            case 'trends':
                return renderTrendsContent();
            default:
                return renderOverviewContent();
        }
    }
    
    // Render overview content
    function renderOverviewContent() {
        var analytics = state.analytics.overview;
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${analytics.total_responses}</div>
                    <div class="stat-label">Total Responses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${analytics.anonymous_responses}</div>
                    <div class="stat-label">Anonymous</div>
                    <div class="stat-sublabel">${Math.round((analytics.anonymous_responses / analytics.total_responses) * 100)}% of total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(analytics.response_rate)}%</div>
                    <div class="stat-label">Response Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(analytics.avg_completion_time / 1000)}s</div>
                    <div class="stat-label">Avg Completion</div>
                </div>
            </div>
            
            <div class="questions-grid">
                ${Object.keys(state.analytics.questions).slice(0, 4).map(function(questionId) {
                    return renderQuestionCard(state.analytics.questions[questionId]);
                }).join('')}
            </div>
        `;
    }
    
    // Render questions content
    function renderQuestionsContent() {
        return `
            <div class="questions-grid">
                ${Object.keys(state.analytics.questions).map(function(questionId) {
                    return renderQuestionCard(state.analytics.questions[questionId]);
                }).join('')}
            </div>
        `;
    }
    
    // Render question card
    function renderQuestionCard(questionData) {
        var html = `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-icon">${getQuestionIcon(questionData.question_type)}</div>
                    <div class="question-text">${questionData.question_text}</div>
                    <div class="question-type">${questionData.question_type}</div>
                </div>
                <div class="question-stats">
                    <span>${questionData.response_count} responses</span>
                    <span>${Math.round(questionData.response_rate)}% response rate</span>
                </div>
        `;
        
        if (questionData.question_type === 'rating') {
            var maxCount = Math.max(...Object.values(questionData.rating_distribution));
            html += `
                <div class="average-rating">
                    <span>${questionData.average_rating.toFixed(1)}</span>
                    <span class="rating-stars">★★★★★</span>
                    <span>average</span>
                </div>
                <div class="rating-bars">
                    ${Object.keys(questionData.rating_distribution).map(function(rating) {
                        var count = questionData.rating_distribution[rating];
                        var percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return `
                            <div class="rating-bar">
                                <div class="rating-label">${rating}</div>
                                <div class="rating-fill">
                                    <div class="rating-value" style="width: ${percentage}%"></div>
                                </div>
                                <div class="rating-count">${count}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (questionData.question_type === 'multiple_choice') {
            var totalChoices = Object.values(questionData.choice_distribution).reduce(function(sum, count) {
                return sum + count;
            }, 0);
            html += `
                <div class="choice-bars">
                    ${Object.keys(questionData.choice_distribution).map(function(choice) {
                        var count = questionData.choice_distribution[choice];
                        var percentage = totalChoices > 0 ? (count / totalChoices) * 100 : 0;
                        return `
                            <div class="choice-bar">
                                <div class="choice-label">${choice}</div>
                                <div class="choice-fill">
                                    <div class="choice-value" style="width: ${percentage}%"></div>
                                </div>
                                <div class="choice-count">${count}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (questionData.question_type === 'yes_no') {
            html += `
                <div class="yes-no-chart">
                    <div class="yes-no-item">
                        <div class="yes-no-circle yes-circle">${questionData.yes_count}</div>
                        <div class="yes-no-label">Yes</div>
                    </div>
                    <div class="yes-no-item">
                        <div class="yes-no-circle no-circle">${questionData.no_count}</div>
                        <div class="yes-no-label">No</div>
                    </div>
                </div>
            `;
        } else if (questionData.question_type === 'text') {
            html += `
                <div class="text-responses">
                    ${questionData.text_responses.map(function(response) {
                        return `<div class="text-response">"${response}"</div>`;
                    }).join('')}
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }
    
    // Render trends content
    function renderTrendsContent() {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${Object.keys(state.analytics.trends.daily_responses).length}</div>
                    <div class="stat-label">Active Days</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.max(...Object.values(state.analytics.trends.daily_responses))}</div>
                    <div class="stat-label">Peak Day</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(state.analytics.overview.avg_completion_time / 60000)}min</div>
                    <div class="stat-label">Avg Time</div>
                </div>
            </div>
            <div style="text-align: center; color: #666; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📈</div>
                <div>Detailed trend charts would be implemented here</div>
                <div style="font-size: 14px; margin-top: 8px;">Using Chart.js or similar visualization library</div>
            </div>
        `;
    }
    
    // Get question icon
    function getQuestionIcon(type) {
        switch (type) {
            case 'rating': return '⭐';
            case 'multiple_choice': return '🎯';
            case 'yes_no': return '🗣️';
            case 'text': return '💬';
            default: return '❓';
        }
    }
    
    // Set up dashboard handlers
    function setupDashboardHandlers() {
        window.changeView = function(view) {
            state.currentView = view;
            renderResultsDashboard();
            
            instance.trigger('view_changed', {
                view: view,
                timestamp: new Date().toISOString()
            });
        };
        
        window.updateFilters = function() {
            state.filters.dateRange = canvas.find('#date-filter').val();
            state.filters.anonymous = canvas.find('#anonymous-filter').val();
            
            // Re-calculate analytics with filters
            calculateAnalytics();
            renderResultsDashboard();
            
            instance.trigger('filters_updated', {
                filters: state.filters,
                timestamp: new Date().toISOString()
            });
        };
    }
    
    // Public methods
    instance.getAnalytics = function() {
        return state.analytics;
    };
    
    instance.exportData = function() {
        var exportData = {
            form_data: state.formData,
            responses: state.responses,
            analytics: state.analytics,
            exported_at: new Date().toISOString()
        };
        
        instance.trigger('data_exported', exportData);
        return exportData;
    };
    
    instance.refreshAnalytics = function() {
        calculateAnalytics();
        renderResultsDashboard();
    };
    
    // Initialize
    instance.init();
}

// =============================================================================
// PLUGIN ACTIONS
// =============================================================================

// CreateFeedbackForm Action
function(instance, context) {
    var properties = instance.data;
    
    // Action to create a new feedback form
    instance.run = function() {
        var formData = {
            id: 'form_' + Date.now(),
            template_id: properties.template_id,
            event_type: properties.event_type,
            title: properties.form_title,
            description: properties.form_description,
            sections: properties.form_sections ? JSON.parse(properties.form_sections) : [],
            settings: {
                allow_anonymous: properties.allow_anonymous || false,
                require_completion: properties.require_completion || false,
                deadline: properties.deadline || null
            },
            created_at: new Date().toISOString(),
            created_by: properties.created_by
        };
        
        // Store form data
        instance.bubble_fn_store('created_form', formData);
        
        // Trigger success event
        instance.trigger('form_created', {
            form_id: formData.id,
            form_title: formData.title,
            sections_count: formData.sections.length,
            timestamp: formData.created_at
        });
        
        return formData;
    };
}

// SubmitFeedbackResponse Action
function(instance, context) {
    var properties = instance.data;
    
    // Action to submit a feedback response
    instance.run = function() {
        var responseData = {
            id: 'response_' + Date.now(),
            form_id: properties.form_id,
            user_id: properties.anonymous_mode ? null : properties.user_id,
            is_anonymous: properties.anonymous_mode || false,
            responses: properties.responses ? JSON.parse(properties.responses) : {},
            submitted_at: new Date().toISOString(),
            completion_time: properties.completion_time || 0,
            ip_address: properties.anonymous_mode ? null : properties.ip_address,
            user_agent: properties.anonymous_mode ? null : properties.user_agent
        };
        
        // Store response data
        instance.bubble_fn_store('submitted_response', responseData);
        
        // Trigger success event
        instance.trigger('response_submitted', {
            response_id: responseData.id,
            form_id: responseData.form_id,
            is_anonymous: responseData.is_anonymous,
            questions_answered: Object.keys(responseData.responses).length,
            timestamp: responseData.submitted_at
        });
        
        return responseData;
    };
}

// ExportFeedbackResults Action
function(instance, context) {
    var properties = instance.data;
    
    // Action to export feedback results
    instance.run = function() {
        var exportData = {
            form_data: properties.form_data ? JSON.parse(properties.form_data) : null,
            responses: properties.responses ? JSON.parse(properties.responses) : [],
            analytics: properties.analytics ? JSON.parse(properties.analytics) : null,
            export_format: properties.export_format || 'json',
            exported_at: new Date().toISOString(),
            exported_by: properties.exported_by
        };
        
        // Process export based on format
        var processedData;
        switch (exportData.export_format) {
            case 'csv':
                processedData = convertToCSV(exportData.responses);
                break;
            case 'pdf':
                processedData = generatePDFReport(exportData);
                break;
            default:
                processedData = exportData;
        }
        
        // Store exported data
        instance.bubble_fn_store('exported_data', processedData);
        
        // Trigger success event
        instance.trigger('results_exported', {
            export_format: exportData.export_format,
            responses_count: exportData.responses.length,
            exported_by: exportData.exported_by,
            timestamp: exportData.exported_at
        });
        
        return processedData;
    };
    
    // Helper function to convert responses to CSV
    function convertToCSV(responses) {
        if (!responses.length) return '';
        
        var headers = ['Response ID', 'Form ID', 'Anonymous', 'Submitted At'];
        var firstResponse = responses[0];
        if (firstResponse.responses) {
            headers = headers.concat(Object.keys(firstResponse.responses));
        }
        
        var csvContent = headers.join(',') + '\n';
        
        responses.forEach(function(response) {
            var row = [
                response.id,
                response.form_id,
                response.is_anonymous,
                response.submitted_at
            ];
            
            if (response.responses) {
                Object.keys(firstResponse.responses).forEach(function(questionId) {
                    var answer = response.responses[questionId] || '';
                    // Escape commas and quotes
                    if (typeof answer === 'string') {
                        answer = '"' + answer.replace(/"/g, '""') + '"';
                    }
                    row.push(answer);
                });
            }
            
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    }
    
    // Helper function to generate PDF report
    function generatePDFReport(exportData) {
        // This would integrate with a PDF generation library
        return {
            format: 'pdf',
            title: 'Feedback Results Report',
            generated_at: new Date().toISOString(),
            content: 'PDF generation would be implemented here',
            metadata: {
                responses_count: exportData.responses.length,
                form_title: exportData.form_data ? exportData.form_data.title : 'Unknown Form'
            }
        };
    }
}