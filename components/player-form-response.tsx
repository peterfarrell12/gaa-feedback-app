"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Eye, EyeOff, ArrowLeft, ArrowRight, Send } from "lucide-react"

// This component represents what players see when they click a feedback link
export function PlayerFormResponse() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const sampleQuestions = [
    {
      id: "q1",
      section: "Performance",
      title: "Rate your overall performance in today's match",
      description: "Consider your skill execution, decision making, and contribution to the team",
      type: "rating",
      required: true,
      anonymous: false,
    },
    {
      id: "q2",
      section: "Performance",
      title: "What were your key strengths in today's match?",
      description: "Describe 2-3 specific areas where you performed well",
      type: "text",
      required: true,
      anonymous: false,
    },
    {
      id: "q3",
      section: "Team & Tactics",
      title: "How effective was team communication?",
      description: "Rate the quality of communication between players during the match",
      type: "rating",
      required: true,
      anonymous: true,
    },
  ]

  const totalQuestions = sampleQuestions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100
  const currentQ = sampleQuestions[currentQuestion]

  const handleResponse = (value: any) => {
    setResponses((prev) => ({ ...prev, [currentQ.id]: value }))
    if (currentQ.type === "rating") {
      setSelectedRating(value)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedRating(responses[sampleQuestions[currentQuestion + 1].id] || null)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setSelectedRating(responses[sampleQuestions[currentQuestion - 1].id] || null)
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0E79B2] text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold">Post-Match Feedback</h1>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {currentQuestion + 1}/{totalQuestions}
          </Badge>
        </div>
        <div className="text-sm opacity-90 mb-3">Cork vs Kerry • March 15, 2024</div>
        <Progress value={progress} className="h-2 bg-white/20" />
      </div>

      {/* Question Content */}
      <div className="p-6 flex-1">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {currentQ.section}
            </Badge>
            {currentQ.required && (
              <Badge variant="outline" className="text-xs text-red-600">
                Required
              </Badge>
            )}
            {currentQ.anonymous && (
              <Badge variant="outline" className="text-xs text-purple-600">
                Anonymous
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-semibold mb-3">{currentQ.title}</h2>
          {currentQ.description && <p className="text-gray-600 text-sm mb-4">{currentQ.description}</p>}
        </div>

        {/* Question Input */}
        {currentQ.type === "rating" && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-3">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleResponse(rating)}
                  className={`h-12 rounded-lg border-2 font-semibold transition-all ${
                    selectedRating === rating
                      ? "border-[#0E79B2] bg-[#0E79B2] text-white"
                      : "border-gray-200 hover:border-[#0E79B2] hover:bg-[#0E79B2]/5"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            {selectedRating && (
              <div className="text-center">
                <Badge variant="secondary" className="bg-[#0E79B2]/10 text-[#0E79B2]">
                  Selected: {selectedRating}/10
                </Badge>
              </div>
            )}
          </div>
        )}

        {currentQ.type === "text" && (
          <div className="mb-8">
            <Textarea
              placeholder="Enter your response..."
              value={responses[currentQ.id] || ""}
              onChange={(e) => handleResponse(e.target.value)}
              className="min-h-24"
            />
            <div className="text-xs text-gray-500 mt-2">{(responses[currentQ.id] || "").length}/500 characters</div>
          </div>
        )}

        {/* Anonymous Toggle */}
        {currentQ.anonymous && (
          <div className="mb-6">
            <div
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setIsAnonymous(!isAnonymous)}
            >
              <div className="flex items-center gap-3">
                {isAnonymous ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <div>
                  <div className="font-medium">Anonymous Response</div>
                  <div className="text-sm text-gray-500">
                    {isAnonymous ? "Your response will be anonymous" : "Your response will include your name"}
                  </div>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? "bg-[#0E79B2]" : "bg-gray-300"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    isAnonymous ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Auto-save indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Response auto-saved</span>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" disabled={currentQuestion === 0} onClick={prevQuestion}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            {currentQuestion + 1} of {totalQuestions}
          </div>

          <Button
            className="bg-[#0E79B2] hover:bg-[#0E79B2]/90"
            onClick={currentQuestion === totalQuestions - 1 ? () => alert("Form submitted!") : nextQuestion}
            disabled={currentQ.required && !responses[currentQ.id]}
          >
            {currentQuestion === totalQuestions - 1 ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
