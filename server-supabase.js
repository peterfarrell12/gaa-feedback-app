const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3009;


// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Load plugin code
function loadPluginCode() {
    try {
        return fs.readFileSync(path.join(__dirname, 'feedback-system.js'), 'utf8');
    } catch (error) {
        console.log('Plugin file not found, using fallback');
        return 'Plugin code not loaded';
    }
}

// API Routes using Supabase

// Get all data (for initial load)
app.get('/api/data', async (req, res) => {
    try {
        const [usersRes, templatesRes, formsRes] = await Promise.all([
            supabase.from('users').select('*').order('created_at', { ascending: false }),
            supabase.from('templates').select('*').order('created_at', { ascending: false }),
            supabase.from('forms').select('*').order('created_at', { ascending: false })
        ]);

        const data = {
            users: usersRes.data || [],
            templates: templatesRes.data || [],
            forms: formsRes.data || []
        };

        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Get templates with their structure
app.get('/api/templates', async (req, res) => {
    try {
        console.log('Fetching templates from Supabase...');
        
        // First, get just the templates
        const { data: templates, error: templatesError } = await supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (templatesError) {
            console.error('Error fetching templates:', templatesError);
            throw templatesError;
        }

        console.log(`Found ${templates.length} templates`);

        // For each template, get its sections and questions
        const transformedTemplates = [];
        
        for (const template of templates) {
            console.log(`Processing template: ${template.name}`);
            
            // Get sections for this template
            const { data: sections, error: sectionsError } = await supabase
                .from('sections')
                .select('*')
                .eq('template_id', template.id)
                .is('form_id', null)
                .order('order_index');

            if (sectionsError) {
                console.error('Error fetching sections:', sectionsError);
                continue;
            }

            console.log(`Found ${sections.length} sections for template ${template.name}`);

            // Get questions for each section
            const sectionsWithQuestions = [];
            for (const section of sections) {
                const { data: questions, error: questionsError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('section_id', section.id)
                    .order('order_index');

                if (questionsError) {
                    console.error('Error fetching questions:', questionsError);
                    continue;
                }

                console.log(`Found ${questions.length} questions for section ${section.title}`);

                sectionsWithQuestions.push({
                    title: section.title,
                    questions: questions.map(q => ({
                        id: q.id,
                        type: q.question_type,
                        text: q.question_text,
                        scale: q.scale,
                        options: q.options
                    }))
                });
            }

            const totalQuestions = sectionsWithQuestions.reduce((total, section) => total + section.questions.length, 0);

            transformedTemplates.push({
                id: template.id,
                name: template.name,
                description: template.description,
                type: template.type,
                sections: sectionsWithQuestions.length,
                questions: totalQuestions,
                estimatedTime: template.estimated_time,
                icon: template.icon,
                structure: {
                    sections: sectionsWithQuestions
                }
            });
        }

        console.log(`Returning ${transformedTemplates.length} transformed templates`);
        res.json(transformedTemplates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates', details: error.message });
    }
});

// Get forms by event-id (simplified - no events table)
app.get('/api/forms', async (req, res) => {
    try {
        const { event_id } = req.query;
        
        if (!event_id) {
            return res.status(400).json({ error: 'event_id is required' });
        }

        // Get forms for this event_identifier
        let forms = [];
        let formsError = null;
        
        try {
            const { data: formsData, error: fetchError } = await supabase
                .from('forms')
                .select(`
                    *,
                    sections (
                        id,
                        title,
                        description,
                        order_index,
                        questions (
                            id,
                            question_text,
                            question_type,
                            options,
                            scale,
                            required,
                            order_index
                        )
                    )
                `)
                .eq('event_identifier', event_id)
                .eq('status', 'active');
            
            forms = formsData;
            formsError = fetchError;
        } catch (error) {
            // If event_identifier column doesn't exist, return all forms for now
            if (error.message && (error.message.includes('event_identifier') || error.code === '42703')) {
                console.log('⚠️ event_identifier column not found, returning all forms');
                
                const { data: formsData, error: fetchError } = await supabase
                    .from('forms')
                    .select(`
                        *,
                        sections (
                            id,
                            title,
                            description,
                            order_index,
                            questions (
                                id,
                                question_text,
                                question_type,
                                options,
                                scale,
                                required,
                                order_index,
                                club_identifier,
                                anonymous,
                                question_bank
                            )
                        )
                    `)
                    .eq('status', 'active')
                    .limit(5);
                
                forms = formsData;
                formsError = fetchError;
            } else {
                throw error;
            }
        }

        if (formsError) {
            throw formsError;
        }

        // Transform form data to include structure
        const transformedForms = forms.map(form => ({
            id: form.id,
            name: form.name,
            event_identifier: form.event_identifier,
            template_id: form.template_id,
            status: form.status,
            created_at: form.created_at,
            allow_anonymous: form.allow_anonymous,
            estimated_time: form.estimated_time,
            structure: {
                sections: form.sections.map(section => ({
                    title: section.title,
                    questions: section.questions.map(q => ({
                        id: q.id,
                        type: q.question_type,
                        text: q.question_text,
                        scale: q.scale,
                        options: q.options
                    }))
                }))
            }
        }));

        res.json(transformedForms);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ error: 'Failed to fetch forms', details: error.message });
    }
});

// Create form from template
app.post('/api/forms/create', async (req, res) => {
    try {
        const { templateId, eventId, customizations = {} } = req.body;

        // Get template with sections and questions
        const { data: template, error: templateError } = await supabase
            .from('templates')
            .select(`
                *,
                sections (
                    id,
                    title,
                    description,
                    order_index,
                    questions (
                        id,
                        question_text,
                        question_type,
                        options,
                        scale,
                        required,
                        order_index
                    )
                )
            `)
            .eq('id', templateId)
            .single();

        if (templateError) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Create form (simplified - no events table lookup)
        let form = null;
        let formError = null;
        
        try {
            const { data: formData, error: insertError } = await supabase
                .from('forms')
                .insert({
                    name: customizations.name || `${template.name} - Event ${eventId}`,
                    template_id: templateId,
                    event_identifier: eventId,
                    created_by: customizations.created_by || null,
                    status: 'active',
                    allow_anonymous: customizations.allow_anonymous !== undefined ? customizations.allow_anonymous : true,
                    estimated_time: template.estimated_time
                })
                .select()
                .single();
            
            form = formData;
            formError = insertError;
        } catch (error) {
            // If event_identifier column doesn't exist, create form without it for now
            if (error.message && (error.message.includes('event_identifier') || error.code === 'PGRST204')) {
                console.log('⚠️ event_identifier column not found, creating form without it');
                
                const { data: formData, error: insertError } = await supabase
                    .from('forms')
                    .insert({
                        name: customizations.name || `${template.name} - Event ${eventId}`,
                        template_id: templateId,
                        created_by: customizations.created_by || null,
                        status: 'active',
                        allow_anonymous: customizations.allow_anonymous !== undefined ? customizations.allow_anonymous : true,
                        estimated_time: template.estimated_time
                    })
                    .select()
                    .single();
                
                form = formData;
                formError = insertError;
            } else {
                throw error;
            }
        }

        if (formError) {
            throw formError;
        }

        // Create sections for this form
        for (const templateSection of template.sections) {
            const { data: section, error: sectionError } = await supabase
                .from('sections')
                .insert({
                    form_id: form.id,
                    title: templateSection.title,
                    description: templateSection.description,
                    order_index: templateSection.order_index
                })
                .select()
                .single();

            if (sectionError) {
                throw sectionError;
            }

            // Create questions for this section
            for (const templateQuestion of templateSection.questions) {
                const { error: questionError } = await supabase
                    .from('questions')
                    .insert({
                        section_id: section.id,
                        question_text: templateQuestion.question_text,
                        question_type: templateQuestion.question_type,
                        options: templateQuestion.options,
                        scale: templateQuestion.scale,
                        required: templateQuestion.required,
                        order_index: templateQuestion.order_index
                    });

                if (questionError) {
                    throw questionError;
                }
            }
        }

        res.json(form);
    } catch (error) {
        console.error('Error creating form:', error);
        res.status(500).json({ error: 'Failed to create form' });
    }
});

// Save custom form
app.post('/api/forms/save', async (req, res) => {
    try {
        const { name, event_identifier, sections } = req.body;
        
        if (!name || !event_identifier || !sections || sections.length === 0) {
            return res.status(400).json({ error: 'Missing required fields: name, event_identifier, and sections' });
        }
        
        // Create form record
        const { data: form, error: formError } = await supabase
            .from('forms')
            .insert({
                name,
                event_identifier,
                template_id: null, // This is a custom form
                created_by: null,
                status: 'active',
                allow_anonymous: true,
                estimated_time: `${Math.ceil(sections.reduce((total, section) => total + section.questions.length, 0) * 0.5)} min`
            })
            .select()
            .single();

        if (formError) {
            throw formError;
        }

        // Create sections and questions
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const sectionData = sections[sectionIndex];
            
            const { data: section, error: sectionError } = await supabase
                .from('sections')
                .insert({
                    form_id: form.id,
                    title: sectionData.title,
                    description: sectionData.description || null,
                    order_index: sectionIndex
                })
                .select()
                .single();

            if (sectionError) {
                throw sectionError;
            }

            // Create questions for this section
            for (let questionIndex = 0; questionIndex < sectionData.questions.length; questionIndex++) {
                const questionData = sectionData.questions[questionIndex];
                
                const { error: questionError } = await supabase
                    .from('questions')
                    .insert({
                        section_id: section.id,
                        question_text: questionData.text,
                        question_type: questionData.type,
                        options: questionData.options || null,
                        scale: questionData.scale || null,
                        required: questionData.required || false,
                        order_index: questionIndex,
                        club_identifier: questionData.club_identifier || null,
                        anonymous: questionData.anonymous || false,
                        question_bank: questionData.question_bank || false
                    });

                if (questionError) {
                    throw questionError;
                }
            }
        }

        res.json(form);
    } catch (error) {
        console.error('Error saving custom form:', error);
        res.status(500).json({ error: 'Failed to save custom form', details: error.message });
    }
});

// Update existing form
app.put('/api/forms/:formId', async (req, res) => {
    try {
        const { formId } = req.params;
        const { name, sections } = req.body;
        
        if (!name || !sections || sections.length === 0) {
            return res.status(400).json({ error: 'Missing required fields: name and sections' });
        }
        
        // Update form record
        const { data: form, error: formError } = await supabase
            .from('forms')
            .update({
                name,
                estimated_time: `${Math.ceil(sections.reduce((total, section) => total + section.questions.length, 0) * 0.5)} min`,
                updated_at: new Date().toISOString()
            })
            .eq('id', formId)
            .select()
            .single();

        if (formError) {
            throw formError;
        }

        // Delete existing sections and questions
        const { error: deleteError } = await supabase
            .from('sections')
            .delete()
            .eq('form_id', formId);

        if (deleteError) {
            throw deleteError;
        }

        // Create new sections and questions
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const sectionData = sections[sectionIndex];
            
            const { data: section, error: sectionError } = await supabase
                .from('sections')
                .insert({
                    form_id: formId,
                    title: sectionData.title,
                    description: sectionData.description || null,
                    order_index: sectionIndex
                })
                .select()
                .single();

            if (sectionError) {
                throw sectionError;
            }

            // Create questions for this section
            for (let questionIndex = 0; questionIndex < sectionData.questions.length; questionIndex++) {
                const questionData = sectionData.questions[questionIndex];
                
                const { error: questionError } = await supabase
                    .from('questions')
                    .insert({
                        section_id: section.id,
                        question_text: questionData.text,
                        question_type: questionData.type,
                        options: questionData.options || null,
                        scale: questionData.scale || null,
                        required: questionData.required || false,
                        order_index: questionIndex,
                        club_identifier: questionData.club_identifier || null,
                        anonymous: questionData.anonymous || false,
                        question_bank: questionData.question_bank || false
                    });

                if (questionError) {
                    throw questionError;
                }
            }
        }

        res.json(form);
    } catch (error) {
        console.error('Error updating form:', error);
        res.status(500).json({ error: 'Failed to update form', details: error.message });
    }
});

// Get club-specific questions for question bank
app.get('/api/questions/club/:clubId', async (req, res) => {
    try {
        const { clubId } = req.params;
        
        if (!clubId) {
            return res.status(400).json({ error: 'Club ID is required' });
        }

        // Fetch questions that are marked as question_bank and belong to this club
        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .eq('club_identifier', clubId)
            .eq('question_bank', true);

        if (error) {
            throw error;
        }

        // Transform questions to match the expected format
        const transformedQuestions = questions.map(q => ({
            id: q.id,
            text: q.question_text,
            type: q.question_type,
            scale: q.scale,
            options: q.options,
            required: q.required,
            anonymous: q.anonymous,
            question_bank: q.question_bank,
            club_identifier: q.club_identifier
        }));

        res.json(transformedQuestions);
    } catch (error) {
        console.error('Error fetching club questions:', error);
        res.status(500).json({ error: 'Failed to fetch club questions', details: error.message });
    }
});

// Submit response (create new or update existing)
app.post('/api/responses/submit', async (req, res) => {
    try {
        const { formId, userId, responses, completionTimeSeconds, eventId, clubId, isUpdate = false } = req.body;

        console.log('Received response submission:', {
            formId,
            userId,
            responses,
            completionTimeSeconds,
            eventId,
            clubId,
            isUpdate,
            responseCount: Object.keys(responses || {}).length
        });

        if (!formId || !responses || Object.keys(responses).length === 0) {
            return res.status(400).json({ error: 'Missing formId or responses' });
        }

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        let response;
        
        if (isUpdate) {
            // Update existing response
            console.log('Updating existing response for user:', userId);
            
            const { data: existingResponse, error: findError } = await supabase
                .from('responses')
                .select('id')
                .eq('form_id', formId)
                .eq('user_id', String(userId))
                .single();
                
            if (findError || !existingResponse) {
                return res.status(404).json({ error: 'Existing response not found for update' });
            }
            
            // Update the response record
            const { data: updatedResponse, error: updateError } = await supabase
                .from('responses')
                .update({
                    completion_time_seconds: completionTimeSeconds || 0
                })
                .eq('id', existingResponse.id)
                .select()
                .single();
                
            if (updateError) {
                console.error('Error updating response record:', updateError);
                throw updateError;
            }
            
            response = updatedResponse;
            
            // Delete existing question responses
            const { error: deleteError } = await supabase
                .from('question_responses')
                .delete()
                .eq('response_id', response.id);
                
            if (deleteError) {
                console.error('Error deleting old question responses:', deleteError);
                throw deleteError;
            }
            
        } else {
            // Create new response record
            console.log('Creating new response with user_id:', userId, 'type:', typeof userId);
            
            const { data: newResponse, error: responseError } = await supabase
                .from('responses')
                .insert({
                    form_id: formId,
                    user_id: String(userId), // Ensure it's a string
                    is_anonymous: false,
                    completion_time_seconds: completionTimeSeconds || 0
                })
                .select()
                .single();
                
            if (responseError) {
                console.error('Error creating response record:', responseError);
                console.error('Response error details:', {
                    message: responseError.message,
                    details: responseError.details,
                    hint: responseError.hint,
                    code: responseError.code
                });
                
                // Check if it's a UUID format error for user_id
                if (responseError.message && responseError.message.includes('invalid input syntax for type uuid')) {
                    return res.status(500).json({ 
                        error: 'Database schema issue: user_id column is set to UUID type but should be TEXT', 
                        details: 'The user_id column in the responses table needs to be changed from UUID to TEXT type in Supabase to handle regular user IDs from Bubble',
                        technicalDetails: responseError.message
                    });
                }
                
                return res.status(500).json({ 
                    error: 'Failed to create response record', 
                    details: responseError.message,
                    hint: responseError.hint
                });
            }
            
            response = newResponse;
        }

        console.log('Response record processed:', response.id);

        // Create question responses
        const questionResponses = Object.entries(responses).map(([questionId, answer]) => {
            const questionResponse = {
                response_id: response.id,
                question_id: questionId
            };

            // Store answer based on type
            if (typeof answer === 'number') {
                questionResponse.answer_numeric = answer;
            } else if (typeof answer === 'string') {
                if (answer === 'yes' || answer === 'no') {
                    questionResponse.answer_choice = answer;
                } else {
                    questionResponse.answer_text = answer;
                }
            } else {
                // Handle other types by converting to string
                questionResponse.answer_text = String(answer);
            }

            console.log('Creating question response:', questionResponse);
            return questionResponse;
        });

        if (questionResponses.length > 0) {
            const { data: insertedQuestions, error: questionsError } = await supabase
                .from('question_responses')
                .insert(questionResponses)
                .select();

            if (questionsError) {
                console.error('Error creating question responses:', questionsError);
                console.error('Questions error details:', {
                    message: questionsError.message,
                    details: questionsError.details,
                    hint: questionsError.hint,
                    code: questionsError.code
                });
                return res.status(500).json({ 
                    error: 'Failed to create question responses', 
                    details: questionsError.message,
                    hint: questionsError.hint
                });
            }

            console.log('Question responses created:', insertedQuestions.length);
        }

        res.json({ 
            ...response,
            questionResponsesCount: questionResponses.length 
        });
    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ error: 'Failed to submit response', details: error.message });
    }
});

