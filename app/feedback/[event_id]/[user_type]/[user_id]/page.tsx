'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { User, Event, Form } from '@/lib/supabase'
import CoachView from '@/components/CoachView'
import PlayerView from '@/components/PlayerView'

export default function FeedbackPage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const eventId = params.event_id as string
  const userType = params.user_type as string
  const userId = params.user_id as string

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch user
        const userResponse = await fetch(`/api/users/${userId}`)
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user')
        }
        const userData = await userResponse.json()
        setUser(userData)

        // Fetch event
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event')
        }
        const eventData = await eventResponse.json()
        setEvent(eventData)

        // Fetch forms for this event
        const formsResponse = await fetch(`/api/forms?event_id=${eventId}`)
        if (!formsResponse.ok) {
          throw new Error('Failed to fetch forms')
        }
        const formsData = await formsResponse.json()
        setForms(formsData)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!user || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Not Found</div>
          <p className="text-gray-600">User or event not found</p>
        </div>
      </div>
    )
  }

  // Verify user type matches
  if (user.role !== userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Access Denied</div>
          <p className="text-gray-600">User type mismatch</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userType === 'coach' ? (
        <CoachView user={user} event={event} forms={forms} />
      ) : (
        <PlayerView user={user} event={event} forms={forms} />
      )}
    </div>
  )
}