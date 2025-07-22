"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Edit,
  Eye,
  EyeOff,
  Users,
  Target,
  CheckCircle,
  Clock,
  Smartphone,
  Monitor,
  X,
} from "lucide-react"

interface PreviewQuestion {
  id: string
  type: "rating" | "text" | "multiple_choice" | "yes_no"
  title: string
  description?: string
  required: boolean
  anonymous: boolean
  positionSpecific: boolean
  options?: string[]
}

interface PreviewSection {
  id: string
  title: string
  description?: string
  questions: PreviewQuestion[]
}

// Sample form data for preview
const sampleForm = {
  title: "Post-Match Performance Review",
  description: "Help us understand your experience and performance in today's match",
  type: "post-match",
  estimatedTime: "5-7 minutes",
  sections: [
    {
      id: "performance",
      title: "Individual Performance",
      description: "Rate your personal performance and contribution",
      questions: [
        {
          id: "overall-rating",
          type: "rating" as const,
          title: "Rate your overall performance in today's match",
          description: "Consider your skill execution, decision making, and contribution to the team",
          required: true,
          anonymous: false,
          positionSpecific: true,
        },
        {
          id: "key-strengths",
          type: "text" as const,
          title: "What were your key strengths in today's match?",
          description: "Describe 2-3 specific areas where you performed well",
          required: true,
          anonymous: false,
          positionSpecific: false,
        },
        {
          id: "improvement-areas",
          type: "text" as const,
          title: "What areas would you like to improve?",
          description: "Be honest about areas where you can develop further",
          required: false,
          anonymous: true,
          positionSpecific: false,
        },
      ],
    },
    {
      id: "team-tactics",
      title: "Team & Tactics",
      description: "Evaluate team performance and tactical execution",
      questions: [
        {
          id: "team-communication",
          type: "rating" as const,
          title: "How effective was team communication?",
          description: "Rate the quality of communication between players during the match",
          required: true,
          anonymous: false,
          positionSpecific: false,
        },
        {
          id: "tactical-execution",
          type: "multiple_choice" as const,
          title: "How well did we execute our game plan?",
          options: [
            "Excellent - followed perfectly",
            "Good - mostly followed",
            "Fair - some confusion",
            "Poor - didn't follow plan",
          ],
          required: true,
          anonymous: false,
          positionSpecific: false,
        },
        {
          id: "team-morale",
          type: "yes_no" as const,
          title: "Did you feel supported by your teammates?",
          required: true,
          anonymous: true,
          positionSpecific: false,
        },
      ],
    },
    {
      id: "feedback",
      title: "Additional Feedback",
      description: "Share any additional thoughts or suggestions",
      questions: [
        {
          id: "coach-feedback",
          type: "text" as const,
          title: "Any feedback for the coaching staff?",
          description: "Suggestions for training, tactics, or team management (anonymous)",
          required: false,
          anonymous: true,
          positionSpecific: false,
        },
        {
          id: "next-match",
          type: "text" as const,
          title: "What should we focus on for the next match?",
          required: false,
          anonymous: false,
          positionSpecific: false,
        },
      ],
    },
  ] as PreviewSection[],
}

interface FormPreviewProps {
  onBack: () => void
  onEdit: () => void
  onSend: () => void
}

