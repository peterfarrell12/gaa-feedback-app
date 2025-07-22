function(properties, context) {
    // TeamSync Feedback System - Bubble Plugin
    // Version: 1.0.0
    // Description: Complete feedback form system for GAA teams
    
    var instance = this;
    var canvas = instance.canvas;
    
    // Initialize plugin properties
    var mode = properties.mode || 'template_selector'; // template_selector, form_builder, form_renderer, results_dashboard
    var eventId = properties.event_id;
    var allowAnonymous = properties.allow_anonymous !== false;
    var formType = properties.form_type || 'post_game'; // post_game, post_training, development
    var userId = context.user ? context.user.id : null;
    var isCoach = properties.is_coach || false;
    
    // Plugin state management
    var state = {
        currentStep: 1,
        totalSteps: 3,
        selectedTemplate: null,
        formData: {
            sections: [],
            questions: [],
            responses: []
        },
        isAnonymous: false,
        isLoading: false
    };
    
    // CSS Styles for plugin elements
    var styles = `
        <style>
        .teamsync-feedback-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .teamsync-header {
            background: linear-gradient(135deg, #0E79B2 0%, #0E79B2 100%);
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
            width: 40px;
            height: 40px;
            background: #0E79B2;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            color: white;
            font-size: 18px;
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
        }
        
        .teamsync-btn:hover {
            background: #0c6a9a;
        }
        
        .teamsync-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .teamsync-btn-secondary {
            background: white;
            color: #0E79B2;
            border: 2px solid #0E79B2;
        }
        
        .teamsync-btn-secondary:hover {
            background: #f8fcff;
        }
        
        .teamsync-question-builder {
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
            background: white;
        }
        
        .teamsync-question-type {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .teamsync-type-btn {
            padding: 8px 16px;
            border: 2px solid #e5e5e5;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .teamsync-type-btn.active {
            border-color: #0E79B2;
            background: #f8fcff;
            color: #0E79B2;
        }
        
        .teamsync-form-field {
            margin-bottom: 16px;
        }
        
        .teamsync-form-field label {
            display: block;
            font-weight: 500;
            margin-bottom: 6px;
            color: #1a1a1a;
        }
        
        .teamsync-form-field input,
        .teamsync-form-field textarea,
        .teamsync-form-field select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
        }
        
        .teamsync-form-field input:focus,
        .teamsync-form-field textarea:focus,
        .teamsync-form-field select:focus {
            outline: none;
            border-color: #0E79B2;
            box-shadow: 0 0 0 3px rgba(14, 121, 178, 0.1);
        }
        
        .teamsync-progress-bar {
            width: 100%;
            height: 6px;
            background: #e5e5e5;
            border-radius: 3px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .teamsync-progress-fill {
            height: 100%;
            background: #0E79B2;
            transition: width 0.3s ease;
        }
        
        .teamsync-rating-scale {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin: 16px 0;
        }
        
        .teamsync-rating-btn {
            width: 40px;
            height: 40px;
            border: 2px solid #e5e5e5;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        
        .teamsync-rating-btn:hover {
            border-color: #0E79B2;
        }
        
        .teamsync-rating-btn.selected {
            background: #0E79B2;
            color: white;
            border-color: #0E79B2;
        }
        
        .teamsync-anonymous-toggle {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .teamsync-toggle-switch {
            position: relative;
            width: 48px;
            height: 24px;
            background: #ccc;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .teamsync-toggle-switch.active {
            background: #0E79B2;
        }
        
        .teamsync-toggle-slider {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }
        
        .teamsync-toggle-switch.active .teamsync-toggle-slider {
            transform: translateX(24px);
        }
        
        .teamsync-results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .teamsync-stat-card {
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .teamsync-stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #0E79B2;
            margin-bottom: 8px;
        }
        
        .teamsync-stat-label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
        }
        
        .teamsync-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: #666;
        }
        
        .teamsync-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e5e5e5;
            border-top: 2px solid #0E79B2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 12px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .teamsync-mobile-optimized {
            max-width: 100%;
        }
        
        @media (max-width: 768px) {
            .teamsync-content {
                padding: 16px;
            }
            
            .teamsync-template-grid {
                grid-template-columns: 1fr;
            }
            
            .teamsync-results-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .teamsync-rating-scale {
                flex-wrap: wrap;
            }
        }
        </style>
    `;
    
    // Template data - default GAA feedback templates
    var defaultTemplates = [
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
            id: 'training_session',
            name: 'Training Session Review',
            description: 'Drills, fitness, and skill development',
            type: 'post_training',
            sections: 4,
            questions: 15,
            estimatedTime: '6-8 min',
            icon: '🏃',
            structure: [
                {
                    title: 'Session Quality',
                    questions: [
                        { type: 'rating', text: 'How would you rate today\'s training session?', scale: 10 },
                        { type: 'rating', text: 'How challenging was the session for your skill level?', scale: 10 },
                        { type: 'text', text: 'Which drill or activity was most beneficial?' }
                    ]
                },
                {
                    title: 'Skill Development',
                    questions: [
                        { type: 'multiple_choice', text: 'Which skill area did you improve most today?', options: ['Ball Skills', 'Fitness', 'Tactical Awareness', 'Communication'] },
                        { type: 'rating', text: 'How confident do you feel about implementing today\'s learning in matches?', scale: 10 },
                        { type: 'text', text: 'What skill would you like more focus on in future sessions?' }
                    ]
                },
                {
                    title: 'Fitness & Conditioning',
                    questions: [
                        { type: 'rating', text: 'How appropriate was the fitness level of today\'s session?', scale: 10 },
                        { type: 'multiple_choice', text: 'How did you feel physically during the session?', options: ['Too Easy', 'Just Right', 'Very Challenging', 'Too Difficult'] },
                        { type: 'text', text: 'Any injury concerns or physical feedback?' }
                    ]
                },
                {
                    title: 'Training Environment',
                    questions: [
                        { type: 'rating', text: 'How clear were the coaching instructions?', scale: 10 },
                        { type: 'rating', text: 'How supportive was the team atmosphere?', scale: 10 },
                        { type: 'text', text: 'Suggestions for improving future training sessions?' },
                        { type: 'yes_no', text: 'Do you feel comfortable asking questions during training?' },
                        { type: 'text', text: 'Any additional feedback for coaches?' },
                        { type: 'text', text: 'General comments (optional)' }
                    ]
                }
            ]
        },
        {
            id: 'development_review',
            name: 'Player Development Review',
            description: 'Personal growth and goal setting',
            type: 'development',
            sections: 3,
            questions: 10,
            estimatedTime: '8-10 min',
            icon: '📈',
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
                        { type: 'text', text: 'What is your main goal for this season?' },
                        { type: 'multiple_choice', text: 'What type of support would help you most?', options: ['Extra Training', 'Tactical Education', 'Mental Coaching', 'Physical Conditioning'] }
                    ]
                },
                {
                    title: 'Support & Feedback',
                    questions: [
                        { type: 'rating', text: 'How supported do you feel by the coaching staff?', scale: 10 },
                        { type: 'text', text: 'What could coaches do differently to help your development?' },
                        { type: 'yes_no', text: 'Would you be interested in additional leadership responsibilities?' },
                        { type: 'text', text: 'Any other thoughts on your development journey?' }
                    ]
                }
            ]
        }
    ];
    
    // Initialize plugin UI
    function initializePlugin() {
        canvas.empty();
        canvas.append(styles);
        
        switch(mode) {
            case 'template_selector':
                renderTemplateSelector();
                break;
            case 'form_builder':
                renderFormBuilder();
                break;
            case 'form_renderer':
                renderFormRenderer();
                break;
            case 'results_dashboard':
                renderResultsDashboard();
                break;
            default:
                renderTemplateSelector();
        }
    }
    
    // Template Selector Component
    function renderTemplateSelector() {
        var container = $(`
            <div class="teamsync-feedback-container">
                <div class="teamsync-header">
                    <h2>Create Feedback Form</h2>
                    <p>Choose a template or start from scratch</p>
                </div>
                <div class="teamsync-content">
                    <div class="teamsync-template-grid" id="template-grid">
                        <!-- Templates will be inserted here -->
                    </div>
                    <div style="text-align: center; margin-top: 24px;">
                        <button class="teamsync-btn teamsync-btn-secondary" onclick="startFromScratch()" style="margin-right: 12px;">
                            Start from Scratch
                        </button>
                        <button class="teamsync-btn" onclick="useSelectedTemplate()" id="use-template-btn" disabled>
                            Use Selected Template
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        canvas.append(container);
        
        // Render templates
        var templateGrid = container.find('#template-grid');
        
        defaultTemplates.forEach(function(template) {
            if (!formType || template.type === formType) {
                var templateCard = $(`
                    <div class="teamsync-template-card" data-template-id="${template.id}">
                        <div class="teamsync-template-header">
                            <div class="teamsync-template-icon">${template.icon}</div>
                            <div>
                                <h3 class="teamsync-template-title">${template.name}</h3>
                                <div class="teamsync-template-meta">
                                    ${template.sections} sections • ${template.questions} questions • ${template.estimatedTime}
                                </div>
                            </div>
                        </div>
                        <p style="color: #666; font-size: 14px; margin: 12px 0 0 0;">${template.description}</p>
                    </div>
                `);
                
                templateCard.on('click', function() {
                    templateGrid.find('.teamsync-template-card').removeClass('selected');
                    $(this).addClass('selected');
                    state.selectedTemplate = template;
                    container.find('#use-template-btn').prop('disabled', false);
                });
                
                templateGrid.append(templateCard);
            }
        });
        
        // Global functions for template selection
        window.startFromScratch = function() {
            bubble_fn_call_workflow('Start Form Builder', {
                event_id: eventId,
                template_id: null,
                form_type: formType
            });
        };
        
        window.useSelectedTemplate = function() {
            if (state.selectedTemplate) {
                bubble_fn_call_workflow('Use Template', {
                    event_id: eventId,
                    template_id: state.selectedTemplate.id,
                    template_data: JSON.stringify(state.selectedTemplate),
                    form_type: formType
                });
            }
        };
    }
    
    // Form Builder Component
    function renderFormBuilder() {
        var container = $(`
            <div class="teamsync-feedback-container">
                <div class="teamsync-header">
                    <h2>Build Your Form</h2>
                    <p>Create questions and sections for your feedback form</p>
                </div>
                <div class="teamsync-content">
                    <div id="form-sections">
                        <!-- Form sections will be inserted here -->
                    </div>
                    <div style="margin-top: 24px;">
                        <button class="teamsync-btn teamsync-btn-secondary" onclick="addSection()" style="margin-right: 12px;">
                            Add Section
                        </button>
                        <button class="teamsync-btn" onclick="saveForm()">
                            Save Form
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        canvas.append(container);
        
        // Load template data if available
        if (state.selectedTemplate) {
            loadTemplateStructure(state.selectedTemplate.structure);
        } else {
            addSection(); // Add first section
        }
        
        // Global functions for form building
        window.addSection = function() {
            var sectionIndex = state.formData.sections.length;
            var section = {
                id: 'section_' + Date.now(),
                title: 'New Section',
                questions: []
            };
            
            state.formData.sections.push(section);
            renderSection(section, sectionIndex);
        };
        
        window.addQuestion = function(sectionId) {
            var question = {
                id: 'question_' + Date.now(),
                type: 'rating',
                text: 'New Question',
                required: true,
                allowAnonymous: allowAnonymous
            };
            
            var section = state.formData.sections.find(s => s.id === sectionId);
            if (section) {
                section.questions.push(question);
                renderQuestion(question, section.questions.length - 1, sectionId);
            }
        };
        
        window.saveForm = function() {
            bubble_fn_call_workflow('Save Form', {
                event_id: eventId,
                form_data: JSON.stringify(state.formData),
                form_type: formType
            });
        };
    }
    
    function loadTemplateStructure(structure) {
        structure.forEach(function(section, index) {
            var sectionData = {
                id: 'section_' + Date.now() + '_' + index,
                title: section.title,
                questions: []
            };
            
            section.questions.forEach(function(question) {
                sectionData.questions.push({
                    id: 'question_' + Date.now() + '_' + Math.random(),
                    type: question.type,
                    text: question.text,
                    required: true,
                    allowAnonymous: allowAnonymous,
                    scale: question.scale || 10,
                    options: question.options || []
                });
            });
            
            state.formData.sections.push(sectionData);
            renderSection(sectionData, index);
        });
    }
    
    function renderSection(section, index) {
        var sectionsContainer = canvas.find('#form-sections');
        
        var sectionElement = $(`
            <div class="teamsync-question-builder" data-section-id="${section.id}">
                <div class="teamsync-form-field">
                    <label>Section Title</label>
                    <input type="text" value="${section.title}" onchange="updateSectionTitle('${section.id}', this.value)">
                </div>
                <div id="questions-${section.id}">
                    <!-- Questions will be inserted here -->
                </div>
                <button class="teamsync-btn teamsync-btn-secondary" onclick="addQuestion('${section.id}')" style="margin-top: 12px;">
                    Add Question
                </button>
            </div>
        `);
        
        sectionsContainer.append(sectionElement);
        
        // Render existing questions
        section.questions.forEach(function(question, qIndex) {
            renderQuestion(question, qIndex, section.id);
        });
        
        window.updateSectionTitle = function(sectionId, newTitle) {
            var section = state.formData.sections.find(s => s.id === sectionId);
            if (section) {
                section.title = newTitle;
            }
        };
    }
    
    function renderQuestion(question, index, sectionId) {
        var questionsContainer = canvas.find('#questions-' + sectionId);
        
        var questionElement = $(`
            <div class="teamsync-question-builder" data-question-id="${question.id}" style="margin-left: 20px; border-left: 3px solid #0E79B2;">
                <div class="teamsync-question-type">
                    <div class="teamsync-type-btn ${question.type === 'rating' ? 'active' : ''}" onclick="setQuestionType('${question.id}', 'rating')">
                        Rating (1-10)
                    </div>
                    <div class="teamsync-type-btn ${question.type === 'text' ? 'active' : ''}" onclick="setQuestionType('${question.id}', 'text')">
                        Text Answer
                    </div>
                    <div class="teamsync-type-btn ${question.type === 'multiple_choice' ? 'active' : ''}" onclick="setQuestionType('${question.id}', 'multiple_choice')">
                        Multiple Choice
                    </div>
                    <div class="teamsync-type-btn ${question.type === 'yes_no' ? 'active' : ''}" onclick="setQuestionType('${question.id}', 'yes_no')">
                        Yes/No
                    </div>
                </div>
                <div class="teamsync-form-field">
                    <label>Question Text</label>
                    <input type="text" value="${question.text}" onchange="updateQuestionText('${question.id}', this.value)">
                </div>
                <div id="question-options-${question.id}">
                    <!-- Type-specific options will be inserted here -->
                </div>
            </div>
        `);
        
        questionsContainer.append(questionElement);
        renderQuestionOptions(question);
        
        window.setQuestionType = function(questionId, type) {
            var question = findQuestion(questionId);
            if (question) {
                question.type = type;
                canvas.find(`[data-question-id="${questionId}"] .teamsync-type-btn`).removeClass('active');
                canvas.find(`[data-question-id="${questionId}"] .teamsync-type-btn`).filter(function() {
                    return $(this).text().toLowerCase().includes(type.replace('_', ' '));
                }).addClass('active');
                renderQuestionOptions(question);
            }
        };
        
        window.updateQuestionText = function(questionId, newText) {
            var question = findQuestion(questionId);
            if (question) {
                question.text = newText;
            }
        };
    }
    
    function renderQuestionOptions(question) {
        var optionsContainer = canvas.find('#question-options-' + question.id);
        optionsContainer.empty();
        
        if (question.type === 'multiple_choice') {
            var optionsHtml = `
                <div class="teamsync-form-field">
                    <label>Answer Options (one per line)</label>
                    <textarea rows="4" placeholder="Option 1\nOption 2\nOption 3" onchange="updateQuestionOptions('${question.id}', this.value)">${(question.options || []).join('\n')}</textarea>
                </div>
            `;
            optionsContainer.append(optionsHtml);
        }
        
        window.updateQuestionOptions = function(questionId, optionsText) {
            var question = findQuestion(questionId);
            if (question) {
                question.options = optionsText.split('\n').filter(opt => opt.trim());
            }
        };
    }
    
    function findQuestion(questionId) {
        for (var section of state.formData.sections) {
            var question = section.questions.find(q => q.id === questionId);
            if (question) return question;
        }
        return null;
    }
    
    // Form Renderer Component (for players)
    function renderFormRenderer() {
        var container = $(`
            <div class="teamsync-feedback-container teamsync-mobile-optimized">
                <div class="teamsync-header">
                    <h2>Team Feedback</h2>
                    <p>Your feedback helps improve our team</p>
                </div>
                <div class="teamsync-content">
                    <div class="teamsync-progress-bar">
                        <div class="teamsync-progress-fill" style="width: ${(state.currentStep / state.totalSteps) * 100}%"></div>
                    </div>
                    <div class="teamsync-anonymous-toggle">
                        <div class="teamsync-toggle-switch ${state.isAnonymous ? 'active' : ''}" onclick="toggleAnonymous()">
                            <div class="teamsync-toggle-slider"></div>
                        </div>
                        <div>
                            <strong>Anonymous Response</strong>
                            <div style="font-size: 12px; color: #666;">Your identity will be kept private</div>
                        </div>
                    </div>
                    <div id="current-question">
                        <!-- Current question will be rendered here -->
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 24px;">
                        <button class="teamsync-btn teamsync-btn-secondary" onclick="previousQuestion()" ${state.currentStep === 1 ? 'style="visibility: hidden;"' : ''}>
                            Previous
                        </button>
                        <button class="teamsync-btn" onclick="nextQuestion()" id="next-btn">
                            ${state.currentStep === state.totalSteps ? 'Submit' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        canvas.append(container);
        
        // Load form data and render first question
        loadFormData();
        
        window.toggleAnonymous = function() {
            state.isAnonymous = !state.isAnonymous;
            var toggle = canvas.find('.teamsync-toggle-switch');
            if (state.isAnonymous) {
                toggle.addClass('active');
            } else {
                toggle.removeClass('active');
            }
        };
        
        window.nextQuestion = function() {
            if (state.currentStep < state.totalSteps) {
                state.currentStep++;
                updateProgressAndQuestion();
            } else {
                submitResponse();
            }
        };
        
        window.previousQuestion = function() {
            if (state.currentStep > 1) {
                state.currentStep--;
                updateProgressAndQuestion();
            }
        };
    }
    
    function loadFormData() {
        // This would typically load from Bubble database
        // For now, using sample data
        state.formData = {
            sections: [
                {
                    title: 'Performance Assessment',
                    questions: [
                        { id: '1', type: 'rating', text: 'How would you rate your individual performance today?', scale: 10 },
                        { id: '2', type: 'text', text: 'What was your strongest contribution to the team today?' }
                    ]
                }
            ]
        };
        
        // Calculate total questions for progress
        state.totalSteps = state.formData.sections.reduce((total, section) => total + section.questions.length, 0);
        renderCurrentQuestion();
    }
    
    function updateProgressAndQuestion() {
        canvas.find('.teamsync-progress-fill').css('width', (state.currentStep / state.totalSteps) * 100 + '%');
        canvas.find('#next-btn').text(state.currentStep === state.totalSteps ? 'Submit' : 'Next');
        renderCurrentQuestion();
    }
    
    function renderCurrentQuestion() {
        var questionContainer = canvas.find('#current-question');
        var currentQuestionIndex = 0;
        var currentQuestion = null;
        
        // Find current question based on step
        for (var section of state.formData.sections) {
            for (var question of section.questions) {
                currentQuestionIndex++;
                if (currentQuestionIndex === state.currentStep) {
                    currentQuestion = question;
                    break;
                }
            }
            if (currentQuestion) break;
        }
        
        if (!currentQuestion) return;
        
        questionContainer.empty();
        
        var questionHtml = `
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 18px; margin-bottom: 16px; color: #1a1a1a;">${currentQuestion.text}</h3>
        `;
        
        if (currentQuestion.type === 'rating') {
            questionHtml += '<div class="teamsync-rating-scale">';
            for (var i = 1; i <= (currentQuestion.scale || 10); i++) {
                questionHtml += `<div class="teamsync-rating-btn" onclick="selectRating(${i})" data-rating="${i}">${i}</div>`;
            }
            questionHtml += '</div>';
        } else if (currentQuestion.type === 'text') {
            questionHtml += `
                <textarea rows="4" placeholder="Enter your response..." 
                    style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;"
                    onchange="setTextResponse(this.value)"></textarea>
            `;
        } else if (currentQuestion.type === 'multiple_choice') {
            currentQuestion.options.forEach(function(option, index) {
                questionHtml += `
                    <div style="margin-bottom: 12px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="mc-answer" value="${option}" onchange="setMultipleChoiceResponse(this.value)" style="margin-right: 12px;">
                            ${option}
                        </label>
                    </div>
                `;
            });
        } else if (currentQuestion.type === 'yes_no') {
            questionHtml += `
                <div style="display: flex; gap: 16px; justify-content: center;">
                    <button class="teamsync-btn" onclick="setYesNoResponse('yes')" style="background: #22c55e;">Yes</button>
                    <button class="teamsync-btn teamsync-btn-secondary" onclick="setYesNoResponse('no')">No</button>
                </div>
            `;
        }
        
        questionHtml += '</div>';
        questionContainer.append(questionHtml);
        
        // Global response handlers
        window.selectRating = function(rating) {
            canvas.find('.teamsync-rating-btn').removeClass('selected');
            canvas.find(`[data-rating="${rating}"]`).addClass('selected');
            state.formData.responses = state.formData.responses || {};
            state.formData.responses[currentQuestion.id] = rating;
        };
        
        window.setTextResponse = function(text) {
            state.formData.responses = state.formData.responses || {};
            state.formData.responses[currentQuestion.id] = text;
        };
        
        window.setMultipleChoiceResponse = function(option) {
            state.formData.responses = state.formData.responses || {};
            state.formData.responses[currentQuestion.id] = option;
        };
        
        window.setYesNoResponse = function(answer) {
            state.formData.responses = state.formData.responses || {};
            state.formData.responses[currentQuestion.id] = answer;
            
            // Update button styles
            canvas.find('.teamsync-btn').removeClass('selected');
            if (answer === 'yes') {
                canvas.find('.teamsync-btn:contains("Yes")').addClass('selected');
            } else {
                canvas.find('.teamsync-btn:contains("No")').addClass('selected');
            }
        };
    }
    
    function submitResponse() {
        state.isLoading = true;
        
        bubble_fn_call_workflow('Submit Feedback Response', {
            event_id: eventId,
            form_id: properties.form_id,
            responses: JSON.stringify(state.formData.responses),
            is_anonymous: state.isAnonymous,
            user_id: state.isAnonymous ? null : userId
        });
        
        // Show success message
        canvas.find('.teamsync-content').html(`
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
                <h3 style="color: #22c55e; margin-bottom: 8px;">Feedback Submitted!</h3>
                <p style="color: #666;">Thank you for your valuable feedback.</p>
            </div>
        `);
    }
    
    // Results Dashboard Component
    function renderResultsDashboard() {
        if (state.isLoading) {
            canvas.append(`
                <div class="teamsync-loading">
                    <div class="teamsync-spinner"></div>
                    Loading results...
                </div>
            `);
            return;
        }
        
        var container = $(`
            <div class="teamsync-feedback-container">
                <div class="teamsync-header">
                    <h2>Feedback Results</h2>
                    <p>Team performance insights and analytics</p>
                </div>
                <div class="teamsync-content">
                    <div class="teamsync-results-grid">
                        <div class="teamsync-stat-card">
                            <div class="teamsync-stat-number">24</div>
                            <div class="teamsync-stat-label">Total Responses</div>
                        </div>
                        <div class="teamsync-stat-card">
                            <div class="teamsync-stat-number">18</div>
                            <div class="teamsync-stat-label">Anonymous</div>
                        </div>
                        <div class="teamsync-stat-card">
                            <div class="teamsync-stat-number">7.8</div>
                            <div class="teamsync-stat-label">Avg Performance Rating</div>
                        </div>
                        <div class="teamsync-stat-card">
                            <div class="teamsync-stat-number">92%</div>
                            <div class="teamsync-stat-label">Response Rate</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 32px;">
                        <h3 style="margin-bottom: 16px;">Key Insights</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0E79B2;">
                            <ul style="margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 8px;">Team communication rated highly (8.2/10 average)</li>
                                <li style="margin-bottom: 8px;">Defensive shape identified as area for improvement</li>
                                <li style="margin-bottom: 8px;">75% of players feel their voice is heard in team decisions</li>
                                <li>Suggested focus: Set piece execution and fitness levels</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 32px;">
                        <button class="teamsync-btn teamsync-btn-secondary" onclick="exportResults()" style="margin-right: 12px;">
                            Export to PDF
                        </button>
                        <button class="teamsync-btn" onclick="createNewForm()">
                            Create New Form
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        canvas.append(container);
        
        window.exportResults = function() {
            bubble_fn_call_workflow('Export Results', {
                event_id: eventId,
                form_id: properties.form_id,
                format: 'pdf'
            });
        };
        
        window.createNewForm = function() {
            bubble_fn_call_workflow('Create New Form', {
                event_id: eventId
            });
        };
    }
    
    // Plugin update function
    instance.update = function() {
        // Update plugin when properties change
        if (properties.mode !== mode) {
            mode = properties.mode;
            initializePlugin();
        }
    };
    
    // Initialize plugin on load
    initializePlugin();
    
    // Bubble integration functions
    function bubble_fn_call_workflow(workflowName, data) {
        // This integrates with Bubble's workflow system
        if (typeof bubble_fn_run_workflow !== 'undefined') {
            bubble_fn_run_workflow(workflowName, data);
        } else {
            console.log('Bubble workflow called:', workflowName, data);
        }
    }
    
    function bubble_fn_create(options) {
        // This integrates with Bubble's database creation
        if (typeof bubble_fn_create_thing !== 'undefined') {
            return bubble_fn_create_thing(options.type, options.data);
        } else {
            console.log('Bubble create called:', options);
            return { id: 'mock_' + Date.now() };
        }
    }
    
    function bubble_fn_search(options) {
        // This integrates with Bubble's database search
        if (typeof bubble_fn_search_things !== 'undefined') {
            return bubble_fn_search_things(options.type, options.constraints);
        } else {
            console.log('Bubble search called:', options);
            return [];
        }
    }
}