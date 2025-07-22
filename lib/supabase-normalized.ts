import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our normalized database tables
export interface User {
  id: string
  name: string
  role: 'coach' | 'player'
  club: string
  position?: string
  age?: number
  jersey_number?: number
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  type: 'match' | 'training'
  opponent?: string
  date: string
  club: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  description?: string
  type: string
  estimated_time?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface TemplateSection {
  id: string
  template_id: string
  title: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface TemplateQuestion {
  id: string
  section_id: string
  question_text: string
  question_type: 'rating' | 'text' | 'multiple_choice' | 'yes_no'
  options?: string[] // For multiple choice questions
  scale?: number // For rating questions
  required: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface Form {
  id: string
  name: string
  template_id: string
  event_id: string
  status: 'active' | 'closed' | 'draft'
  allow_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface Response {
  id: string
  form_id: string
  user_id?: string
  is_anonymous: boolean
  completion_time_seconds?: number
  submitted_at: string
}

export interface QuestionResponse {
  id: string
  response_id: string
  question_id: string
  answer_text?: string
  answer_numeric?: number
  answer_choice?: string
  created_at: string
}

// Extended types with relationships
export interface TemplateWithSections extends Template {
  sections: (TemplateSection & {
    questions: TemplateQuestion[]
  })[]
}

export interface FormWithDetails extends Form {
  template: Template
  event: Event
  sections: (TemplateSection & {
    questions: TemplateQuestion[]
  })[]
}

export interface ResponseWithDetails extends Response {
  user?: User
  question_responses: (QuestionResponse & {
    question: TemplateQuestion
  })[]
}

// Database query functions
export async function getTemplateWithSections(templateId: string): Promise<TemplateWithSections | null> {
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (templateError || !template) return null

  const { data: sections, error: sectionsError } = await supabase
    .from('template_sections')
    .select(`
      *,
      template_questions (*)
    `)
    .eq('template_id', templateId)
    .order('order_index')

  if (sectionsError) return null

  return {
    ...template,
    sections: sections?.map(section => ({
      ...section,
      questions: section.template_questions.sort((a, b) => a.order_index - b.order_index)
    })) || []
  }
}

export async function getFormWithDetails(formId: string): Promise<FormWithDetails | null> {
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select(`
      *,
      template:templates (*),
      event:events (*)
    `)
    .eq('id', formId)
    .single()

  if (formError || !form) return null

  const templateWithSections = await getTemplateWithSections(form.template_id)
  if (!templateWithSections) return null

  return {
    ...form,
    sections: templateWithSections.sections
  }
}

export async function submitResponse(
  formId: string,
  userId: string | null,
  isAnonymous: boolean,
  answers: Record<string, any>,
  completionTimeSeconds?: number
): Promise<Response | null> {
  // Create the response record
  const { data: response, error: responseError } = await supabase
    .from('responses')
    .insert({
      form_id: formId,
      user_id: isAnonymous ? null : userId,
      is_anonymous: isAnonymous,
      completion_time_seconds: completionTimeSeconds
    })
    .select()
    .single()

  if (responseError || !response) return null

  // Insert individual question responses
  const questionResponses = Object.entries(answers).map(([questionId, answer]) => {
    const questionResponse: Partial<QuestionResponse> = {
      response_id: response.id,
      question_id: questionId
    }

    // Store answer based on type
    if (typeof answer === 'number') {
      questionResponse.answer_numeric = answer
    } else if (typeof answer === 'string') {
      if (answer === 'yes' || answer === 'no') {
        questionResponse.answer_choice = answer
      } else {
        questionResponse.answer_text = answer
      }
    }

    return questionResponse
  })

  const { error: questionsError } = await supabase
    .from('question_responses')
    .insert(questionResponses)

  if (questionsError) {
    // If question responses failed, clean up the response
    await supabase.from('responses').delete().eq('id', response.id)
    return null
  }

  return response
}

export async function getResponsesForForm(formId: string): Promise<ResponseWithDetails[]> {
  const { data: responses, error } = await supabase
    .from('responses')
    .select(`
      *,
      user:users (*),
      question_responses (
        *,
        question:template_questions (*)
      )
    `)
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false })

  return responses || []
}