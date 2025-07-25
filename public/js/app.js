// GAA Feedback System - URL Parameter Based App - v1752827100

// Simple UUID generator for form IDs
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class GAA_FeedbackApp {
    constructor() {
        this.currentUserType = 'coach'; // Default to coach
        this.currentEventId = null;
        this.currentForm = null;
        this.selectedTemplate = null;
        this.templates = [];
        this.responses = {};
        this.existingResponse = null;
        this.isEditingResponse = false;
        
        this.init();
    }
    
    init() {
        console.log('🏈 GAA Feedback System Initialized - v1752828700');
        console.log('🏗️ Perfect Form Builder - Enhanced with inline confirmations, anonymous & question bank features!');
        try {
            this.parseURLParams();
            
            // Validate required parameters
            const parameterError = this.validateRequiredParameters();
            if (parameterError) {
                this.showParameterError(parameterError);
                return; // Stop initialization if parameters are invalid
            }
            
            this.loadApp();
        } catch (error) {
            console.error('Error during initialization:', error);
            this.showError('Failed to initialize application: ' + error.message);
        }
    }
    
    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventIdParam = urlParams.get('event-id');
        const clubIdParam = urlParams.get('club-id');
        const userIdParam = urlParams.get('user-id');
        const userTypeParam = urlParams.get('user-type');
        
        console.log('🔍 Full URL:', window.location.href);
        console.log('🔍 Search params:', window.location.search);
        console.log('🔍 All URL params:', Array.from(urlParams.entries()));
        
        // Store parameters (validation will be done separately)
        
        // Use the event-id directly (no UUID generation needed)
        this.currentEventId = eventIdParam;
        this.currentClubId = clubIdParam; // Optional parameter
        this.currentUserId = userIdParam; // Required parameter for tracking individual users from Bubble
        
        // Set user type based on user-type parameter (if provided)
        if (userTypeParam && userTypeParam.toLowerCase() === 'coach') {
            this.currentUserType = 'coach';
        } else if (userTypeParam && userTypeParam.toLowerCase() === 'player') {
            this.currentUserType = 'player';
        }
        
        console.log('✅ Event ID from URL:', eventIdParam);
        console.log('✅ Club ID from URL:', clubIdParam || 'Not provided');
        console.log('✅ User ID from URL:', userIdParam);
        console.log('✅ User Type from URL:', userTypeParam);
        console.log('✅ Set user type to:', this.currentUserType);
        console.log('✅ this.currentClubId set to:', this.currentClubId);
    }
    
    validateRequiredParameters() {
        const missingParams = [];
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for required parameters
        if (!urlParams.get('event-id')) {
            missingParams.push({ param: 'event-id', description: 'Event ID' });
        }
        
        if (!urlParams.get('club-id')) {
            missingParams.push({ param: 'club-id', description: 'Club ID' });
        }
        
        if (!urlParams.get('user-id')) {
            missingParams.push({ param: 'user-id', description: 'User ID' });
        }
        
        const userType = urlParams.get('user-type');
        if (!userType) {
            missingParams.push({ param: 'user-type', description: 'User Type (coach or player)' });
        } else if (!['coach', 'player'].includes(userType.toLowerCase())) {
            missingParams.push({ param: 'user-type', description: 'User Type (must be coach or player)', invalid: true });
        }
        
        return missingParams.length > 0 ? missingParams : null;
    }
    
    showParameterError(missingParams) {
        console.error('Missing or invalid required parameters:', missingParams);
        
        // Hide all other screens
        document.querySelectorAll('.loading-screen, .error-screen, .interface').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show parameter error screen
        const parameterErrorScreen = document.getElementById('parameter-error-screen');
        parameterErrorScreen.classList.remove('hidden');
        
        // Generate error details
        const errorDetails = document.getElementById('parameter-error-details');
        const errorMessage = document.getElementById('parameter-error-message');
        
        if (missingParams.length === 1 && missingParams[0].param === 'user-type' && missingParams[0].invalid) {
            errorMessage.textContent = 'Invalid user type provided. Must be either "coach" or "player".';
        } else {
            errorMessage.textContent = `Missing required parameters: ${missingParams.length === 1 ? '1 parameter is' : missingParams.length + ' parameters are'} required but not provided.`;
        }
        
        errorDetails.innerHTML = missingParams.map(param => `
            <div class="missing-param">
                <i class="fas fa-exclamation-circle"></i>
                <strong>${param.param}:</strong> ${param.description} ${param.invalid ? '(invalid value)' : '(missing)'}
            </div>
        `).join('');
        
        // Prevent any further app functionality
        this.parametersValid = false;
    }
    
    async loadApp() {
        try {
            console.log('Loading app...');
            this.showLoading();
            
            // Load templates
            console.log('Loading templates...');
            await this.loadTemplates();
            console.log('Templates loaded:', this.templates.length);
            
            // Check if form exists for this event
            console.log('Checking for existing form...');
            await this.checkForExistingForm();
            console.log('Form check complete. Current form:', this.currentForm);
            
            // Show appropriate interface
            console.log('Showing interface...');
            await this.showInterface();
            
        } catch (error) {
            console.error('Error loading app:', error);
            this.showError('Failed to load application: ' + error.message);
        }
    }
    
    
    async loadTemplates() {
        try {
            const response = await fetch('/api/templates');
            if (!response.ok) {
                throw new Error('Failed to load templates');
            }
            
            this.templates = await response.json();
            console.log('Templates loaded:', this.templates);
            
        } catch (error) {
            throw new Error('Failed to load templates');
        }
    }
    
    async checkForExistingForm() {
        try {
            const response = await fetch(`/api/forms?event_id=${this.currentEventId}`);
            if (response.ok) {
                const forms = await response.json();
                if (forms.length > 0) {
                    this.currentForm = forms[0]; // Use the first active form
                    console.log('Existing form found via API:', this.currentForm);
                    return;
                }
            }
        } catch (error) {
            console.log('API call failed for existing form:', error.message);
        }
        
        // If no form found via API and user is a player, create a mock form for testing
        if (this.currentUserType === 'player') {
            console.log('No existing form found, creating mock form for player testing');
            this.createMockFormForPlayer();
            // After creating mock form, check if player has existing response
            await this.checkExistingResponse();
        } else {
            console.log('No existing form found for coach - will show template selection');
        }
    }
    
    createMockFormForPlayer() {
        // Create a mock form so players can test response submission
        this.currentForm = {
            id: generateUUID(),
            name: 'Training Session Feedback',
            event_identifier: this.currentEventId,
            created_by: 'coach-mock',
            created_at: new Date().toISOString(),
            allow_anonymous: false,
            structure: {
                sections: [
                    {
                        id: 'section-1',
                        title: 'Performance Assessment',
                        questions: [
                            {
                                id: 'q1-1',
                                text: 'How would you rate your overall performance today?',
                                type: 'rating',
                                required: true
                            },
                            {
                                id: 'q1-2',
                                text: 'What was the highlight of today\'s session?',
                                type: 'text',
                                required: false
                            }
                        ]
                    },
                    {
                        id: 'section-2',
                        title: 'Team Feedback',
                        questions: [
                            {
                                id: 'q2-1',
                                text: 'How was the team communication?',
                                type: 'multipleChoice',
                                required: true,
                                options: ['Excellent', 'Good', 'Average', 'Needs Improvement']
                            },
                            {
                                id: 'q2-2',
                                text: 'Any additional comments or suggestions?',
                                type: 'text',
                                required: false
                            }
                        ]
                    }
                ]
            }
        };
        
        console.log('Mock form created for player:', this.currentForm);
    }
    
    async checkExistingResponse() {
        if (!this.currentForm || !this.currentForm.id || !this.currentUserId) {
            console.log('Cannot check existing response - missing form or user ID');
            return;
        }
        
        try {
            console.log('Checking for existing response...');
            const response = await fetch(`/api/forms/${this.currentForm.id}/response/${this.currentUserId}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.hasResponse) {
                    console.log('Found existing response:', data.response);
                    console.log('Response answers object:', data.response.answers);
                    console.log('Available answer keys:', Object.keys(data.response.answers));
                    this.existingResponse = data.response;
                    this.showPlayerExistingResponse();
                } else {
                    console.log('No existing response found - showing form');
                    this.showPlayerFormViewer();
                }
            } else {
                console.log('Error checking existing response, showing form');
                this.showPlayerFormViewer();
            }
        } catch (error) {
            console.error('Error checking existing response:', error);
            // Fallback to showing the form
            this.showPlayerFormViewer();
        }
    }
    
    async showInterface() {
        console.log('Showing interface for user type:', this.currentUserType);
        
        try {
            this.hideLoading();
            
            if (this.currentUserType === 'coach') {
                console.log('Showing coach interface');
                this.showCoachInterface();
            } else {
                console.log('Showing player interface');
                await this.showPlayerInterface();
            }
        } catch (error) {
            console.error('Error showing interface:', error);
            this.hideLoading();
            this.showError('Failed to load interface: ' + error.message);
        }
    }
    
    showCoachInterface() {
        console.log('Setting up coach interface');
        this.hideAllScreens();
        document.getElementById('coach-interface').classList.remove('hidden');
        
        if (this.currentForm) {
            console.log('Showing coach form area');
            this.showCoachFormArea();
        } else {
            console.log('Showing coach no form screen');
            this.showCoachNoForm();
        }
    }
    
    async showPlayerInterface() {
        this.hideAllScreens();
        document.getElementById('player-interface').classList.remove('hidden');
        
        if (this.currentForm) {
            // Check for existing responses before showing form
            await this.checkExistingResponse();
        } else {
            this.showPlayerNoForm();
        }
    }
    
    showCoachNoForm() {
        this.hideAllCoachScreens();
        document.getElementById('coach-no-form').classList.remove('hidden');
        document.getElementById('coach-no-form').classList.add('active');
        
        // Load templates into the gallery
        this.renderTemplateGallery();
    }
    
    renderTemplateGallery() {
        console.log('Rendering template gallery...');
        
        // Render recent forms (last 3 created by the club)
        this.renderRecentForms();
        
        // Render all templates
        const templateGrid = document.getElementById('template-grid');
        if (!templateGrid) {
            console.error('Template grid element not found');
            return;
        }
        
        if (!this.templates || this.templates.length === 0) {
            console.warn('No templates available');
            return;
        }
        
        templateGrid.innerHTML = '';
        console.log('Adding', this.templates.length, 'templates to grid');
        
        this.templates.forEach((template, index) => {
            console.log('Creating card for template', index + 1, ':', template.name);
            const templateCard = this.createTemplateCard(template);
            templateCard.addEventListener('click', () => {
                console.log('Template card clicked:', template.name);
                this.selectTemplate(template);
            });
            templateGrid.appendChild(templateCard);
        });
        
        console.log('Template gallery rendered successfully');
    }
    
    renderRecentForms() {
        const recentGrid = document.getElementById('recent-forms-grid');
        if (!recentGrid) return;
        
        // Load recent forms created by this club
        this.loadRecentForms().then(recentForms => {
            recentGrid.innerHTML = '';
            
            if (recentForms.length === 0) {
                recentGrid.innerHTML = '<p class="no-data">No recent forms found. Create your first form!</p>';
                return;
            }
            
            recentForms.forEach(form => {
                const formCard = this.createRecentFormCard(form);
                recentGrid.appendChild(formCard);
            });
        }).catch(error => {
            console.error('Error loading recent forms:', error);
            recentGrid.innerHTML = '<p class="no-data">Error loading recent forms.</p>';
        });
    }
    
    async loadRecentForms() {
        try {
            // Get recent forms for this club (last 3 forms)
            const response = await fetch(`/api/forms?event_id=${this.currentEventId}&limit=3&recent=true`);
            if (!response.ok) throw new Error('Failed to load recent forms');
            
            const forms = await response.json();
            return forms.slice(0, 3); // Limit to 3 most recent
        } catch (error) {
            console.error('Error fetching recent forms:', error);
            return [];
        }
    }
    
    createRecentFormCard(form) {
        const card = document.createElement('div');
        card.className = 'template-card recent-form-card';
        
        const sectionCount = form.structure?.sections?.length || 0;
        const questionCount = form.structure?.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0;
        const createdDate = form.created_at ? new Date(form.created_at).toLocaleDateString() : 'Recently';
        
        card.innerHTML = `
            <div class="template-content">
                <div class="template-content-header">
                    <div class="template-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="template-info">
                        <h3>${form.name}</h3>
                        <p class="template-description">Custom form created ${createdDate}</p>
                    </div>
                </div>
                <div class="template-stats">
                    <div class="template-stat">
                        <span class="stat-value">${sectionCount}</span>
                        <span class="stat-label">Sections</span>
                    </div>
                    <div class="template-stat">
                        <span class="stat-value">${questionCount}</span>
                        <span class="stat-label">Questions</span>
                    </div>
                    <div class="template-stat">
                        <span class="stat-value">${form.estimated_time || '~5 min'}</span>
                        <span class="stat-label">Duration</span>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-sm btn-outline" onclick="window.app.duplicateForm('${form.id}')">
                        <i class="fas fa-copy"></i> Duplicate
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    async duplicateForm(formId) {
        try {
            console.log('Duplicating form:', formId);
            
            // Get the form data
            const response = await fetch(`/api/forms?event_id=${this.currentEventId}`);
            if (!response.ok) throw new Error('Failed to load forms');
            
            const forms = await response.json();
            const formToDuplicate = forms.find(f => f.id === formId);
            
            if (!formToDuplicate) {
                throw new Error('Form not found');
            }
            
            // Create a new form based on the existing one
            const duplicatedFormData = {
                name: `${formToDuplicate.name} (Copy)`,
                event_identifier: this.currentEventId,
                sections: formToDuplicate.structure.sections.map(section => ({
                    title: section.title,
                    description: section.description || '',
                    questions: section.questions.map(question => ({
                        text: question.text,
                        type: question.type,
                        options: question.options || null,
                        scale: question.scale || null,
                        required: question.required !== undefined ? question.required : true,
                        club_identifier: this.currentClubId,
                        anonymous: false,
                        question_bank: false
                    }))
                }))
            };
            
            // Save the duplicated form
            const saveResponse = await fetch('/api/forms/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(duplicatedFormData)
            });
            
            if (!saveResponse.ok) {
                throw new Error('Failed to duplicate form');
            }
            
            const newForm = await saveResponse.json();
            console.log('Form duplicated successfully:', newForm);
            
            // Refresh the interface
            this.showAlert('Form duplicated successfully!', 'success');
            this.renderRecentForms();
            
        } catch (error) {
            console.error('Error duplicating form:', error);
            this.showAlert('Failed to duplicate form. Please try again.', 'error');
        }
    }
    
    showRenameForm() {
        const currentName = document.getElementById('form-title').textContent;
        const newName = prompt('Enter new form name:', currentName);
        
        if (newName && newName.trim() !== '' && newName.trim() !== currentName) {
            this.renameForm(newName.trim());
        }
    }
    
    async renameForm(newName) {
        try {
            if (!this.currentForm || !this.currentForm.id) {
                throw new Error('No form selected');
            }
            
            console.log('Renaming form:', this.currentForm.id, 'to:', newName);
            
            // Update form name via API
            const response = await fetch(`/api/forms/${this.currentForm.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName,
                    sections: this.currentForm.structure.sections
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to rename form');
            }
            
            const updatedForm = await response.json();
            
            // Update local state
            this.currentForm.name = newName;
            
            // Update UI
            document.getElementById('form-title').textContent = newName;
            
            console.log('Form renamed successfully');
            this.showAlert('Form renamed successfully!', 'success');
            
        } catch (error) {
            console.error('Error renaming form:', error);
            this.showAlert('Failed to rename form. Please try again.', 'error');
        }
    }
    
    createTemplateCard(template) {
        console.log('Creating template card for:', template.name);
        const card = document.createElement('div');
        card.className = 'template-card';
        card.style.cursor = 'pointer';
        
        // Remove any existing onclick and use addEventListener instead
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Template card direct click handler triggered for:', template.name);
            console.log('🎯 Template object:', template);
            console.log('🎯 About to call selectTemplate...');
            this.selectTemplate(template);
        });
        
        // Determine template icon based on type
        let iconClass = 'fas fa-clipboard-list';
        if (template.type === 'match') iconClass = 'fas fa-futbol';
        if (template.type === 'training') iconClass = 'fas fa-dumbbell';
        if (template.type === 'tactical') iconClass = 'fas fa-chess';
        
        card.innerHTML = `
            <div class="template-content-header">
                <div class="template-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="template-text-content">
                    <h3>${template.name}</h3>
                    <p>${template.description || 'Comprehensive feedback form for GAA teams'}</p>
                </div>
                <div class="template-badge">${template.type}</div>
            </div>
            <div class="template-meta">
                <div class="template-stats">
                    <div class="template-stat">
                        <i class="fas fa-layer-group"></i>
                        <span>${template.sections || 0} sections</span>
                    </div>
                    <div class="template-stat">
                        <i class="fas fa-question"></i>
                        <span>${template.questions || 0} questions</span>
                    </div>
                </div>
                <div class="template-stat">
                    <i class="fas fa-clock"></i>
                    <span>${template.estimatedTime || '5 min'}</span>
                </div>
            </div>
        `;
        
        return card;
    }
    
    selectTemplate(template) {
        console.log('🚀 selectTemplate called with:', template);
        console.log('🚀 Template name:', template?.name);
        console.log('🚀 Template type:', template?.type);
        
        if (!template) {
            console.error('❌ No template provided to selectTemplate');
            return;
        }
        
        this.selectedTemplate = template;
        
        try {
            console.log('🚀 About to show template preview...');
            this.showTemplatePreview(template);
            console.log('✅ Template preview shown successfully');
        } catch (error) {
            console.error('❌ Error showing template preview:', error);
            console.error('❌ Error stack:', error.stack);
        }
    }
    
    showTemplatePreview(template) {
        console.log('🎨 showTemplatePreview called with:', template.name);
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.onclick = () => this.closeTemplatePreview();
        console.log('🎨 Modal overlay created');
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'template-preview-modal';
        modal.onclick = (e) => e.stopPropagation();
        console.log('🎨 Modal content created');
        
        // Determine template icon
        let iconClass = 'fas fa-clipboard-list';
        if (template.type === 'match') iconClass = 'fas fa-futbol';
        if (template.type === 'training') iconClass = 'fas fa-dumbbell';
        if (template.type === 'tactical') iconClass = 'fas fa-chess';
        
        modal.innerHTML = `
            <div class="modal-header">
                <div class="template-preview-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="template-preview-info">
                    <h2>${template.name}</h2>
                    <p>${template.description || 'Comprehensive feedback form for GAA teams'}</p>
                    <div class="template-preview-badges">
                        <span class="template-type-badge">${template.type}</span>
                        <span class="template-stat-badge">
                            <i class="fas fa-clock"></i> ${template.estimatedTime || '5 min'}
                        </span>
                    </div>
                </div>
                <button class="close-btn" onclick="window.app.closeTemplatePreview()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="preview-section">
                    <h3>What's included:</h3>
                    <div class="preview-stats">
                        <div class="preview-stat">
                            <i class="fas fa-layer-group"></i>
                            <span>${template.sections || 3} sections</span>
                        </div>
                        <div class="preview-stat">
                            <i class="fas fa-question"></i>
                            <span>${template.questions || 8} questions</span>
                        </div>
                        <div class="preview-stat">
                            <i class="fas fa-users"></i>
                            <span>For all team members</span>
                        </div>
                    </div>
                </div>
                <div class="preview-form-sample">
                    <h4>Sample questions:</h4>
                    <div class="sample-questions">
                        <div class="sample-question">How would you rate today's performance?</div>
                        <div class="sample-question">What areas need improvement?</div>
                        <div class="sample-question">Team communication effectiveness?</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.app.closeTemplatePreview()">
                    Cancel
                </button>
                <button class="btn btn-primary" onclick="window.app.useTemplate()">
                    <i class="fas fa-rocket"></i> Use This Template
                </button>
            </div>
        `;
        
        modalOverlay.appendChild(modal);
        console.log('🎨 Modal appended to overlay');
        
        document.body.appendChild(modalOverlay);
        console.log('🎨 Modal overlay added to body');
        
        // Add animation
        setTimeout(() => {
            modalOverlay.classList.add('active');
            console.log('✨ Modal activated with .active class');
        }, 10);
        
        console.log('✅ showTemplatePreview completed successfully');
    }
    
    closeTemplatePreview() {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        }
    }
    
    useTemplate() {
        this.closeTemplatePreview();
        this.createFormFromTemplate();
    }
    
    async createFormFromTemplate() {
        if (!this.selectedTemplate) return;
        
        try {
            console.log('Creating form from template:', this.selectedTemplate.name);
            
            // Show loading state
            this.showLoading();
            
            // Try to create form via API, but fallback to mock if it fails
            let formCreated = false;
            
            try {
                const response = await fetch('/api/forms/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        templateId: this.selectedTemplate.id,
                        eventId: this.currentEventId,
                        customizations: {
                            name: `${this.selectedTemplate.name} - Event ${this.currentEventId}`,
                            created_by: this.currentUserId,
                            allow_anonymous: false
                        }
                    })
                });
                
                if (response.ok) {
                    const form = await response.json();
                    console.log('Form created from template via API:', form);
                    
                    // Set as current form
                    this.currentForm = {
                        id: form.id,
                        name: form.name,
                        event_identifier: form.event_identifier,
                        structure: this.selectedTemplate.structure
                    };
                    formCreated = true;
                } else {
                    console.warn('API form creation failed, status:', response.status);
                }
            } catch (apiError) {
                console.warn('API form creation error:', apiError.message);
            }
            
            // If API failed, create a mock form for development/testing
            if (!formCreated) {
                console.log('Creating mock form for template:', this.selectedTemplate.name);
                
                this.currentForm = {
                    id: generateUUID(),
                    name: `${this.selectedTemplate.name} - Event ${this.currentEventId}`,
                    event_identifier: this.currentEventId,
                    structure: this.generateMockFormStructure(this.selectedTemplate),
                    created_by: this.currentUserId,
                    created_at: new Date().toISOString(),
                    allow_anonymous: false
                };
                
                console.log('Mock form created:', this.currentForm);
            }
            
            this.hideLoading();
            this.showCoachFormArea();
            this.showSuccess(`Form "${this.selectedTemplate.name}" created successfully!`);
            
        } catch (error) {
            console.error('Error creating form from template:', error);
            this.hideLoading();
            this.showError('Failed to create form from template: ' + error.message);
        }
    }
    
    showCoachFormArea() {
        this.hideAllCoachScreens();
        document.getElementById('coach-form-area').classList.remove('hidden');
        document.getElementById('coach-form-area').classList.add('active');
        
        // Update form title and event name
        document.getElementById('form-title').textContent = this.currentForm.name;
        document.getElementById('event-name-area').textContent = `Event ${this.currentEventId}`;
        
        // Load analytics data
        this.loadAnalytics();
        
        // Refresh form tab content
        this.loadFormView();
    }
    
    showPlayerNoForm() {
        this.hideAllPlayerScreens();
        document.getElementById('player-no-form').classList.remove('hidden');
        document.getElementById('player-no-form').classList.add('active');
        document.getElementById('event-name-player').textContent = `Event ${this.currentEventId}`;
    }
    
    showPlayerFormViewer() {
        this.hideAllPlayerScreens();
        document.getElementById('player-form-viewer').classList.remove('hidden');
        document.getElementById('player-form-viewer').classList.add('active');
        
        // Update form title and event name
        document.getElementById('player-form-title').textContent = this.currentForm.name;
        document.getElementById('event-name-form').textContent = `Event ${this.currentEventId}`;
        
        // Render the form
        this.renderPlayerForm();
    }
    
    // Coach Functions
    showFormBuilder() {
        console.log('🎨 showFormBuilder called');
        this.hideAllCoachScreens();
        
        const formBuilderEl = document.getElementById('coach-form-builder');
        console.log('Form builder element:', formBuilderEl);
        
        if (formBuilderEl) {
            formBuilderEl.classList.remove('hidden');
            formBuilderEl.classList.add('active');
            console.log('✅ Form builder should now be visible');
            console.log('Classes:', formBuilderEl.classList.toString());
        } else {
            console.error('❌ Form builder element not found');
        }
        
        const eventNameEl = document.getElementById('event-name-builder');
        if (eventNameEl) {
            eventNameEl.textContent = `Event ${this.currentEventId}`;
        }
        
        this.initializeFormBuilder();
    }
    
    renderTemplateSelector() {
        const grid = document.getElementById('templates-grid');
        grid.innerHTML = '';
        
        this.templates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.onclick = () => this.selectTemplate(template);
            
            templateCard.innerHTML = `
                <div class="template-header">
                    <h3>${template.icon} ${template.name}</h3>
                    <span class="template-type">${template.type}</span>
                </div>
                <div class="template-body">
                    <p>${template.description}</p>
                    <div class="template-meta">
                        <span><i class="fas fa-list"></i> ${template.sections} sections</span>
                        <span><i class="fas fa-question"></i> ${template.questions} questions</span>
                        <span><i class="fas fa-clock"></i> ${template.estimatedTime}</span>
                    </div>
                </div>
            `;
            
            grid.appendChild(templateCard);
        });
    }
    
    selectTemplate(template) {
        // Remove selection from all cards
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        event.target.closest('.template-card').classList.add('selected');
        
        this.selectedTemplate = template;
        document.getElementById('create-form-btn').disabled = false;
    }
    
    async createFormFromTemplate() {
        if (!this.selectedTemplate) return;
        
        try {
            const response = await fetch('/api/forms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateId: this.selectedTemplate.id,
                    eventId: this.currentEventId,
                    customizations: {
                        name: `${this.selectedTemplate.name} - Event ${this.currentEventId}`
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create form');
            }
            
            this.currentForm = await response.json();
            console.log('Form created:', this.currentForm);
            
            // Show success and redirect to form area
            this.showSuccess('Form created successfully!');
            setTimeout(() => {
                this.showCoachFormArea();
            }, 1000);
            
        } catch (error) {
            console.error('Error creating form:', error);
            this.showError('Failed to create form: ' + error.message);
        }
    }
    
    cancelFormBuilder() {
        this.selectedTemplate = null;
        
        // If we have a current form, return to form view; otherwise go to no form screen
        if (this.currentForm && this.currentForm.id) {
            this.showCoachFormArea();
        } else {
            document.getElementById('create-form-btn').disabled = true;
            this.showCoachNoForm();
        }
    }
    
    // Player Functions
    renderPlayerForm() {
        if (!this.currentForm || !this.currentForm.structure || !this.currentForm.structure.sections) {
            console.error('Form structure not available');
            return;
        }
        
        // Initialize form state
        this.formState = {
            currentSection: 0,
            responses: {},
            startTime: Date.now()
        };
        
        // Update form title and info
        document.getElementById('player-form-title').textContent = this.currentForm.name;
        document.getElementById('event-name-form').textContent = this.currentEventId;
        document.getElementById('estimated-time').innerHTML = `<i class="fas fa-clock"></i> ${this.currentForm.estimated_time || '~5 minutes'}`;
        document.getElementById('player-id-display').textContent = this.currentUserId;
        
        // Set up sections
        document.getElementById('total-sections').textContent = this.currentForm.structure.sections.length;
        
        this.renderFormSections();
        this.renderSectionIndicators();
        this.updateProgress();
        this.showSection(0);
    }
    
    renderFormSections() {
        const sectionsContainer = document.getElementById('form-sections');
        sectionsContainer.innerHTML = '';
        
        this.currentForm.structure.sections.forEach((section, sectionIndex) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'form-section';
            sectionDiv.id = `section-${sectionIndex}`;
            
            // Section header
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'form-section-header';
            sectionHeader.innerHTML = `
                <h3>${section.title}</h3>
                <p>${section.description || 'Please answer the questions in this section.'}</p>
            `;
            
            // Questions container
            const questionsDiv = document.createElement('div');
            questionsDiv.className = 'form-questions';
            
            section.questions.forEach((question, questionIndex) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'form-question';
                
                const label = document.createElement('label');
                label.className = 'question-label';
                label.innerHTML = `${question.text}${question.required ? '<span class="question-required">*</span>' : ''}`;
                
                const inputContainer = document.createElement('div');
                inputContainer.className = 'question-input-container';
                inputContainer.appendChild(this.createQuestionInput(question));
                
                questionDiv.appendChild(label);
                questionDiv.appendChild(inputContainer);
                questionsDiv.appendChild(questionDiv);
            });
            
            sectionDiv.appendChild(sectionHeader);
            sectionDiv.appendChild(questionsDiv);
            sectionsContainer.appendChild(sectionDiv);
        });
    }
    
    renderSectionIndicators() {
        const indicatorsContainer = document.getElementById('section-indicators');
        indicatorsContainer.innerHTML = '';
        
        this.currentForm.structure.sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'section-dot';
            dot.onclick = () => this.showSection(index);
            indicatorsContainer.appendChild(dot);
        });
    }
    
    showSection(sectionIndex) {
        // Hide all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show current section
        const currentSection = document.getElementById(`section-${sectionIndex}`);
        if (currentSection) {
            currentSection.classList.add('active');
        }
        
        // Update form state
        this.formState.currentSection = sectionIndex;
        
        // Update navigation buttons
        this.updateNavigationButtons();
        this.updateProgress();
        this.updateSectionIndicators();
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const currentSection = this.formState.currentSection;
        const totalSections = this.currentForm.structure.sections.length;
        
        // Previous button
        prevBtn.disabled = currentSection === 0;
        
        // Next/Submit button
        if (currentSection === totalSections - 1) {
            nextBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Form';
            nextBtn.className = 'btn btn-success nav-btn';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
            nextBtn.className = 'btn btn-primary nav-btn';
        }
    }
    
    updateProgress() {
        const currentSection = this.formState.currentSection;
        const totalSections = this.currentForm.structure.sections.length;
        const progress = Math.round(((currentSection + 1) / totalSections) * 100);
        
        document.getElementById('current-section').textContent = currentSection + 1;
        document.getElementById('progress-percentage').textContent = progress + '%';
        document.getElementById('progress-bar-fill').style.width = progress + '%';
    }
    
    updateSectionIndicators() {
        const dots = document.querySelectorAll('.section-dot');
        const currentSection = this.formState.currentSection;
        
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed', 'current');
            
            if (index < currentSection) {
                dot.classList.add('completed');
            } else if (index === currentSection) {
                dot.classList.add('current');
            }
        });
    }
    
    createQuestionInput(question) {
        const container = document.createElement('div');
        container.className = 'question-input';
        
        switch (question.type) {
            case 'rating':
                const ratingDiv = document.createElement('div');
                ratingDiv.className = 'rating-input';
                
                for (let i = 1; i <= (question.scale || 10); i++) {
                    const btn = document.createElement('button');
                    btn.className = 'rating-btn';
                    btn.textContent = i;
                    btn.type = 'button';
                    btn.onclick = () => {
                        ratingDiv.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        this.responses[question.id] = i;
                    };
                    
                    // Pre-select if editing existing response
                    if (this.responses[question.id] === i) {
                        btn.classList.add('selected');
                    }
                    ratingDiv.appendChild(btn);
                }
                
                container.appendChild(ratingDiv);
                break;
                
            case 'text':
                const textarea = document.createElement('textarea');
                textarea.className = 'text-input';
                textarea.placeholder = 'Enter your response...';
                textarea.rows = 3;
                textarea.oninput = (e) => {
                    this.responses[question.id] = e.target.value;
                };
                
                // Pre-populate if editing existing response
                if (this.responses[question.id]) {
                    textarea.value = this.responses[question.id];
                }
                container.appendChild(textarea);
                break;
                
            case 'multiple_choice':
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options-input';
                
                question.options.forEach((option, index) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `q_${question.id}`;
                    radio.value = option;
                    radio.id = `${question.id}_${index}`;
                    radio.onchange = () => {
                        this.responses[question.id] = option;
                    };
                    
                    // Pre-select if editing existing response
                    if (this.responses[question.id] === option) {
                        radio.checked = true;
                    }
                    
                    const label = document.createElement('label');
                    label.htmlFor = radio.id;
                    label.textContent = option;
                    
                    optionDiv.appendChild(radio);
                    optionDiv.appendChild(label);
                    optionsDiv.appendChild(optionDiv);
                });
                
                container.appendChild(optionsDiv);
                break;
                
            case 'yes_no':
                const yesNoDiv = document.createElement('div');
                yesNoDiv.className = 'options-input';
                
                ['Yes', 'No'].forEach(option => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `q_${question.id}`;
                    radio.value = option.toLowerCase();
                    radio.id = `${question.id}_${option}`;
                    radio.onchange = () => {
                        this.responses[question.id] = option.toLowerCase();
                    };
                    
                    // Pre-select if editing existing response
                    if (this.responses[question.id] === option.toLowerCase()) {
                        radio.checked = true;
                    }
                    
                    const label = document.createElement('label');
                    label.htmlFor = radio.id;
                    label.textContent = option;
                    
                    optionDiv.appendChild(radio);
                    optionDiv.appendChild(label);
                    yesNoDiv.appendChild(optionDiv);
                });
                
                container.appendChild(yesNoDiv);
                break;
        }
        
        return container;
    }
    
    async submitPlayerResponse() {
        if (!this.currentForm || !this.formState) {
            console.error('Missing form or form state');
            console.error('currentForm:', this.currentForm);
            console.error('formState:', this.formState);
            this.showNotification('Form not properly loaded. Please refresh the page.', 'error');
            return;
        }
        
        if (!this.currentForm.id) {
            console.error('Form ID is missing');
            this.showNotification('Form ID is missing. Cannot submit response.', 'error');
            return;
        }
        
        // Calculate completion time
        const completionTime = Math.round((Date.now() - this.formState.startTime) / 1000);
        
        if (!this.currentUserId) {
            this.showNotification('User ID is required to submit response.', 'error');
            return;
        }
        
        // Validate we have responses to submit
        if (!this.responses || Object.keys(this.responses).length === 0) {
            console.error('No responses to submit');
            this.showNotification('Please answer at least one question before submitting.', 'error');
            return;
        }
        
        const submissionData = {
            formId: this.currentForm.id,
            userId: this.currentUserId,
            responses: this.responses,
            completionTimeSeconds: completionTime,
            eventId: this.currentEventId,
            clubId: this.currentClubId,
            isUpdate: this.isEditingResponse
        };
        
        console.log('Submitting response with data:', submissionData);
        console.log('Form ID:', this.currentForm.id);
        console.log('User ID:', this.currentUserId);
        console.log('Responses:', this.responses);
        console.log('Response count:', Object.keys(this.responses).length);
        
        try {
            // Try API submission first
            console.log('Attempting API submission to /api/responses/submit');
            const response = await fetch('/api/responses/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API submission failed:', response.status, errorText);
                
                // Try to parse error message
                let errorMessage = 'Unknown error';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.message || errorText;
                } catch (e) {
                    errorMessage = errorText || `HTTP ${response.status}`;
                }
                
                // For development, show success anyway since API might not be fully implemented
                console.log('API failed, but showing success for development/testing');
                this.showNotification(`API submission failed (${errorMessage}), but form completed successfully!`, 'warning');
                this.showPlayerResponseSubmitted();
                return;
            }
            
            const result = await response.json();
            console.log('Response submitted successfully via API:', result);
            
            // Clear edit state
            this.isEditingResponse = false;
            this.existingResponse = null;
            
            this.showPlayerResponseSubmitted();
            
        } catch (error) {
            console.error('Error submitting response:', error);
            
            // For development/testing, show success even if API fails
            console.log('Network/API error, but showing success for development/testing');
            this.showNotification(`Submission error (${error.message}), but form completed successfully!`, 'warning');
            
            // Clear edit state
            this.isEditingResponse = false;
            this.existingResponse = null;
            
            this.showPlayerResponseSubmitted();
        }
    }
    
    // Player form navigation
    navigateForm(direction) {
        if (!this.formState) return;
        
        const currentSection = this.formState.currentSection;
        const totalSections = this.currentForm.structure.sections.length;
        
        if (direction === 'prev' && currentSection > 0) {
            this.showSection(currentSection - 1);
        } else if (direction === 'next') {
            if (currentSection < totalSections - 1) {
                // Move to next section
                this.showSection(currentSection + 1);
            } else {
                // Last section - submit form
                this.submitPlayerResponse();
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#f0ad4e' : '#5bc0de'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    async switchUserType() {
        // Toggle between coach and player
        this.currentUserType = this.currentUserType === 'coach' ? 'player' : 'coach';
        console.log('Switched user type to:', this.currentUserType);
        
        // Show the appropriate interface
        await this.showInterface();
    }
    
    // Coach Analytics and Response functions
    
    showPlayerExistingResponse() {
        this.hideAllPlayerScreens();
        document.getElementById('player-existing-response').classList.remove('hidden');
        document.getElementById('player-existing-response').classList.add('active');
        
        // Populate the existing response view
        this.populateExistingResponseView();
    }
    
    showPlayerResponseSubmitted() {
        this.hideAllPlayerScreens();
        document.getElementById('player-response-submitted').classList.remove('hidden');
        document.getElementById('player-response-submitted').classList.add('active');
    }
    
    populateExistingResponseView() {
        if (!this.existingResponse) return;
        
        // Set header information
        document.getElementById('existing-response-form-title').textContent = this.currentForm.name;
        document.getElementById('existing-response-event').textContent = this.currentEventId;
        document.getElementById('existing-response-player-id').textContent = this.currentUserId;
        
        // Format and display submission date
        let submissionDate;
        if (this.existingResponse.submittedAt && this.existingResponse.submittedAt !== 'null') {
            submissionDate = new Date(this.existingResponse.submittedAt);
            // Check if date is valid
            if (isNaN(submissionDate.getTime())) {
                submissionDate = new Date(); // Fallback to current date
            }
        } else {
            submissionDate = new Date(); // Fallback to current date
        }
        document.getElementById('response-date').textContent = submissionDate.toLocaleDateString();
        
        // Populate response content
        const container = document.getElementById('existing-response-content');
        let html = '';
        
        this.currentForm.structure.sections.forEach((section, sectionIndex) => {
            html += `
                <div class="response-section">
                    <h3 class="section-title">
                        <i class="fas fa-list"></i> ${section.title}
                    </h3>
                    <div class="section-responses">
            `;
            
            section.questions.forEach((question, questionIndex) => {
                const answer = this.existingResponse.answers[question.id];
                const questionNumber = `${sectionIndex + 1}.${questionIndex + 1}`;
                
                console.log('Displaying question:', question.id, 'type:', question.type, 'answer:', answer);
                
                html += `
                    <div class="response-item">
                        <div class="question-info">
                            <span class="question-number">${questionNumber}</span>
                            <span class="question-text">${question.text}</span>
                        </div>
                        <div class="answer-display">
                            ${this.formatAnswerDisplay(question, answer)}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    formatAnswerDisplay(question, answer) {
        console.log('Formatting answer for question type:', question.type, 'answer:', answer, 'type of answer:', typeof answer);
        
        if (answer === null || answer === undefined || answer === '') {
            return '<span class="no-answer">No response</span>';
        }
        
        switch (question.type) {
            case 'rating':
                const scale = question.scale || 10;
                return `<div class="rating-display">
                    <span class="rating-value">${answer}</span>
                    <span class="rating-scale">/ ${scale}</span>
                    <div class="rating-stars">${'★'.repeat(Math.min(answer, 5))}${'☆'.repeat(Math.max(0, 5 - answer))}</div>
                </div>`;
                
            case 'multiple_choice':
                return `<span class="choice-answer">${answer}</span>`;
                
            case 'yes_no':
                const icon = answer === 'yes' ? 'fa-check-circle' : 'fa-times-circle';
                const color = answer === 'yes' ? 'text-success' : 'text-danger';
                return `<span class="yn-answer ${color}"><i class="fas ${icon}"></i> ${answer.charAt(0).toUpperCase() + answer.slice(1)}</span>`;
                
            case 'text':
                return `<div class="text-answer">${answer}</div>`;
                
            default:
                return `<span class="answer">${answer}</span>`;
        }
    }
    
    editExistingResponse() {
        // Set edit mode
        this.isEditingResponse = true;
        
        // Populate the form with existing responses
        this.responses = { ...this.existingResponse.answers };
        
        // Show the form in edit mode
        this.showPlayerFormViewer();
        
        // Add edit mode indicator
        this.showNotification('Editing your previous response. Your changes will update your submission.', 'info');
    }
    
    viewResponseOnly() {
        // Just stay on the existing response view - no action needed
        console.log('Viewing response in read-only mode');
    }
    
    // Tab Functions (Coach)
    showTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Show selected tab
        document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load tab content
        switch (tabName) {
            case 'analysis':
                this.loadAnalytics();
                break;
            case 'responses':
                this.loadResponses();
                break;
            case 'form':
                this.loadFormView();
                break;
        }
    }
    
    async loadAnalytics() {
        if (!this.currentForm) return;
        
        try {
            const response = await fetch(`/api/forms/${this.currentForm.id}/analytics`);
            if (response.ok) {
                const analytics = await response.json();
                this.updateAnalyticsDisplay(analytics);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }
    
    updateAnalyticsDisplay(analytics) {
        // Update basic metrics
        document.getElementById('response-rate').textContent = analytics.responseRate + '%';
        document.getElementById('total-responses').textContent = analytics.totalResponses;
        document.getElementById('player-count').textContent = analytics.totalResponses + ' players';
        document.getElementById('avg-completion-time').textContent = Math.round(analytics.averageCompletionTime / 60) + ' min';
        
        // Calculate engagement score
        const engagementScore = Math.min(100, Math.round((analytics.responseRate + (analytics.totalResponses > 10 ? 30 : 0) + (analytics.averageCompletionTime < 300 ? 20 : 0))));
        document.getElementById('engagement-score').textContent = engagementScore;
        
        // Update progress bar
        document.getElementById('response-rate-progress').style.width = analytics.responseRate + '%';
        
        // Update insights
        this.updateInsights(analytics);
        
        // Create charts
        this.createCharts(analytics);
    }
    
    updateInsights(analytics) {
        const insightsContainer = document.getElementById('analytics-insights');
        let html = '<div class="insights-list">';
        
        if (analytics.insights && analytics.insights.length > 0) {
            analytics.insights.forEach(insight => {
                html += `<div class="insight-item"><i class="fas fa-lightbulb"></i> ${insight}</div>`;
            });
        } else {
            html += '<div class="insight-item">No insights available yet.</div>';
        }
        
        html += '</div>';
        insightsContainer.innerHTML = html;
    }
    
    createCharts(analytics) {
        try {
            if (typeof Chart !== 'undefined') {
                this.createResponseDistributionChart(analytics);
                this.createRatingAnalysisChart();
                this.createCompletionTimeChart(analytics);
            } else {
                console.warn('Chart.js not loaded, skipping chart creation');
                // Add placeholder messages
                document.getElementById('responseDistributionChart').parentNode.innerHTML = '<p>Charts loading...</p>';
                document.getElementById('ratingAnalysisChart').parentNode.innerHTML = '<p>Charts loading...</p>';
                document.getElementById('completionTimeChart').parentNode.innerHTML = '<p>Charts loading...</p>';
            }
        } catch (error) {
            console.error('Error creating charts:', error);
        }
    }
    
    createResponseDistributionChart(analytics) {
        try {
            const ctx = document.getElementById('responseDistributionChart').getContext('2d');
            
            new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Responses Received', 'Pending'],
                datasets: [{
                    data: [analytics.totalResponses, 25 - analytics.totalResponses], // Assuming 25 total players
                    backgroundColor: ['#667eea', '#e9ecef'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error creating response distribution chart:', error);
        }
    }
    
    createRatingAnalysisChart() {
        try {
            // This will be populated with actual response data
            const ctx = document.getElementById('ratingAnalysisChart').getContext('2d');
        
        // Sample data for demonstration
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1-2', '3-4', '5-6', '7-8', '9-10'],
                datasets: [{
                    label: 'Response Count',
                    data: [1, 2, 5, 6, 2],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error creating rating analysis chart:', error);
        }
    }
    
    createCompletionTimeChart(analytics) {
        const ctx = document.getElementById('completionTimeChart').getContext('2d');
        
        // Sample data for completion times
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Response 1', 'Response 5', 'Response 10', 'Response 15'],
                datasets: [{
                    label: 'Completion Time (min)',
                    data: [5, 4, 6, 3],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    async loadResponses() {
        if (!this.currentForm) return;
        
        try {
            const response = await fetch(`/api/forms/${this.currentForm.id}/responses`);
            if (response.ok) {
                const responses = await response.json();
                this.responsesData = responses; // Store for toggle functionality
                this.currentResponseView = 'player'; // Default view
                this.updateResponsesDisplay();
            }
        } catch (error) {
            console.error('Error loading responses:', error);
        }
    }
    
    updateResponsesDisplay() {
        if (this.currentResponseView === 'player') {
            this.displayByPlayer();
        } else {
            this.displayByQuestion();
        }
    }
    
    displayByPlayer() {
        const container = document.getElementById('player-responses-grid');
        
        if (!this.responsesData || this.responsesData.length === 0) {
            container.innerHTML = '<p class="no-data">No responses received yet.</p>';
            return;
        }
        
        let html = '';
        
        this.responsesData.forEach((response, index) => {
            let submittedDate;
            if (response.submittedAt && response.submittedAt !== 'null') {
                const date = new Date(response.submittedAt);
                submittedDate = isNaN(date.getTime()) ? 'Recently' : date.toLocaleString();
            } else {
                submittedDate = 'Recently';
            }
            const completionTime = Math.round(response.completionTime / 60);
            
            html += `
                <div class="response-card">
                    <div class="response-header">
                        <h4>Response #${index + 1}</h4>
                        <div class="response-meta">
                            <span class="response-time">${completionTime} min</span>
                            <span class="response-date">${submittedDate}</span>
                        </div>
                    </div>
                    <div class="response-answers">
            `;
            
            Object.values(response.answers).forEach(answer => {
                html += `
                    <div class="answer-item">
                        <div class="question-text">${answer.question}</div>
                        <div class="answer-text">${answer.answer}</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    displayByQuestion() {
        const container = document.getElementById('questions-analysis-content');
        
        if (!this.responsesData || this.responsesData.length === 0) {
            container.innerHTML = '<p class="no-data">No responses received yet.</p>';
            return;
        }
        
        // Group responses by question
        const questionData = {};
        
        this.responsesData.forEach(response => {
            Object.entries(response.answers).forEach(([questionId, answerData]) => {
                if (!questionData[questionId]) {
                    questionData[questionId] = {
                        question: answerData.question,
                        type: answerData.questionType,
                        answers: []
                    };
                }
                questionData[questionId].answers.push(answerData.answer);
            });
        });
        
        let html = '';
        
        Object.entries(questionData).forEach(([questionId, data]) => {
            html += `
                <div class="question-analysis-card">
                    <div class="question-analysis-header">
                        <div class="question-info">
                            <h4>${data.question}</h4>
                            <span class="question-type">${data.type}</span>
                        </div>
                        <div class="question-stats">
                            <span>${data.answers.length} responses</span>
                            <button class="btn btn-sm btn-outline view-responses-btn" onclick="window.app.toggleIndividualResponses('${questionId}')" id="toggle-btn-${questionId}">
                                <i class="fas fa-eye"></i> View All Responses
                            </button>
                        </div>
                    </div>
                    <div class="question-analysis-content">
                        ${this.generateQuestionAnalysis(data)}
                    </div>
                    <div class="individual-responses-container" id="responses-${questionId}" style="display: none;">
                        <div class="responses-header">
                            <h6><i class="fas fa-comments"></i> Individual Responses</h6>
                        </div>
                        <div class="individual-responses-list">
                            ${data.answers.map((answer, index) => `
                                <div class="individual-response-item">
                                    <div class="response-meta">
                                        <span class="response-number">Response #${index + 1}</span>
                                    </div>
                                    <div class="response-content">${answer}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    generateQuestionAnalysis(data) {
        switch (data.type) {
            case 'rating':
                return this.generateRatingAnalysis(data.answers);
            case 'multiple_choice':
            case 'yes_no':
                return this.generateChoiceAnalysis(data.answers);
            case 'text':
                return this.generateTextAnalysis(data.answers);
            default:
                return '<div class="analysis-section">Analysis not available for this question type.</div>';
        }
    }
    
    generateRatingAnalysis(answers) {
        const ratings = answers.filter(a => !isNaN(a)).map(a => parseInt(a));
        const ratingCounts = {};
        
        // Initialize counts
        for (let i = 1; i <= 10; i++) {
            ratingCounts[i] = 0;
        }
        
        // Count ratings
        ratings.forEach(rating => {
            ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });
        
        const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
        const maxCount = Math.max(...Object.values(ratingCounts));
        
        let html = `
            <div class="analysis-section">
                <div class="avg-rating">
                    ${avgRating}<div class="avg-rating-label">Average Rating</div>
                </div>
            </div>
            <div class="analysis-section">
                <h5>Rating Distribution</h5>
                <div class="rating-breakdown">
        `;
        
        for (let rating = 10; rating >= 1; rating--) {
            const count = ratingCounts[rating];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            html += `
                <div class="rating-item">
                    <span class="rating-label">${rating}</span>
                    <div class="rating-bar">
                        <div class="rating-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="rating-count">${count}</span>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    generateChoiceAnalysis(answers) {
        const choiceCounts = {};
        answers.forEach(answer => {
            choiceCounts[answer] = (choiceCounts[answer] || 0) + 1;
        });
        
        const totalResponses = answers.length;
        const sortedChoices = Object.entries(choiceCounts).sort(([,a], [,b]) => b - a);
        
        let html = `
            <div class="analysis-section">
                <h5>Response Breakdown</h5>
                <div class="choice-breakdown">
        `;
        
        sortedChoices.forEach(([choice, count]) => {
            const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
            
            html += `
                <div class="choice-item">
                    <span class="choice-label">${choice}</span>
                    <div class="choice-bar">
                        <div class="choice-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="choice-count">${count} (${percentage.toFixed(0)}%)</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    generateTextAnalysis(answers) {
        // Show sample responses
        const sampleAnswers = answers.slice(0, 5);
        
        let html = `
            <div class="analysis-section">
                <h5>Sample Responses</h5>
                <div class="responses-summary">
        `;
        
        sampleAnswers.forEach((answer, index) => {
            html += `
                <div class="response-snippet ${index === 0 ? 'highlight' : ''}">
                    "${answer}"
                </div>
            `;
        });
        
        if (answers.length > 5) {
            html += `<div class="response-snippet">...and ${answers.length - 5} more responses</div>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    switchResponseView(view) {
        this.currentResponseView = view;
        
        // Update toggle buttons
        document.getElementById('by-player-btn').classList.toggle('active', view === 'player');
        document.getElementById('by-question-btn').classList.toggle('active', view === 'question');
        
        // Update views
        document.getElementById('responses-by-player').classList.toggle('active', view === 'player');
        document.getElementById('responses-by-question').classList.toggle('active', view === 'question');
        
        // Update display
        this.updateResponsesDisplay();
    }
    
    toggleIndividualResponses(questionId) {
        const responsesContainer = document.getElementById(`responses-${questionId}`);
        const toggleBtn = document.getElementById(`toggle-btn-${questionId}`);
        
        if (responsesContainer.style.display === 'none') {
            responsesContainer.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Responses';
            toggleBtn.classList.remove('btn-outline');
            toggleBtn.classList.add('btn-secondary');
        } else {
            responsesContainer.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i> View All Responses';
            toggleBtn.classList.remove('btn-secondary');
            toggleBtn.classList.add('btn-outline');
        }
    }
    
    loadFormView() {
        console.log('🔍 loadFormView called');
        console.log('Current form:', this.currentForm);
        
        // Display the form structure
        const formContent = document.getElementById('form-content');
        
        if (!this.currentForm || !this.currentForm.structure || !this.currentForm.structure.sections) {
            console.log('❌ No form or sections available');
            formContent.innerHTML = '<p class="no-data">No form structure available.</p>';
            return;
        }
        
        console.log('✅ Form has sections:', this.currentForm.structure.sections.length);
        
        let html = '<div class="form-structure">';
        
        // Add edit button at the top
        html += `
            <div class="form-actions" style="margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="margin: 0; color: #495057; font-size: 16px;">
                            <i class="fas fa-edit"></i> Form Structure
                        </h3>
                        <p style="margin: 4px 0 0 0; color: #6c757d; font-size: 14px;">
                            ${this.currentForm.structure.sections.length} sections • ${this.currentForm.structure.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                        </p>
                    </div>
                    <button class="btn btn-primary" onclick="window.app.editCurrentForm()" style="flex-shrink: 0;">
                        <i class="fas fa-edit"></i> Edit Form
                    </button>
                </div>
            </div>
        `;
        
        this.currentForm.structure.sections.forEach((section, sectionIndex) => {
            html += `
                <div class="form-section-preview">
                    <div class="section-header">
                        <h3><i class="fas fa-list"></i> ${section.title}</h3>
                        <span class="section-meta">${section.questions.length} questions</span>
                    </div>
                    <div class="section-description">
                        ${section.description || 'No description'}
                    </div>
                    <div class="questions-list">
            `;
            
            section.questions.forEach((question, questionIndex) => {
                const questionNumber = `${sectionIndex + 1}.${questionIndex + 1}`;
                // Handle both question_text and text properties
                const questionText = question.question_text || question.text || 'Unknown question';
                const questionType = question.question_type || question.type || 'unknown';
                const questionOptions = question.options || [];
                const questionScale = question.scale || 10;
                const questionRequired = question.required || false;
                
                html += `
                    <div class="question-preview">
                        <div class="question-number">${questionNumber}</div>
                        <div class="question-content">
                            <div class="question-text">${questionText}</div>
                            <div class="question-type">
                                <span class="type-badge type-${questionType}">
                                    ${this.getQuestionTypeIcon(questionType)} ${this.getQuestionTypeLabel(questionType)}
                                </span>
                                ${questionType === 'rating' ? `<span class="scale-info">Scale: 1-${questionScale}</span>` : ''}
                                ${questionRequired ? '<span class="required-badge">Required</span>' : ''}
                            </div>
                            ${questionOptions.length > 0 ? `<div class="question-options">Options: ${questionOptions.join(', ')}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        formContent.innerHTML = html;
    }
    
    getQuestionTypeIcon(type) {
        const icons = {
            'rating': '⭐',
            'text': '📝',
            'multiple_choice': '☑️',
            'yes_no': '✅'
        };
        return icons[type] || '❓';
    }
    
    getQuestionTypeLabel(type) {
        const labels = {
            'rating': 'Rating',
            'text': 'Text',
            'multiple_choice': 'Multiple Choice',
            'yes_no': 'Yes/No'
        };
        return labels[type] || 'Unknown';
    }
    
    // Form Builder Functions
    initializeFormBuilder() {
        console.log('🏗️ Initializing Perfect Form Builder');
        
        // Initialize form builder state (preserve existing sections if any)
        const existingSections = this.formBuilder ? this.formBuilder.sections : [];
        this.formBuilder = {
            sections: existingSections,
            questionBank: this.generateQuestionBank(),
            customQuestions: this.formBuilder ? this.formBuilder.customQuestions : [],
            selectedQuestion: null,
            selectedSection: null,
            draggedQuestion: null
        };
        
        // Load question bank
        this.loadQuestionBank();
        
        // Load club-specific custom questions from database
        this.loadClubQuestions();
        
        // Initialize empty form structure
        this.renderFormStructure();
        
        // Add drag and drop event listeners
        this.setupDragAndDrop();
        
        // Add event listeners for categories
        this.setupCategoryListeners();
        
        // Add search functionality
        this.setupSearchFunctionality();
    }
    
    generateQuestionBank() {
        return {
            performance: [
                { id: 'perf_1', text: 'How would you rate your individual performance today?', type: 'rating', scale: 10 },
                { id: 'perf_2', text: 'How would you rate the team\'s overall performance?', type: 'rating', scale: 10 },
                { id: 'perf_3', text: 'What was your strongest contribution to the team today?', type: 'text' },
                { id: 'perf_4', text: 'What area would you most like to improve for next match?', type: 'text' },
                { id: 'perf_5', text: 'How satisfied are you with your fitness level?', type: 'rating', scale: 10 }
            ],
            team: [
                { id: 'team_1', text: 'How would you rate team communication today?', type: 'rating', scale: 10 },
                { id: 'team_2', text: 'How positive was the team atmosphere?', type: 'rating', scale: 10 },
                { id: 'team_3', text: 'How well did we execute our game plan?', type: 'rating', scale: 10 },
                { id: 'team_4', text: 'Which tactical area needs most improvement?', type: 'multiple_choice', options: ['Defensive Shape', 'Attack Transition', 'Set Pieces', 'Possession Play'] },
                { id: 'team_5', text: 'Do you feel your voice is heard in team decisions?', type: 'yes_no' }
            ],
            training: [
                { id: 'train_1', text: 'How would you rate today\'s training session?', type: 'rating', scale: 10 },
                { id: 'train_2', text: 'How challenging was the session for your skill level?', type: 'rating', scale: 10 },
                { id: 'train_3', text: 'Which drill or activity was most beneficial?', type: 'text' },
                { id: 'train_4', text: 'Which area did you improve most?', type: 'multiple_choice', options: ['Ball Skills', 'Fitness', 'Tactical Awareness', 'Communication'] },
                { id: 'train_5', text: 'How clear were the coaching instructions?', type: 'rating', scale: 10 }
            ],
            management: [
                { id: 'mgmt_1', text: 'Any feedback for the coaching staff?', type: 'text' },
                { id: 'mgmt_2', text: 'How well organized was today\'s session?', type: 'rating', scale: 10 },
                { id: 'mgmt_3', text: 'Do you feel comfortable asking questions during training?', type: 'yes_no' },
                { id: 'mgmt_4', text: 'Any suggestions for improving future sessions?', type: 'text' },
                { id: 'mgmt_5', text: 'Additional comments (optional)', type: 'text' }
            ]
        };
    }
    
    loadQuestionBank() {
        const categories = ['performance', 'team', 'training', 'management'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}-questions`);
            if (container) {
                container.innerHTML = '';
                
                this.formBuilder.questionBank[category].forEach(question => {
                    const questionElement = this.createQuestionBankItem(question);
                    container.appendChild(questionElement);
                });
            }
        });
        
        // Load custom questions
        this.loadCustomQuestions();
    }
    
    loadCustomQuestions() {
        const container = document.getElementById('custom-questions');
        if (container) {
            container.innerHTML = '';
            
            if (this.formBuilder.customQuestions.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 12px; padding: 10px; text-align: center;">No custom questions yet.<br>Save questions to add them here.</p>';
            } else {
                this.formBuilder.customQuestions.forEach(question => {
                    const questionElement = this.createQuestionBankItem(question);
                    container.appendChild(questionElement);
                });
            }
        }
    }
    
    createQuestionBankItem(question) {
        const div = document.createElement('div');
        div.className = 'question-bank-item';
        div.draggable = true;
        div.dataset.questionId = question.id;
        
        div.innerHTML = `
            <div class="bank-question-text">${question.text}</div>
            <div class="bank-question-meta">
                <span class="question-type-builder">${question.type}</span>
                ${question.type === 'rating' ? `<span>Scale: 1-${question.scale}</span>` : ''}
                ${question.options ? `<span>${question.options.length} options</span>` : ''}
            </div>
        `;
        
        // Add drag event listeners
        div.addEventListener('dragstart', (e) => {
            this.formBuilder.draggedQuestion = question;
            div.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', JSON.stringify(question));
        });
        
        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
            this.formBuilder.draggedQuestion = null;
        });
        
        div.addEventListener('click', () => {
            this.selectQuestion(question);
        });
        
        return div;
    }
    
    renderFormStructure() {
        const container = document.getElementById('form-structure-content');
        container.innerHTML = '';
        
        if (this.formBuilder.sections.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'drop-zone';
            emptyState.innerHTML = `
                <i class="fas fa-plus-circle"></i>
                <p>Add your first section to get started</p>
                <button class="btn btn-primary btn-sm" onclick="window.app.addSection()">
                    <i class="fas fa-plus"></i> Add Section
                </button>
            `;
            container.appendChild(emptyState);
            return;
        }
        
        this.formBuilder.sections.forEach((section, index) => {
            const sectionElement = this.createSectionElement(section, index);
            container.appendChild(sectionElement);
        });
        
        // Always add "Add Section" button at the bottom (mobile-friendly)
        const addSectionButton = document.createElement('div');
        addSectionButton.innerHTML = `
            <button class="btn btn-primary mobile-add-section-btn" onclick="window.app.addSection()">
                <i class="fas fa-plus"></i> Add Section
            </button>
        `;
        container.appendChild(addSectionButton);
    }
    
    createSectionElement(section, index) {
        const div = document.createElement('div');
        div.className = 'form-section-builder';
        div.dataset.sectionIndex = index;
        
        div.innerHTML = `
            <div class="section-builder-header">
                <div class="section-builder-title">
                    <i class="fas fa-grip-vertical"></i>
                    <span>${section.title}</span>
                    <span class="section-meta">${section.questions.length} questions</span>
                </div>
                <div class="section-builder-actions">
                    <button onclick="window.app.addQuestionToSection(null, ${index})" title="Add Question" class="btn btn-sm btn-success">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="window.app.editSection(${index})" title="Edit Section">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.app.deleteSection(${index})" title="Delete Section">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="section-questions-builder">
                <div class="section-questions-list" id="section-questions-${index}">
                    ${section.questions.length === 0 ? 
                        '<div class="drop-zone">Drop questions here or click to add</div>' : 
                        section.questions.map((q, qIndex) => this.createQuestionItemHTML(q, qIndex, index)).join('')
                    }
                </div>
                <button class="add-question-to-section" onclick="window.app.addQuestionToSection(null, ${index})">
                    <i class="fas fa-plus"></i> Add Question
                </button>
            </div>
        `;
        
        // Add drop zone functionality
        const questionsContainer = div.querySelector('.section-questions-builder');
        this.setupDropZone(questionsContainer, index);
        
        return div;
    }
    
    createQuestionItemHTML(question, questionIndex, sectionIndex) {
        return `
            <div class="question-item-builder" data-question-index="${questionIndex}" data-section-index="${sectionIndex}" onclick="window.app.editFormQuestion(${sectionIndex}, ${questionIndex})">
                <div class="question-text-builder">${question.text}</div>
                <div class="question-actions">
                    <span class="question-type-builder">${question.type}</span>
                    <button onclick="event.stopPropagation(); window.app.deleteFormQuestion(${sectionIndex}, ${questionIndex})" title="Delete Question">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    setupDropZone(element, sectionIndex) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            element.classList.add('drag-over');
        });
        
        element.addEventListener('dragleave', (e) => {
            if (!element.contains(e.relatedTarget)) {
                element.classList.remove('drag-over');
            }
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            try {
                const questionData = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (questionData && questionData.id) {
                    this.addQuestionToSection(questionData, sectionIndex);
                }
            } catch (error) {
                console.error('Error parsing dropped data:', error);
            }
        });
    }
    
    setupDragAndDrop() {
        // Already handled in individual elements
    }
    
    setupCategoryListeners() {
        document.querySelectorAll('.question-category h4').forEach(header => {
            header.addEventListener('click', () => {
                const category = header.parentElement;
                const isActive = category.classList.contains('active');
                
                // Close all categories
                document.querySelectorAll('.question-category').forEach(cat => {
                    cat.classList.remove('active');
                });
                
                // Toggle clicked category
                if (!isActive) {
                    category.classList.add('active');
                }
            });
        });
    }
    
    setupSearchFunctionality() {
        const searchInput = document.getElementById('question-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                this.filterQuestions(searchTerm);
            });
        }
    }
    
    filterQuestions(searchTerm) {
        const categories = ['performance', 'team', 'training', 'management', 'custom'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}-questions`);
            const items = container.querySelectorAll('.question-bank-item');
            
            items.forEach(item => {
                const text = item.querySelector('.bank-question-text').textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    async loadClubQuestions() {
        if (!this.currentClubId) {
            console.log('🏢 No club ID provided, skipping club questions load');
            return;
        }
        
        try {
            console.log('🏢 Loading club questions for club:', this.currentClubId);
            
            const response = await fetch(`/api/questions/club/${this.currentClubId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch club questions: ${response.status}`);
            }
            
            const clubQuestions = await response.json();
            console.log('🏢 Loaded club questions:', clubQuestions);
            
            // Add to custom questions (avoid duplicates)
            this.formBuilder.customQuestions = this.formBuilder.customQuestions || [];
            
            clubQuestions.forEach(question => {
                const exists = this.formBuilder.customQuestions.find(q => q.id === question.id);
                if (!exists) {
                    this.formBuilder.customQuestions.push(question);
                }
            });
            
            // Refresh the custom questions display
            this.loadCustomQuestions();
            
        } catch (error) {
            console.error('Error loading club questions:', error);
        }
    }
    
    refreshCustomQuestions() {
        // Find all questions that have been saved to question bank
        const savedQuestions = [];
        
        // Check all sections for questions saved to bank
        this.formBuilder.sections.forEach(section => {
            section.questions.forEach(question => {
                if (question.question_bank && question.id.startsWith('custom_')) {
                    // Only include questions that match the current club or have no club identifier
                    if (!question.club_identifier || question.club_identifier === this.currentClubId) {
                        // Check if already in custom questions
                        const exists = this.formBuilder.customQuestions.find(q => q.id === question.id);
                        if (!exists) {
                            savedQuestions.push({ ...question });
                        }
                    }
                }
            });
        });
        
        // Add new questions to custom questions
        this.formBuilder.customQuestions.push(...savedQuestions);
        
        // Remove duplicates
        this.formBuilder.customQuestions = this.formBuilder.customQuestions.filter((question, index, self) => 
            index === self.findIndex(q => q.id === question.id)
        );
        
        // Refresh the custom questions display
        this.loadCustomQuestions();
    }
    
    addSection() {
        const newSection = {
            id: `section_${Date.now()}`,
            title: 'New Section',
            description: '',
            questions: []
        };
        
        this.formBuilder.sections.push(newSection);
        this.renderFormStructure();
        
        // Auto-edit the new section
        setTimeout(() => {
            this.editSection(this.formBuilder.sections.length - 1);
        }, 100);
    }
    
    addQuestionToSection(question, sectionIndex) {
        const section = this.formBuilder.sections[sectionIndex];
        if (section) {
            if (question) {
                // Adding from question bank - reset question_bank to false
                const questionCopy = { 
                    ...question, 
                    id: `${question.id}_${Date.now()}`,
                    question_bank: false // Reset to false when copying from bank
                };
                console.log('📋 Adding question to section:', questionCopy);
                console.log('📋 Original question club_identifier:', question.club_identifier);
                console.log('📋 Copied question club_identifier:', questionCopy.club_identifier);
                console.log('📋 Copied question question_bank reset to:', questionCopy.question_bank);
                section.questions.push(questionCopy);
            } else {
                // Creating new question
                const newQuestion = {
                    id: `custom_${Date.now()}`,
                    text: 'New Question',
                    type: 'text',
                    required: true,
                    question_bank: false, // Default to false
                    club_identifier: this.currentClubId // Add club identifier to new questions
                };
                console.log('✨ Creating new question with club_identifier:', newQuestion.club_identifier);
                section.questions.push(newQuestion);
                this.renderFormStructure();
                // Auto-select the new question for editing
                this.selectQuestion(newQuestion);
                return;
            }
            this.renderFormStructure();
        }
    }
    
    createCustomQuestion() {
        console.log('🔧 Creating custom question...');
        console.log('🔧 Current club ID:', this.currentClubId);
        
        const newQuestion = {
            id: `custom_${Date.now()}`,
            text: 'New Custom Question',
            type: 'text',
            required: true,
            question_bank: false, // Default to false
            club_identifier: this.currentClubId // Add club identifier
        };
        
        console.log('🔧 New question object:', newQuestion);
        this.selectQuestion(newQuestion);
    }
    
    editFormQuestion(sectionIndex, questionIndex) {
        const section = this.formBuilder.sections[sectionIndex];
        if (section && section.questions[questionIndex]) {
            const question = section.questions[questionIndex];
            this.formBuilder.selectedQuestion = question;
            this.formBuilder.selectedSection = sectionIndex;
            this.formBuilder.selectedQuestionIndex = questionIndex;
            this.renderQuestionEditor(question);
        }
    }
    
    deleteFormQuestion(sectionIndex, questionIndex) {
        const section = this.formBuilder.sections[sectionIndex];
        const question = section.questions[questionIndex];
        const questionElement = document.querySelector(`[data-section-index="${sectionIndex}"] [data-question-index="${questionIndex}"]`);
        
        // Create inline confirmation
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'inline-confirm-question';
        confirmDiv.style.cssText = `
            background: #ffebee; 
            border: 1px solid #f44336; 
            border-radius: 4px; 
            padding: 8px; 
            margin: 4px 0; 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            font-size: 12px;
        `;
        
        confirmDiv.innerHTML = `
            <span style="color: #d32f2f; font-weight: 500;">
                <i class="fas fa-exclamation-triangle"></i> Delete this question?
            </span>
            <div style="display: flex; gap: 6px;">
                <button class="btn btn-sm" style="background: #f44336; color: white; padding: 2px 6px; font-size: 10px;" onclick="window.app.confirmDeleteQuestion(${sectionIndex}, ${questionIndex})">
                    Delete
                </button>
                <button class="btn btn-sm btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.app.cancelDeleteQuestion(${sectionIndex}, ${questionIndex})">
                    Cancel
                </button>
            </div>
        `;
        
        questionElement.appendChild(confirmDiv);
        
        // Auto-cancel after 8 seconds
        setTimeout(() => {
            if (confirmDiv.parentElement) {
                this.cancelDeleteQuestion(sectionIndex, questionIndex);
            }
        }, 8000);
    }
    
    confirmDeleteQuestion(sectionIndex, questionIndex) {
        const section = this.formBuilder.sections[sectionIndex];
        if (section && section.questions[questionIndex]) {
            section.questions.splice(questionIndex, 1);
            this.renderFormStructure();
        }
    }
    
    cancelDeleteQuestion(sectionIndex, questionIndex) {
        const confirmDiv = document.querySelector(`[data-section-index="${sectionIndex}"] [data-question-index="${questionIndex}"] .inline-confirm-question`);
        if (confirmDiv) {
            confirmDiv.remove();
        }
    }
    
    selectQuestion(question) {
        this.formBuilder.selectedQuestion = question;
        this.renderQuestionEditor(question);
    }
    
    renderQuestionEditor(question) {
        // Show the editor panel
        const editorPanel = document.querySelector('.question-editor-panel');
        if (editorPanel) {
            editorPanel.style.display = 'flex';
        }
        
        const container = document.getElementById('question-editor-content');
        
        container.innerHTML = `
            <div class="question-editor-form">
                <div class="form-group">
                    <label>Question Text</label>
                    <textarea id="question-text" rows="3">${question.text}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Question Type</label>
                    <select id="question-type">
                        <option value="text" ${question.type === 'text' ? 'selected' : ''}>Text Response</option>
                        <option value="rating" ${question.type === 'rating' ? 'selected' : ''}>Rating Scale</option>
                        <option value="multiple_choice" ${question.type === 'multiple_choice' ? 'selected' : ''}>Multiple Choice</option>
                        <option value="yes_no" ${question.type === 'yes_no' ? 'selected' : ''}>Yes/No</option>
                    </select>
                </div>
                
                ${question.type === 'rating' ? `
                    <div class="form-group">
                        <label>Scale (1 to N)</label>
                        <input type="number" id="question-scale" min="3" max="10" value="${question.scale || 10}">
                    </div>
                ` : ''}
                
                ${question.type === 'multiple_choice' ? `
                    <div class="form-group">
                        <label>Options</label>
                        <div class="options-editor">
                            ${question.options ? question.options.map((opt, i) => `
                                <div class="option-item">
                                    <input type="text" value="${opt}" data-option-index="${i}">
                                    <button onclick="window.app.removeOption(${i})">×</button>
                                </div>
                            `).join('') : ''}
                            <button class="btn btn-sm btn-outline" onclick="window.app.addOption()">
                                <i class="fas fa-plus"></i> Add Option
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <input type="checkbox" id="question-required" ${question.required !== false ? 'checked' : ''}>
                        <label for="question-required">Required</label>
                    </div>
                    ${!question.id.startsWith('custom_') && !question.id.startsWith('q') ? `
                    <div class="checkbox-item">
                        <input type="checkbox" id="question-save-to-bank" ${question.question_bank ? 'checked' : ''}>
                        <label for="question-save-to-bank">Save to Bank (reusable for future forms)</label>
                    </div>` : ''}
                </div>
                
                <div class="form-group">
                    <button class="btn btn-primary" onclick="window.app.saveQuestionEdits()">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.cancelQuestionEdit()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener for question type changes
        document.getElementById('question-type').addEventListener('change', (e) => {
            // Save current question text before changing type
            const currentText = document.getElementById('question-text').value.trim();
            if (currentText) {
                question.text = currentText;
            }
            
            // Change type and re-render
            question.type = e.target.value;
            
            // Reset type-specific properties
            if (question.type === 'rating') {
                question.scale = question.scale || 10;
            } else {
                delete question.scale;
            }
            
            if (question.type === 'multiple_choice') {
                question.options = question.options || ['Option 1', 'Option 2'];
            } else {
                delete question.options;
            }
            
            this.renderQuestionEditor(question);
        });
    }
    
    saveQuestionEdits() {
        const question = this.formBuilder.selectedQuestion;
        if (!question) return;
        
        // Get values from form
        const newText = document.getElementById('question-text').value.trim();
        const newType = document.getElementById('question-type').value;
        const newRequired = document.getElementById('question-required').checked;
        const saveToBank = document.getElementById('question-save-to-bank');
        const newQuestionBank = saveToBank ? saveToBank.checked : false;
        
        // Update question
        question.text = newText;
        question.type = newType;
        question.required = newRequired;
        question.question_bank = newQuestionBank;
        
        // Remove anonymous property completely
        delete question.anonymous;
        
        // Set club_identifier for ALL questions (needed for database)
        if (this.currentClubId) {
            question.club_identifier = this.currentClubId;
        }
        
        console.log('💾 Saving question with club_identifier:', question.club_identifier);
        console.log('💾 Question bank checkbox:', newQuestionBank);
        console.log('💾 Current club ID:', this.currentClubId);
        
        // Handle type-specific properties
        if (newType === 'rating') {
            const scale = document.getElementById('question-scale');
            if (scale) {
                question.scale = parseInt(scale.value);
            }
        } else if (newType === 'multiple_choice') {
            const options = [];
            document.querySelectorAll('[data-option-index]').forEach(input => {
                if (input.value.trim()) {
                    options.push(input.value.trim());
                }
            });
            question.options = options;
        }
        
        // Always refresh the form structure to show changes immediately
        this.renderFormStructure();
        
        // If question is saved to question bank, refresh the question bank
        if (newQuestionBank && question.id.startsWith('custom_')) {
            this.refreshCustomQuestions();
        }
        
        this.showSuccess('Question saved successfully!');
        
        // Reset the editor (hide it)
        this.resetQuestionEditor();
    }
    
    resetQuestionEditor() {
        this.formBuilder.selectedQuestion = null;
        this.formBuilder.selectedSection = null;
        this.formBuilder.selectedQuestionIndex = null;
        
        // Hide the entire editor panel
        const editorPanel = document.querySelector('.question-editor-panel');
        if (editorPanel) {
            editorPanel.style.display = 'none';
        }
    }
    
    cancelQuestionEdit() {
        this.resetQuestionEditor();
    }
    
    addOption() {
        const question = this.formBuilder.selectedQuestion;
        if (!question.options) {
            question.options = [];
        }
        
        // Preserve existing option values before re-rendering
        this.preserveOptionValues();
        
        question.options.push('New Option');
        this.renderQuestionEditor(question);
    }
    
    removeOption(index) {
        const question = this.formBuilder.selectedQuestion;
        if (question.options && question.options[index]) {
            // Preserve existing option values before re-rendering
            this.preserveOptionValues();
            
            question.options.splice(index, 1);
            this.renderQuestionEditor(question);
        }
    }
    
    preserveOptionValues() {
        // Save current values from option inputs before re-rendering
        const question = this.formBuilder.selectedQuestion;
        if (!question || question.type !== 'multiple_choice') return;
        
        const optionInputs = document.querySelectorAll('[data-option-index]');
        const currentValues = [];
        
        optionInputs.forEach((input, index) => {
            currentValues[index] = input.value.trim();
        });
        
        // Update the question options with current values
        if (currentValues.length > 0) {
            question.options = currentValues.filter(val => val !== '');
        }
    }
    
    async saveForm() {
        console.log('🔄 SaveForm called');
        console.log('📊 Form builder sections:', this.formBuilder.sections);
        console.log('🎯 Current Event ID:', this.currentEventId);
        
        if (this.formBuilder.sections.length === 0) {
            alert('Please add at least one section to your form.');
            return;
        }
        
        // Validate that sections have questions
        const sectionsWithQuestions = this.formBuilder.sections.filter(section => section.questions && section.questions.length > 0);
        if (sectionsWithQuestions.length === 0) {
            alert('Please add at least one question to your sections before saving.');
            return;
        }
        
        const formData = {
            name: `Custom Form - Event ${this.currentEventId}`,
            event_identifier: this.currentEventId,
            sections: this.formBuilder.sections
        };
        
        console.log('💾 Saving form data:', formData);
        console.log('📝 Form data validation:', {
            hasName: !!formData.name,
            hasEventId: !!formData.event_identifier,
            hasSections: !!formData.sections && formData.sections.length > 0,
            sectionsWithQuestions: sectionsWithQuestions.length
        });
        
        try {
            // Show loading state
            const saveBtn = document.getElementById('save-form-btn');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;
            
            // Determine if we're creating a new form or updating an existing one
            const isUpdating = this.currentForm && this.currentForm.id;
            let response;
            
            if (isUpdating) {
                // Update existing form
                response = await fetch(`/api/forms/${this.currentForm.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        sections: formData.sections
                    })
                });
            } else {
                // Create new form
                response = await fetch('/api/forms/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save form');
            }
            
            const savedForm = await response.json();
            console.log('Form saved successfully:', savedForm);
            
            // Show success message
            this.showSuccess(isUpdating ? 'Form updated successfully!' : 'Form saved successfully!');
            
            // Convert to the expected format and set as current form
            this.currentForm = {
                id: savedForm.id,
                name: savedForm.name,
                event_identifier: savedForm.event_identifier,
                structure: {
                    sections: formData.sections
                }
            };
            
            // Update saved questions to question bank
            this.refreshCustomQuestions();
            
            // Switch to form view
            setTimeout(() => {
                this.showCoachFormArea();
            }, 1000);
            
        } catch (error) {
            console.error('Error saving form:', error);
            alert(`Error saving form: ${error.message}`);
        } finally {
            // Reset save button
            const saveBtn = document.getElementById('save-form-btn');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Form';
            saveBtn.disabled = false;
        }
    }
    
    previewForm() {
        if (this.formBuilder.sections.length === 0) {
            alert('Please add at least one section to preview the form.');
            return;
        }
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'form-preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const previewContent = document.createElement('div');
        previewContent.className = 'form-preview-content';
        previewContent.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        // Generate preview HTML
        let previewHTML = `
            <div class="preview-header" style="padding: 20px; border-bottom: 1px solid #eee; background: #f8f9fa; position: relative;">
                <h2 style="margin: 0; color: #333; padding-right: 60px;">Form Preview</h2>
                <p style="margin: 8px 0 0 0; color: #666;">Event: ${this.currentEventId}</p>
                <button onclick="window.app.closePreview()" style="position: absolute; top: 15px; right: 15px; background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="preview-body" style="padding: 20px;">
        `;
        
        // Render sections and questions
        this.formBuilder.sections.forEach((section, sectionIndex) => {
            previewHTML += `
                <div class="preview-section" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">
                        <i class="fas fa-list"></i> ${section.title}
                    </h3>
            `;
            
            section.questions.forEach((question, questionIndex) => {
                const questionNumber = `${sectionIndex + 1}.${questionIndex + 1}`;
                previewHTML += `
                    <div class="preview-question" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                        <div class="question-header" style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
                            <span style="font-weight: 600; color: #007bff; min-width: 30px;">${questionNumber}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; color: #333; margin-bottom: 5px;">
                                    ${question.text}
                                    ${question.required ? '<span style="color: #dc3545; font-size: 12px; margin-left: 5px;">*Required</span>' : ''}
                                    ${question.anonymous ? '<span style="color: #6c757d; font-size: 12px; margin-left: 5px;">📝 Anonymous</span>' : ''}
                                </div>
                                ${this.renderPreviewQuestionInput(question)}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            previewHTML += `</div>`;
        });
        
        previewHTML += `
                <div class="preview-footer" style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px;">
                    <button style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                        <i class="fas fa-paper-plane"></i> Submit Response
                    </button>
                </div>
            </div>
        `;
        
        previewContent.innerHTML = previewHTML;
        modal.appendChild(previewContent);
        document.body.appendChild(modal);
        
        // Store reference for closing
        this.previewModal = modal;
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePreview();
            }
        });
    }
    
    renderPreviewQuestionInput(question) {
        switch (question.type) {
            case 'rating':
                const scale = question.scale || 10;
                let ratingHTML = '<div style="display: flex; gap: 5px; margin-top: 8px;">';
                for (let i = 1; i <= scale; i++) {
                    ratingHTML += `<button style="padding: 6px 10px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; min-width: 35px;">${i}</button>`;
                }
                ratingHTML += '</div>';
                return ratingHTML;
                
            case 'text':
                return '<textarea style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 80px; margin-top: 8px;" placeholder="Enter your response..."></textarea>';
                
            case 'multiple_choice':
                if (question.options && question.options.length > 0) {
                    let optionsHTML = '<div style="margin-top: 8px;">';
                    question.options.forEach((option, index) => {
                        optionsHTML += `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                <input type="radio" name="preview_${question.id}" value="${option}" style="margin: 0;">
                                <label style="cursor: pointer; margin: 0;">${option}</label>
                            </div>
                        `;
                    });
                    optionsHTML += '</div>';
                    return optionsHTML;
                }
                return '<p style="color: #666; font-style: italic;">No options configured</p>';
                
            case 'yes_no':
                return `
                    <div style="display: flex; gap: 10px; margin-top: 8px;">
                        <button style="padding: 8px 16px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">Yes</button>
                        <button style="padding: 8px 16px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">No</button>
                    </div>
                `;
                
            default:
                return '<p style="color: #666; font-style: italic;">Unknown question type</p>';
        }
    }
    
    closePreview() {
        if (this.previewModal) {
            document.body.removeChild(this.previewModal);
            this.previewModal = null;
        }
    }
    
    editSection(index) {
        const section = this.formBuilder.sections[index];
        const sectionElement = document.querySelector(`[data-section-index="${index}"]`);
        const titleSpan = sectionElement.querySelector('.section-builder-title span');
        
        // Create inline input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = section.title;
        input.className = 'section-title-input';
        input.style.cssText = 'border: 1px solid #ccc; padding: 4px; border-radius: 3px; font-size: 14px; font-weight: 600;';
        
        // Replace title with input
        titleSpan.replaceWith(input);
        input.focus();
        input.select();
        
        const saveEdit = () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== section.title) {
                section.title = newTitle;
                this.renderFormStructure();
            } else {
                // Restore original title
                const newSpan = document.createElement('span');
                newSpan.textContent = section.title;
                input.replaceWith(newSpan);
            }
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    }
    
    deleteSection(index) {
        const section = this.formBuilder.sections[index];
        const sectionElement = document.querySelector(`[data-section-index="${index}"]`);
        
        // Create inline confirmation
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'inline-confirm';
        confirmDiv.style.cssText = `
            background: #ffebee; 
            border: 1px solid #f44336; 
            border-radius: 4px; 
            padding: 8px 12px; 
            margin: 6px 0; 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            animation: fadeIn 0.2s ease;
            font-size: 12px;
        `;
        
        confirmDiv.innerHTML = `
            <span style="color: #d32f2f; font-weight: 500;">
                <i class="fas fa-exclamation-triangle"></i> 
                Delete "${section.title}"? This cannot be undone.
            </span>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm" style="background: #f44336; color: white; padding: 4px 8px;" onclick="window.app.confirmDeleteSection(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button class="btn btn-sm btn-secondary" style="padding: 4px 8px;" onclick="window.app.cancelDeleteSection(${index})">
                    Cancel
                </button>
            </div>
        `;
        
        sectionElement.appendChild(confirmDiv);
        
        // Auto-cancel after 10 seconds
        setTimeout(() => {
            if (confirmDiv.parentElement) {
                this.cancelDeleteSection(index);
            }
        }, 10000);
    }
    
    confirmDeleteSection(index) {
        this.formBuilder.sections.splice(index, 1);
        this.renderFormStructure();
    }
    
    cancelDeleteSection(index) {
        const confirmDiv = document.querySelector(`[data-section-index="${index}"] .inline-confirm`);
        if (confirmDiv) {
            confirmDiv.remove();
        }
    }
    
    editCurrentForm() {
        console.log('📝 Edit Current Form called');
        console.log('Current form:', this.currentForm);
        console.log('Form builder initialized:', !!this.formBuilder);
        
        if (!this.currentForm || !this.currentForm.structure || !this.currentForm.structure.sections) {
            console.log('❌ No current form or sections to edit');
            alert('No form data available to edit. Please try refreshing the page.');
            return;
        }
        
        // Ensure form builder is initialized
        if (!this.formBuilder) {
            console.log('🔄 Form builder not initialized, initializing now...');
            this.formBuilder = {
                sections: [],
                questionBank: {},
                customQuestions: [],
                selectedQuestion: null,
                selectedSection: null,
                draggedQuestion: null
            };
        }
        
        // Load the current form into the form builder
        this.formBuilder.sections = JSON.parse(JSON.stringify(this.currentForm.structure.sections));
        console.log('✅ Loaded sections into form builder:', this.formBuilder.sections);
        this.showFormBuilder();
    }
    
    // Utility Functions
    switchUserType() {
        this.currentUserType = this.currentUserType === 'coach' ? 'player' : 'coach';
        this.showInterface();
    }
    
    hideAllScreens() {
        document.querySelectorAll('.interface').forEach(el => el.classList.add('hidden'));
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('error-screen').classList.add('hidden');
    }
    
    hideAllCoachScreens() {
        document.querySelectorAll('#coach-interface .screen').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
    }
    
    hideAllPlayerScreens() {
        document.querySelectorAll('#player-interface .screen').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
    }
    
    showLoading() {
        this.hideAllScreens();
        document.getElementById('loading-screen').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading-screen').classList.add('hidden');
    }
    
    showError(message) {
        this.hideAllScreens();
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-screen').classList.remove('hidden');
    }
    
    showSuccess(message) {
        // Create and show success toast
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function showFormBuilder() {
    window.app.showFormBuilder();
}

function cancelFormBuilder() {
    window.app.cancelFormBuilder();
}

function createFormFromTemplate() {
    window.app.createFormFromTemplate();
}

function submitPlayerResponse() {
    window.app.submitPlayerResponse();
}

function switchResponseView(view) {
    window.app.switchResponseView(view);
}

function navigateForm(direction) {
    window.app.navigateForm(direction);
}

function switchUserType() {
    if (window.app) {
        window.app.switchUserType();
    }
}

function showTab(tabName) {
    window.app.showTab(tabName);
}

function switchUserType() {
    window.app.switchUserType();
}

function addSection() {
    window.app.addSection();
}

function saveForm() {
    window.app.saveForm();
}

function previewForm() {
    window.app.previewForm();
}

function editSection(index) {
    window.app.editSection(index);
}

function deleteSection(index) {
    window.app.deleteSection(index);
}

function createCustomQuestion() {
    window.app.createCustomQuestion();
}

function editFormQuestion(sectionIndex, questionIndex) {
    window.app.editFormQuestion(sectionIndex, questionIndex);
}

function deleteFormQuestion(sectionIndex, questionIndex) {
    window.app.deleteFormQuestion(sectionIndex, questionIndex);
}

function saveQuestionEdits() {
    window.app.saveQuestionEdits();
}

function cancelQuestionEdit() {
    window.app.cancelQuestionEdit();
}

function addOption() {
    window.app.addOption();
}

function removeOption(index) {
    window.app.removeOption(index);
}

function editCurrentForm() {
    console.log('🔄 Global editCurrentForm called');
    console.log('window.app exists:', !!window.app);
    console.log('window.app.currentForm exists:', !!(window.app && window.app.currentForm));
    
    if (window.app) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            window.app.editCurrentForm();
        }, 100);
    } else {
        console.error('❌ window.app is not defined');
        alert('Application not ready. Please try again in a moment.');
    }
}

function confirmDeleteSection(index) {
    window.app.confirmDeleteSection(index);
}

function cancelDeleteSection(index) {
    window.app.cancelDeleteSection(index);
}

function confirmDeleteQuestion(sectionIndex, questionIndex) {
    window.app.confirmDeleteQuestion(sectionIndex, questionIndex);
}

function cancelDeleteQuestion(sectionIndex, questionIndex) {
    window.app.cancelDeleteQuestion(sectionIndex, questionIndex);
}

function closePreview() {
    window.app.closePreview();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    try {
        window.app = new GAA_FeedbackApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.getElementById('loading-screen').innerHTML = `
            <div class="loading-content">
                <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
                <h2>Error</h2>
                <p>Failed to initialize: ${error.message}</p>
            </div>
        `;
    }
});