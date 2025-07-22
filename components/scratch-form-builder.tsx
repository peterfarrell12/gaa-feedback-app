"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Settings,
  Eye,
  Save,
  Send,
  ArrowLeft,
  GripVertical,
  X,
  Star,
  MessageSquare,
  ToggleLeft,
  List,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Link,
  Copy,
} from "lucide-react"

interface Question {
  id: string
  type: "rating" | "text" | "multiple_choice" | "yes_no" | "date" | "time"
  title: string
  description?: string
  required: boolean
  anonymous: boolean
  positionSpecific: boolean
  options?: string[]
}

interface FormSection {
  id: string
  title: string
  description?: string
  questions: Question[]
  expanded: boolean
}

export function ScratchFormBuilder() {
  const [formTitle, setFormTitle] = useState("")
  const [formType, setFormType] = useState<"post-match" | "training" | "development" | "anonymous">("post-match")
  const [formDescription, setFormDescription] = useState("")
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: "section-1",
      title: "Performance Assessment",
      description: "Player self-evaluation of match/training performance",
      questions: [],
      expanded: true,
    },
  ])
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink] = useState("https://teamsync.gaa/feedback/abc123")

  const questionTypes = [
    { value: "rating", label: "Rating Scale (1-10)", icon: Star },
    { value: "text", label: "Text Response", icon: MessageSquare },
    { value: "multiple_choice", label: "Multiple Choice", icon: List },
    { value: "yes_no", label: "Yes/No", icon: ToggleLeft },
    { value: "date", label: "Date", icon: Calendar },
    { value: "time", label: "Time", icon: Clock },
  ]

  const addSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      description: "",
      questions: [],
      expanded: true,
    }
    setSections([...sections, newSection])
  }

  const addQuestion = (sectionId: string, questionType: Question["type"]) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: questionType,
      title: "New Question",
      description: "",
      required: true,
      anonymous: false,
      positionSpecific: false,
      options: questionType === "multiple_choice" ? ["Option 1", "Option 2"] : undefined,
    }

    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, questions: [...section.questions, newQuestion] } : section,
      ),
    )
    setSelectedQuestion(newQuestion)
  }

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)))
  }

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setSections(
      sections.map((section) => ({
        ...section,
        questions: section.questions.map((question) =>
          question.id === questionId ? { ...question, ...updates } : question,
        ),
      })),
    )
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion({ ...selectedQuestion, ...updates })
    }
  }

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter((q) => q.id !== questionId) }
          : section,
      ),
    )
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null)
    }
  }

  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) => (section.id === sectionId ? { ...section, expanded: !section.expanded } : section)),
    )
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    // You could add a toast notification here
  }

  const ShareModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Share Feedback Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Share Link</Label>
            <div className="flex gap-2 mt-1">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button size="sm" onClick={copyShareLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Players can access this form directly via this link</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">WhatsApp Message Template</h4>
            <div className="text-sm text-gray-700 bg-white p-2 rounded border">
              Hi team! Please complete your post-match feedback: {shareLink}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
            <Button
              className="flex-1 bg-[#0E79B2]"
              onClick={() => {
                window.open(
                  `https://wa.me/?text=Hi team! Please complete your post-match feedback: ${shareLink}`,
                  "_blank",
                )
              }}
            >
              Open WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Building form for:</span>
            <Badge variant="outline">Cork vs Kerry • March 15, 2024</Badge>
          </div>
        </div>

        {/* Form Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="form-title">Form Title</Label>
            <Input
              id="form-title"
              placeholder="e.g., Post-Match Performance Review"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="form-type">Form Type</Label>
            <Select value={formType} onValueChange={(value: any) => setFormType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post-match">Post-Match Review</SelectItem>
                <SelectItem value="training">Training Session</SelectItem>
                <SelectItem value="development">Player Development</SelectItem>
                <SelectItem value="anonymous">Anonymous Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="form-description">Description (Optional)</Label>
            <Input
              id="form-description"
              placeholder="Brief description of the form purpose"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Panel - Form Structure */}
        <div className="w-1/3 bg-white border-r overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Form Structure</h3>
              <Button size="sm" variant="outline" onClick={addSection}>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <Card key={section.id} className="border">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(section.id)}
                          className="p-0 h-auto"
                        >
                          {section.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </Button>
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          className="border-none p-0 h-auto font-medium bg-transparent flex-1"
                        />
                      </div>
                      <Badge variant="secondary">{section.questions.length} questions</Badge>
                    </div>

                    {section.expanded && (
                      <div className="space-y-3">
                        <Input
                          placeholder="Section description (optional)"
                          value={section.description}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          className="text-sm"
                        />

                        {/* Questions in this section */}
                        <div className="space-y-2">
                          {section.questions.map((question, questionIndex) => (
                            <div
                              key={question.id}
                              className={`p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedQuestion?.id === question.id ? "bg-blue-50 border-[#0E79B2]" : ""
                              }`}
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                  <span className="text-sm font-medium truncate">{question.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {questionTypes.find((t) => t.value === question.type)?.label.split(" ")[0]}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeQuestion(section.id, question.id)
                                    }}
                                    className="p-0 h-auto text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Question Dropdown */}
                        <div className="pt-2">
                          <Select onValueChange={(value: any) => addQuestion(section.id, value)}>
                            <SelectTrigger className="h-9 text-sm">
                              <div className="flex items-center gap-2">
                                <Plus className="w-3 h-3" />
                                <span>Add Question</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {questionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="w-4 h-4" />
                                    <span>{type.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Question Editor */}
        <div className="w-2/3 bg-gray-50 overflow-y-auto">
          {selectedQuestion ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Question Settings</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className={showPreview ? "bg-[#0E79B2] text-white" : ""}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Edit" : "Preview"}
                </Button>
              </div>

              {!showPreview ? (
                <div className="space-y-6">
                  {/* Question Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Question Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="question-title">Question Title</Label>
                        <Input
                          id="question-title"
                          value={selectedQuestion.title}
                          onChange={(e) => updateQuestion(selectedQuestion.id, { title: e.target.value })}
                          placeholder="Enter your question"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="question-description">Help Text (Optional)</Label>
                        <Textarea
                          id="question-description"
                          value={selectedQuestion.description || ""}
                          onChange={(e) => updateQuestion(selectedQuestion.id, { description: e.target.value })}
                          placeholder="Additional context or instructions for players"
                          rows={2}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Question Type</Label>
                        <Select
                          value={selectedQuestion.type}
                          onValueChange={(value: any) => updateQuestion(selectedQuestion.id, { type: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Multiple Choice Options */}
                      {selectedQuestion.type === "multiple_choice" && (
                        <div>
                          <Label>Answer Options</Label>
                          <div className="space-y-2 mt-1">
                            {selectedQuestion.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(selectedQuestion.options || [])]
                                    newOptions[index] = e.target.value
                                    updateQuestion(selectedQuestion.id, { options: newOptions })
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = selectedQuestion.options?.filter((_, i) => i !== index)
                                    updateQuestion(selectedQuestion.id, { options: newOptions })
                                  }}
                                  className="text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [
                                  ...(selectedQuestion.options || []),
                                  `Option ${(selectedQuestion.options?.length || 0) + 1}`,
                                ]
                                updateQuestion(selectedQuestion.id, { options: newOptions })
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Question Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Question Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Required Question</Label>
                          <p className="text-sm text-gray-500">Players must answer this question</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuestion(selectedQuestion.id, { required: !selectedQuestion.required })}
                          className={`w-12 h-6 rounded-full ${
                            selectedQuestion.required ? "bg-[#0E79B2]" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              selectedQuestion.required ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Anonymous Responses</Label>
                          <p className="text-sm text-gray-500">Hide player names from responses</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateQuestion(selectedQuestion.id, { anonymous: !selectedQuestion.anonymous })
                          }
                          className={`w-12 h-6 rounded-full ${
                            selectedQuestion.anonymous ? "bg-[#0E79B2]" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              selectedQuestion.anonymous ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Position-Specific</Label>
                          <p className="text-sm text-gray-500">Show different context based on player position</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateQuestion(selectedQuestion.id, {
                              positionSpecific: !selectedQuestion.positionSpecific,
                            })
                          }
                          className={`w-12 h-6 rounded-full ${
                            selectedQuestion.positionSpecific ? "bg-[#0E79B2]" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              selectedQuestion.positionSpecific ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* Preview Mode */
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mobile Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-sm mx-auto bg-white border rounded-lg p-4">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Performance
                          </Badge>
                          {selectedQuestion.required && (
                            <Badge variant="outline" className="text-xs text-red-600">
                              Required
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-2">{selectedQuestion.title}</h4>
                        {selectedQuestion.description && (
                          <p className="text-sm text-gray-600 mb-3">{selectedQuestion.description}</p>
                        )}
                      </div>

                      {/* Preview based on question type */}
                      {selectedQuestion.type === "rating" && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Poor</span>
                            <span>Excellent</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <div
                                key={num}
                                className="h-8 border rounded text-xs flex items-center justify-center hover:bg-[#0E79B2] hover:text-white cursor-pointer"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedQuestion.type === "text" && <Textarea placeholder="Enter your response..." rows={3} />}

                      {selectedQuestion.type === "multiple_choice" && (
                        <div className="space-y-2">
                          {selectedQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input type="radio" name="preview-radio" className="rounded" />
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedQuestion.type === "yes_no" && (
                        <div className="flex gap-4">
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Yes
                          </Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            No
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a question to edit</p>
                <p className="text-sm">Choose a question from the form structure to configure its settings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t p-6 flex items-center justify-between">
        <div className="flex gap-3">
          <Button variant="outline">Cancel</Button>
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save as Template
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview Full Form
          </Button>
          <Button variant="outline" onClick={() => setShowShareModal(true)}>
            <Link className="w-4 h-4 mr-2" />
            Get Share Link
          </Button>
          <Button className="bg-[#0E79B2] hover:bg-[#0E79B2]/90" disabled={!formTitle || sections.length === 0}>
            <Send className="w-4 h-4 mr-2" />
            Send to Players
          </Button>
        </div>
      </div>

      {showShareModal && <ShareModal />}
    </div>
  )
}