// Check if user has existing response for a form
app.get('/api/forms/:formId/response/:userId', async (req, res) => {
    try {
        const { formId, userId } = req.params;
        
        console.log('Checking existing response for form:', formId, 'user:', userId);
        
        // Get existing response for this user and form
        const { data: response, error: responseError } = await supabase
            .from('responses')
            .select(`
                *,
                question_responses (
                    *,
                    question:questions (*)
                )
            `)
            .eq('form_id', formId)
            .eq('user_id', String(userId))
            .single();
            
        if (responseError) {
            if (responseError.code === 'PGRST116') {
                // No response found - this is normal for new users
                return res.json({ hasResponse: false });
            }
            throw responseError;
        }
        
        // Transform the response data to match frontend expectations
        const responseData = {
            id: response.id,
            submittedAt: response.created_at,
            completionTime: response.completion_time_seconds,
            answers: {}
        };
        
        // Convert question responses to answers object
        response.question_responses.forEach(qr => {
            const questionId = qr.question_id;
            let answer = null;
            
            console.log('Processing question response:', {
                questionId,
                answer_numeric: qr.answer_numeric,
                answer_choice: qr.answer_choice,
                answer_text: qr.answer_text
            });
            
            // Get the actual answer based on the response type
            if (qr.answer_numeric !== null && qr.answer_numeric !== undefined) {
                answer = qr.answer_numeric;
            } else if (qr.answer_choice !== null && qr.answer_choice !== undefined) {
                answer = qr.answer_choice;
            } else if (qr.answer_text !== null && qr.answer_text !== undefined) {
                answer = qr.answer_text;
            }
            
            console.log('Final answer for question', questionId, ':', answer);
            responseData.answers[questionId] = answer;
        });
        
        console.log('Found existing response:', responseData);
        res.json({ 
            hasResponse: true, 
            response: responseData 
        });
        
    } catch (error) {
        console.error('Error checking existing response:', error);
        res.status(500).json({ error: 'Failed to check existing response', details: error.message });
    }
});