export function FormPreview({ onBack, onEdit, onSend }: FormPreviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile")
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isAnonymous, setIsAnonymous] = useState(false)

  // Calculate total questions and current position
  const allQuestions = sampleForm.sections.flatMap((section) =>
    section.questions.map((q) => ({ ...q, sectionTitle: section.title })),
  )
  const totalQuestions = allQuestions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100
  const currentQ = allQuestions[currentQuestion]

  const handleResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const renderQuestionPreview = (question: PreviewQuestion) => {
    const response = responses[question.id]

    switch (question.type) {
      case "rating":
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleResponse(question.id, rating)}
                  className={`h-12 rounded-lg border-2 font-semibold transition-all ${
                    response === rating
                      ? "border-[#0E79B2] bg-[#0E79B2] text-white"
                      : "border-gray-200 hover:border-[#0E79B2] hover:bg-[#0E79B2]/5"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            {response && (
              <div className="text-center">
                <Badge variant="secondary" className="bg-[#0E79B2]/10 text-[#0E79B2]">
                  Selected: {response}/10
                </Badge>
              </div>
            )}
          </div>
        )

      case "text":
        return (
          <div>
            <Textarea
              placeholder="Enter your response..."
              value={response || ""}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              className="min-h-24"
            />
            <div className="text-xs text-gray-500 mt-2">{(response || "").length}/500 characters</div>
          </div>
        )

      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(question.id, option)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                  response === option ? "border-[#0E79B2] bg-[#0E79B2]/5" : "border-gray-200 hover:border-[#0E79B2]/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      response === option ? "border-[#0E79B2] bg-[#0E79B2]" : "border-gray-300"
                    }`}
                  >
                    {response === option && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )

      case "yes_no":
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleResponse(question.id, "yes")}
              className={`flex-1 p-4 rounded-lg border-2 font-medium transition-all ${
                response === "yes"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-green-500"
              }`}
            >
              <CheckCircle className="w-5 h-5 mx-auto mb-1" />
              Yes
            </button>
            <button
              onClick={() => handleResponse(question.id, "no")}
              className={`flex-1 p-4 rounded-lg border-2 font-medium transition-all ${
                response === "no" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-red-500"
              }`}
            >
              <X className="w-5 h-5 mx-auto mb-1" />
              No
            </button>
          </div>
        )

      default:
        return <div>Question type not supported in preview</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold">Form Preview</h1>
              <p className="text-sm text-gray-600">Test your form before sending to players</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "mobile" ? "desktop" : "mobile")}
            >
              {viewMode === "mobile" ? <Monitor className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
              {viewMode === "mobile" ? "Desktop View" : "Mobile View"}
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Form
            </Button>
            <Button className="bg-[#0E79B2] hover:bg-[#0E79B2]/90" onClick={onSend}>
              <Send className="w-4 h-4 mr-2" />
              Send to Players
            </Button>
          </div>
        </div>

        {/* Form Info */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>{sampleForm.type.replace("-", " ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{sampleForm.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{totalQuestions} questions</span>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center p-6">
        <div
          className={`bg-white rounded-lg shadow-lg ${viewMode === "mobile" ? "max-w-md w-full" : "max-w-4xl w-full"}`}
        >
          {viewMode === "mobile" ? (
            /* Mobile Preview */
            <div className="min-h-[600px]">
              {/* Mobile Header */}
              <div className="bg-[#0E79B2] text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">{sampleForm.title}</h2>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {currentQuestion + 1}/{totalQuestions}
                  </Badge>
                </div>
                <div className="text-sm opacity-90 mb-3">Cork vs Kerry • March 15, 2024</div>
                <Progress value={progress} className="h-2 bg-white/20" />
              </div>

              {/* Question Content */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {currentQ.sectionTitle}
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
                  <h3 className="text-xl font-semibold mb-3">{currentQ.title}</h3>
                  {currentQ.description && <p className="text-gray-600 text-sm mb-4">{currentQ.description}</p>}
                </div>

                {renderQuestionPreview(currentQ)}

                {/* Anonymous Toggle */}
                {currentQ.anonymous && (
                  <div className="mt-6">
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
              </div>

              {/* Navigation Footer */}
              <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between gap-4">
                  <Button variant="outline" disabled={currentQuestion === 0} onClick={prevQuestion}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-500">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </div>

                  <Button
                    className="bg-[#0E79B2] hover:bg-[#0E79B2]/90"
                    onClick={nextQuestion}
                    disabled={currentQuestion === totalQuestions - 1}
                  >
                    {currentQuestion === totalQuestions - 1 ? "Submit" : "Next"}
                    {currentQuestion !== totalQuestions - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Overview */
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{sampleForm.title}</h2>
                <p className="text-gray-600 mb-4">{sampleForm.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Estimated time: {sampleForm.estimatedTime}</span>
                  <span>•</span>
                  <span>{sampleForm.sections.length} sections</span>
                  <span>•</span>
                  <span>{totalQuestions} questions</span>
                </div>
              </div>

              <div className="space-y-8">
                {sampleForm.sections.map((section, sectionIndex) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#0E79B2]/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-[#0E79B2]">{sectionIndex + 1}</span>
                        </div>
                        {section.title}
                      </CardTitle>
                      {section.description && <p className="text-gray-600">{section.description}</p>}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {section.questions.map((question, questionIndex) => (
                        <div key={question.id} className="border-l-4 border-l-gray-200 pl-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">Q{questionIndex + 1}</span>
                                {question.required && (
                                  <Badge variant="outline" className="text-xs text-red-600">
                                    Required
                                  </Badge>
                                )}
                                {question.anonymous && (
                                  <Badge variant="outline" className="text-xs text-purple-600">
                                    Anonymous
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium mb-1">{question.title}</h4>
                              {question.description && <p className="text-sm text-gray-600">{question.description}</p>}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {question.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">{renderQuestionPreview(question)}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
