import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const formId = searchParams.get('form_id')
  const userId = searchParams.get('user_id')

  try {
    let query = supabase
      .from('responses')
      .select(`
        *,
        users (
          id,
          name,
          role,
          position
        )
      `)
      .order('submitted_at', { ascending: false })

    if (formId) {
      query = query.eq('form_id', formId)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: responses, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(responses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { form_id, user_id, responses, is_anonymous, completion_time_seconds } = body

    const responseData = {
      form_id,
      user_id: is_anonymous ? null : user_id,
      responses,
      is_anonymous,
      completion_time_seconds
    }

    const { data: response, error } = await supabase
      .from('responses')
      .insert([responseData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 })
  }
}