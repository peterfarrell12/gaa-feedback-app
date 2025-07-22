import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
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
  structure: any
  created_at: string
  updated_at: string
}

export interface Form {
  id: string
  name: string
  template_id: string
  event_id: string
  structure: any
  status: 'active' | 'closed' | 'draft'
  allow_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface Response {
  id: string
  form_id: string
  user_id?: string
  responses: any
  is_anonymous: boolean
  completion_time_seconds?: number
  submitted_at: string
}

// Helper functions
export function getSectionCount(structure: any): number {
  return structure?.sections?.length || 0
}

export function getQuestionCount(structure: any): number {
  if (!structure?.sections) return 0
  return structure.sections.reduce((total: number, section: any) => 
    total + (section.questions?.length || 0), 0
  )
}