// Get form analytics
app.get('/api/forms/:formId/analytics', async (req, res) => {
    try {
        const { formId } = req.params;

        // Get form with details
        const { data: form, error: formError } = await supabase
            .from('forms')
            .select(`
                *,
                template:templates (name),
                event:events (name)
            `)
            .eq('id', formId)
            .single();

        if (formError) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Get responses for this form
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select(`
                *,
                question_responses (
                    *,
                    question:questions (*)
                )
            `)
            .eq('form_id', formId);

        if (responsesError) {
            throw responsesError;
        }

        // Calculate analytics
        const analytics = {
            formId: formId,
            formName: form.name,
            totalResponses: responses.length,
            responseRate: responses.length > 0 ? Math.round((responses.length / 25) * 100) : 0, // Assuming 25 players
            averageCompletionTime: responses.length > 0 ? 
                Math.round(responses.reduce((sum, r) => sum + (r.completion_time_seconds || 0), 0) / responses.length) : 0,
            insights: generateInsights(responses)
        };

        res.json(analytics);
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// Get form responses
app.get('/api/forms/:formId/responses', async (req, res) => {
    try {
        const { formId } = req.params;

        // Get responses for this form with question details
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select(`
                *,
                question_responses (
                    *,
                    question:questions (
                        id,
                        question_text,
                        question_type
                    )
                )
            `)
            .eq('form_id', formId)
            .order('id', { ascending: false });

        if (responsesError) {
            throw responsesError;
        }

        // Transform responses for frontend display
        const transformedResponses = responses.map(response => {
            const answers = {};
            response.question_responses.forEach(qr => {
                const answer = qr.answer_text || qr.answer_numeric || qr.answer_choice;
                answers[qr.question.id] = {
                    question: qr.question.question_text,
                    questionType: qr.question.question_type,
                    answer: answer
                };
            });

            return {
                id: response.id,
                isAnonymous: response.is_anonymous,
                completionTime: response.completion_time_seconds,
                submittedAt: new Date().toISOString(), // Placeholder since we don't have created_at
                answers: answers
            };
        });

        res.json(transformedResponses);
    } catch (error) {
        console.error('Error getting responses:', error);
        res.status(500).json({ error: 'Failed to get responses' });
    }
});

// Test endpoints (keeping existing ones)
app.post('/api/test/template-selector', async (req, res) => {
    try {
        const { data: templates, error } = await supabase
            .from('templates')
            .select('*');

        if (error) {
            throw error;
        }

        const result = {
            success: true,
            message: 'Template selector test completed',
            data: {
                templatesLoaded: templates.length,
                availableTypes: [...new Set(templates.map(t => t.type))]
            }
        };
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate mock data (keeping for testing)
app.post('/api/generate-mock-data', async (req, res) => {
    try {
        const { playerCount = 25, eventCount = 10 } = req.body;

        // Generate sample users
        const users = [];
        const firstNames = ['Seán', 'Cian', 'Darragh', 'Tadhg', 'Conor', 'Eoin', 'Pádraic', 'Ruairí'];
        const lastNames = ['Murphy', 'O\'Sullivan', 'McCarthy', 'Walsh', 'O\'Brien', 'Kelly', 'Fitzgerald', 'O\'Connor'];
        const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

        // Add a coach first
        users.push({
            name: 'Seán Murphy',
            role: 'coach',
            club: 'cork_gaa'
        });

        // Add players
        for (let i = 0; i < playerCount; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            users.push({
                name: `${firstName} ${lastName}`,
                role: 'player',
                club: 'cork_gaa',
                position: positions[Math.floor(Math.random() * positions.length)],
                age: Math.floor(Math.random() * 15) + 16,
                jersey_number: i + 1
            });
        }

        const { data: insertedUsers, error: usersError } = await supabase
            .from('users')
            .insert(users)
            .select();

        if (usersError) {
            throw usersError;
        }

        // Generate events
        const events = [];
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

            events.push({
                name: eventType.name,
                type: eventType.type,
                opponent: eventType.opponent,
                date: date.toISOString().split('T')[0],
                club: 'cork_gaa',
                location: 'Páirc Uí Chaoimh'
            });
        }

        const { data: insertedEvents, error: eventsError } = await supabase
            .from('events')
            .insert(events)
            .select();

        if (eventsError) {
            throw eventsError;
        }

        res.json({
            success: true,
            message: 'Mock data generated successfully',
            data: {
                usersGenerated: insertedUsers.length,
                eventsGenerated: insertedEvents.length
            }
        });
    } catch (error) {
        console.error('Error generating mock data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get plugin code
app.get('/api/plugin-code', (req, res) => {
    const pluginCode = loadPluginCode();
    res.json({ code: pluginCode });
});

// Helper functions
function generateInsights(responses) {
    const insights = [];
    
    if (responses.length > 0) {
        const avgCompletionTime = responses.reduce((sum, r) => sum + (r.completion_time_seconds || 0), 0) / responses.length;
        insights.push(`Average completion time: ${Math.round(avgCompletionTime / 60)} minutes`);
        
        insights.push(`${responses.length} players have submitted responses`);
        
        if (responses.length >= 10) {
            insights.push('Good response rate indicates high player engagement');
        } else {
            insights.push('Consider follow-up reminders to increase response rate');
        }
        
        // Get unique user count
        const uniqueUsers = new Set(responses.map(r => r.user_id)).size;
        if (uniqueUsers !== responses.length) {
            insights.push(`${responses.length - uniqueUsers} duplicate responses detected`);
        }
    }
    
    return insights;
}

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🏈 TeamSync Feedback Dev Tool (Supabase) running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`🗄️ Database: ${supabaseUrl}`);
});

module.exports = app;