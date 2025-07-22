'use client'

import { useState } from 'react'

export default function TestIframe() {
  const [eventId, setEventId] = useState('550e8400-e29b-41d4-a716-446655440001')
  const [userType, setUserType] = useState('player')
  const [userId, setUserId] = useState('550e8400-e29b-41d4-a716-446655440002')

  const iframeUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/feedback/${eventId}/${userType}/${userId}`
    : `/feedback/${eventId}/${userType}/${userId}`

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">GAA Feedback System - Iframe Test</h1>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">URL Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event ID</label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Event ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="player">Player</option>
              <option value="coach">Coach</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="User ID"
            />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>URL:</strong> {iframeUrl}
          </p>
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-3 text-center font-medium">
          GAA Feedback System (Embedded in Iframe)
        </div>
        <iframe
          src={iframeUrl}
          width="100%"
          height="800px"
          style={{ border: 'none' }}
          title="GAA Feedback System"
        />
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Integration Instructions</h3>
        <p className="text-sm text-yellow-700 mb-2">
          To embed this in Bubble, use the HTML element with the following iframe code:
        </p>
        <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
{`<iframe
  src="https://your-app.vercel.app/feedback/[EVENT_ID]/[USER_TYPE]/[USER_ID]"
  width="100%"
  height="800px"
  style="border: none;"
  title="GAA Feedback System"
></iframe>`}
        </pre>
      </div>
    </div>
  )
}