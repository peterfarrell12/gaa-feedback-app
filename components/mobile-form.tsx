"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Save, Eye, EyeOff, CheckCircle } from "lucide-react"

export function MobileFormCompletion() {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const totalQuestions = 8
  const progress = (currentQuestion / totalQuestions) * 100

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0E79B2] text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold">Post-Match Feedback</h1>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {currentQuestion}/{totalQuestions}
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
              Performance
            </Badge>
            <Badge variant="outline" className="text-xs">
              Section 1 of 3
            </Badge>
          </div>
          <h2 className="text-xl font-semibold mb-3">Rate your overall performance in today's match</h2>
          <p className="text-gray-600 text-sm">
            Consider your skill execution, decision making, and contribution to the team's performance.
          </p>
        </div>

        {/* Rating Scale */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
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

        {/* Anonymous Toggle */}
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
            <div className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? "bg-[#0E79B2]" : "bg-gray-300"}`}>
              <div
                className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                  isAnonymous ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Response auto-saved</span>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            disabled={currentQuestion === 1}
            onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>

          <Button
            className="bg-[#0E79B2] hover:bg-[#0E79B2]/90"
            disabled={!selectedRating}
            onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions, prev + 1))}
          >
            {currentQuestion === totalQuestions ? "Submit" : "Next"}
            {currentQuestion !== totalQuestions && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Alternative question types for demonstration
export function MobileFormTextQuestion() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0E79B2] text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold">Post-Match Feedback</h1>
          <Badge variant="secondary" className="bg-white/20 text-white">
            3/8
          </Badge>
        </div>
        <div className="text-sm opacity-90 mb-3">Cork vs Kerry • March 15, 2024</div>
        <Progress value={37.5} className="h-2 bg-white/20" />
      </div>

      {/* Question Content */}
      <div className="p-6 flex-1">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              Performance
            </Badge>
            <Badge variant="outline" className="text-xs">
              Section 1 of 3
            </Badge>
          </div>
          <h2 className="text-xl font-semibold mb-3">What were your key strengths in today's match?</h2>
          <p className="text-gray-600 text-sm">
            Describe 2-3 specific areas where you performed well and contributed positively to the team.
          </p>
        </div>

        {/* Text Area */}
        <div className="mb-8">
          <Textarea
            placeholder="e.g., Strong defensive positioning, accurate passing under pressure, good communication with teammates..."
            className="min-h-32 text-base"
          />
          <div className="text-xs text-gray-500 mt-2">0/500 characters</div>
        </div>

        {/* Position Context */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#0E79B2]">Midfielder</Badge>
              <span className="text-sm text-gray-600">Position-specific context</span>
            </div>
            <p className="text-sm text-gray-600">
              As a midfielder, consider your role in linking defense and attack, winning possession, and distributing
              the ball effectively.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>

          <Button className="bg-[#0E79B2] hover:bg-[#0E79B2]/90">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
