import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('event_id')

  try {
    let query = supabase
      .from('forms')
      .select(`
        *,
        events (
          id,
          name,
          type,
          date
        ),
        templates (
          id,
          name,
          type
        )
      `)
      .order('created_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data: forms, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(forms)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, event_id, customizations } = body

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', template_id)
      .single()

    if (templateError) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Create the form
    const formData = {
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      template_id: template.id,
      event_id: event.id,
      structure: template.structure,
      status: 'active',
      allow_anonymous: true,
      ...customizations
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert([formData])
      .select()
      .single()

    if (formError) {
      return NextResponse.json({ error: formError.message }, { status: 400 })
    }

    return NextResponse.json(form)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}