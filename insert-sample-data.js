const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertSampleData() {
  console.log('🔍 Inserting sample data...')
  
  try {
    // Insert system admin user
    const { data: systemUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'System Admin',
        role: 'coach',
        club: 'System'
      })
      .select()
    
    if (userError) {
      console.log('User insert error:', userError)
    } else {
      console.log('✅ System user inserted')
    }

    // Insert templates
    const templates = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Post-Match Standard Review',
        description: 'Performance, tactics, and team dynamics',
        type: 'post_game',
        estimated_time: '5-7 min',
        icon: '⚽',
        is_system_template: true,
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Training Session Review',
        description: 'Drills, fitness, and skill development',
        type: 'post_training',
        estimated_time: '4-6 min',
        icon: '🏃',
        is_system_template: true,
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      }
    ]

    const { data: insertedTemplates, error: templatesError } = await supabase
      .from('templates')
      .insert(templates)
      .select()

    if (templatesError) {
      console.log('Templates insert error:', templatesError)
    } else {
      console.log('✅ Templates inserted:', insertedTemplates.length)
    }

    // Insert sections for post-match template
    const postMatchSections = [
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        template_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Performance Assessment',
        order_index: 1
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        template_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Tactical Analysis',
        order_index: 2
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        template_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Team Dynamics',
        order_index: 3
      }
    ]

    const { data: insertedSections, error: sectionsError } = await supabase
      .from('sections')
      .insert(postMatchSections)
      .select()

    if (sectionsError) {
      console.log('Sections insert error:', sectionsError)
    } else {
      console.log('✅ Post-match sections inserted:', insertedSections.length)
    }

    // Insert questions for Performance Assessment
    const performanceQuestions = [
      {
        section_id: '550e8400-e29b-41d4-a716-446655440011',
        question_text: 'How would you rate your individual performance today?',
        question_type: 'rating',
        scale: 10,
        order_index: 1
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440011',
        question_text: 'How would you rate the team\'s overall performance?',
        question_type: 'rating',
        scale: 10,
        order_index: 2
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440011',
        question_text: 'What was your strongest contribution to the team today?',
        question_type: 'text',
        order_index: 3
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440011',
        question_text: 'What area would you most like to improve for next match?',
        question_type: 'text',
        order_index: 4
      }
    ]

    const { data: insertedQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(performanceQuestions)
      .select()

    if (questionsError) {
      console.log('Questions insert error:', questionsError)
    } else {
      console.log('✅ Performance questions inserted:', insertedQuestions.length)
    }

    // Insert questions for Tactical Analysis
    const tacticalQuestions = [
      {
        section_id: '550e8400-e29b-41d4-a716-446655440012',
        question_text: 'How well did we execute our game plan?',
        question_type: 'rating',
        scale: 10,
        order_index: 1
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440012',
        question_text: 'Which tactical area needs most improvement?',
        question_type: 'multiple_choice',
        options: ["Defensive Shape", "Attack Transition", "Set Pieces", "Possession Play"],
        order_index: 2
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440012',
        question_text: 'Any tactical suggestions for future matches?',
        question_type: 'text',
        order_index: 3
      }
    ]

    const { error: tacticalError } = await supabase
      .from('questions')
      .insert(tacticalQuestions)

    if (tacticalError) {
      console.log('Tactical questions error:', tacticalError)
    } else {
      console.log('✅ Tactical questions inserted')
    }

    // Insert questions for Team Dynamics
    const teamQuestions = [
      {
        section_id: '550e8400-e29b-41d4-a716-446655440013',
        question_text: 'How would you rate team communication today?',
        question_type: 'rating',
        scale: 10,
        order_index: 1
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440013',
        question_text: 'How positive was the team atmosphere?',
        question_type: 'rating',
        scale: 10,
        order_index: 2
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440013',
        question_text: 'Any feedback for the coaching staff?',
        question_type: 'text',
        order_index: 3
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440013',
        question_text: 'Do you feel your voice is heard in team decisions?',
        question_type: 'yes_no',
        order_index: 4
      },
      {
        section_id: '550e8400-e29b-41d4-a716-446655440013',
        question_text: 'Additional comments (optional)',
        question_type: 'text',
        order_index: 5
      }
    ]

    const { error: teamError } = await supabase
      .from('questions')
      .insert(teamQuestions)

    if (teamError) {
      console.log('Team questions error:', teamError)
    } else {
      console.log('✅ Team questions inserted')
    }

    console.log('\n🎉 Sample data insertion complete!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

insertSampleData()