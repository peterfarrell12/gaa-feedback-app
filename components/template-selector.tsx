"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Clock, Users, Star, Target, MessageSquare, Edit, Eye } from "lucide-react"

interface Template {
  id: string
  name: string
  type: "post-match" | "training" | "development" | "anonymous"
  description: string
  sections: number
  questions: number
  estimatedTime: string
  lastUsed?: string
  isCustom?: boolean
}

const templates: Template[] = [
  {
    id: "post-match-standard",
    name: "Post-Match Standard Review",
    type: "post-match",
    description: "Comprehensive post-match feedback covering performance, tactics, and team dynamics",
    sections: 3,
    questions: 12,
    estimatedTime: "5-7 min",
    lastUsed: "March 10, 2024",
  },
  {
    id: "training-session",
    name: "Training Session Review",
    type: "training",
    description: "Focus on drill effectiveness, fitness levels, and skill development progress",
    sections: 4,
    questions: 15,
    estimatedTime: "6-8 min",
    lastUsed: "March 8, 2024",
  },
  {
    id: "player-development",
    name: "Player Development Check",
    type: "development",
    description: "Individual progress tracking and goal setting for player improvement",
    sections: 2,
    questions: 8,
    estimatedTime: "3-5 min",
    lastUsed: "March 5, 2024",
  },
  {
    id: "anonymous-feedback",
    name: "Anonymous Team Feedback",
    type: "anonymous",
    description: "Open feedback channel for team suggestions and concerns",
    sections: 2,
    questions: 6,
    estimatedTime: "3-4 min",
  },
  {
    id: "custom-match-analysis",
    name: "Custom Match Analysis",
    type: "post-match",
    description: "Custom form created for detailed tactical analysis",
    sections: 5,
    questions: 18,
    estimatedTime: "8-10 min",
    lastUsed: "March 1, 2024",
    isCustom: true,
  },
]

const typeColors = {
  "post-match": { bg: "bg-[#0E79B2]/10", text: "text-[#0E79B2]", border: "border-[#0E79B2]" },
  training: { bg: "bg-green-50", text: "text-green-600", border: "border-green-500" },
  development: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-500" },
  anonymous: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-500" },
}

const typeIcons = {
  "post-match": Target,
  training: Users,
  development: Star,
  anonymous: MessageSquare,
}

const formatType = (type: string) => {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

interface TemplateSelectorProps {
  mode: "use" | "modify"
  onSelectTemplate: (template: Template, mode: "use" | "modify") => void
  onPreviewTemplate: (template: Template) => void
  onBack: () => void
}

export function TemplateSelector({ mode, onSelectTemplate, onPreviewTemplate, onBack }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || template.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form Builder
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">{mode === "use" ? "Use Template" : "Modify Template"}</h1>
            <p className="text-gray-600">
              {mode === "use"
                ? "Choose a template to create your feedback form quickly"
                : "Select a template to customize and modify"}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
              className={selectedType === "all" ? "bg-[#0E79B2]" : ""}
            >
              All
            </Button>
            <Button
              variant={selectedType === "post-match" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("post-match")}
              className={selectedType === "post-match" ? "bg-[#0E79B2]" : ""}
            >
              Post-Match
            </Button>
            <Button
              variant={selectedType === "training" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("training")}
              className={selectedType === "training" ? "bg-[#0E79B2]" : ""}
            >
              Training
            </Button>
            <Button
              variant={selectedType === "development" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("development")}
              className={selectedType === "development" ? "bg-[#0E79B2]" : ""}
            >
              Development
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const colors = typeColors[template.type]
            const IconComponent = typeIcons[template.type]

            return (
              <Card
                key={template.id}
                className={`hover:shadow-lg transition-all cursor-pointer border-l-4 ${colors.border} h-full`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex gap-1">
                      {template.isCustom && (
                        <Badge variant="outline" className="text-xs">
                          Custom
                        </Badge>
                      )}
                      <Badge className={`text-xs ${colors.bg} ${colors.text} border-0`}>
                        {formatType(template.type)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Template Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-lg font-semibold text-[#0E79B2]">{template.sections}</div>
                      <div className="text-xs text-gray-500">Sections</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-[#0E79B2]">{template.questions}</div>
                      <div className="text-xs text-gray-500">Questions</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0E79B2]">{template.estimatedTime}</div>
                      <div className="text-xs text-gray-500">Est. Time</div>
                    </div>
                  </div>

                  {/* Last Used */}
                  {template.lastUsed && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
                      <Clock className="w-3 h-3" />
                      <span>Last used: {template.lastUsed}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreviewTemplate(template)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#0E79B2] hover:bg-[#0E79B2]/90"
                      onClick={() => onSelectTemplate(template, mode)}
                    >
                      {mode === "use" ? (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Use Template
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Modify
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
