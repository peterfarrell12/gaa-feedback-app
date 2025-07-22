'use client'

import { useState, useEffect } from 'react'
import { User, Event, Form } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Star, Clock, User as UserIcon, Shield } from 'lucide-react'

interface PlayerViewProps {
  user: User
  event: Event
  forms: Form[]
}

export default function PlayerView({ user, event, forms }: PlayerViewProps) {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const activeForm = forms.find(f => f.status === 'active')

  useEffect(() => {
    if (activeForm && !selectedForm) {
      setSelectedForm(activeForm)
    }
  }, [activeForm, selectedForm])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!selectedForm) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: selectedForm.id,
          user_id: user.id,
          responses,
          is_anonymous: isAnonymous,
          completion_time_seconds: 300 // This would be calculated from actual time
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit response')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: any) => {
    const value = responses[question.id]

    switch (question.type) {
      case 'rating':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">1</span>
              <span className="text-sm text-gray-500">{question.scale}</span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: question.scale }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleResponseChange(question.id, i + 1)}
                  className={`flex-1 h-10 rounded-md border ${
                    value === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )

      case 'text':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Type your response here..."
            className="min-h-[100px]"
          />
        )

      case 'multiple_choice':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(value) => handleResponseChange(question.id, value)}
          >
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'yes_no':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(value) => handleResponseChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        )

      default:
        return null
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Response Submitted!</h3>
              <p className="text-gray-500 mb-4">
                Thank you for your feedback. Your response has been recorded.
              </p>
              <Badge variant="secondary" className="text-sm">
                {isAnonymous ? 'Anonymous Response' : 'Identified Response'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!activeForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Forms</h3>
              <p className="text-gray-500">
                There are no feedback forms available for this event yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuestions = selectedForm.structure.sections.reduce(
    (total: number, section: any) => total + section.questions.length,
    0
  )

  const answeredQuestions = Object.keys(responses).filter(
    key => responses[key] !== undefined && responses[key] !== null && responses[key] !== ''
  ).length

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedForm.name}</CardTitle>
                  <p className="text-gray-600 mt-1">
                    {event.name} • {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-sm">
                  <UserIcon className="h-3 w-3 mr-1" />
                  {user.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Est. 5-7 minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Anonymous option available</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{answeredQuestions}/{totalQuestions} questions</span>
                </div>
                <Progress value={(answeredQuestions / totalQuestions) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Content */}
        <div className="space-y-8">
          {selectedForm.structure.sections.map((section: any, sectionIndex: number) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question: any, questionIndex: number) => (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {sectionIndex + 1}.{questionIndex + 1} {question.text}
                    </Label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Submit anonymously (your name will not be recorded)
                </Label>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || answeredQuestions === 0}
                  className="min-w-[120px]"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}