"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  GripVertical,
  Eye,
  Save,
  Send,
  ChevronDown,
  ChevronRight,
  Star,
  Users,
  Target,
  Zap,
} from "lucide-react"

export function CustomFormBuilder() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["performance"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <Input placeholder="Form Name (e.g., Post-Match Review - Cork vs Kerry)" className="max-w-md" />
          <div className="flex gap-2">
            <Badge variant="outline">Post-Match</Badge>
            <Badge variant="outline">Training</Badge>
          </div>
        </div>
        <div className="text-sm text-gray-500">Building form for: Cork vs Kerry • March 15, 2024</div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Column - Form Structure */}
        <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            Form Structure
          </h3>

          <div className="space-y-2">
            {/* Performance Section */}
            <div className="border rounded-lg">
              <div
                className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => toggleSection("performance")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.includes("performance") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <Star className="w-4 h-4 text-[#0E79B2]" />
                  <span className="font-medium">Performance</span>
                </div>
                <Badge variant="secondary">3 questions</Badge>
              </div>

              {expandedSections.includes("performance") && (
                <div className="px-6 pb-3 space-y-2">
                  <div className="text-sm p-2 bg-gray-50 rounded flex items-center justify-between">
                    <span>Overall Performance Rating</span>
                    <Badge variant="outline" className="text-xs">
                      Rating
                    </Badge>
                  </div>
                  <div className="text-sm p-2 bg-gray-50 rounded flex items-center justify-between">
                    <span>Key Strengths Today</span>
                    <Badge variant="outline" className="text-xs">
                      Text
                    </Badge>
                  </div>
                  <div className="text-sm p-2 bg-gray-50 rounded flex items-center justify-between">
                    <span>Areas for Improvement</span>
                    <Badge variant="outline" className="text-xs">
                      Text
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Team/Tactics Section */}
            <div className="border rounded-lg">
              <div
                className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => toggleSection("tactics")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.includes("tactics") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Team & Tactics</span>
                </div>
                <Badge variant="secondary">2 questions</Badge>
              </div>
            </div>

            {/* Add Section Button */}
            <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </div>

        {/* Center Column - Question Bank */}
        <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Question Bank</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search questions..." className="pl-10 w-48" size="sm" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Performance Questions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-[#0E79B2]" />
                <span className="font-medium text-sm">Performance</span>
              </div>
              <div className="space-y-2">
                {[
                  "Overall Performance Rating (1-10)",
                  "Individual Skill Execution",
                  "Physical Fitness Level",
                  "Mental Focus & Concentration",
                ].map((question, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>{question}</span>
                    <Button size="sm" variant="ghost" className="text-[#0E79B2]">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team/Tactics Questions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">Team/Tactics</span>
              </div>
              <div className="space-y-2">
                {[
                  "Team Communication Rating",
                  "Tactical Understanding",
                  "Team Spirit & Morale",
                  "Leadership on Field",
                ].map((question, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>{question}</span>
                    <Button size="sm" variant="ghost" className="text-[#0E79B2]">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Questions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-sm">Training</span>
              </div>
              <div className="space-y-2">
                {[
                  "Training Intensity Rating",
                  "Skill Development Progress",
                  "Drill Effectiveness",
                  "Recovery & Preparation",
                ].map((question, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>{question}</span>
                    <Button size="sm" variant="ghost" className="text-[#0E79B2]">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Questions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-sm">Management</span>
              </div>
              <div className="space-y-2">
                {["Coaching Effectiveness", "Team Organization", "Substitution Timing", "Motivational Impact"].map(
                  (question, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    >
                      <span>{question}</span>
                      <Button size="sm" variant="ghost" className="text-[#0E79B2]">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview Panel */}
        <div className="w-1/3 bg-gray-50 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Question Preview</h3>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overall Performance Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Question Type</label>
                  <Badge variant="outline" className="ml-2">
                    Rating Scale (1-10)
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium">Question Text</label>
                  <p className="text-sm text-gray-600 mt-1">
                    Rate your overall performance in today's match from 1 (poor) to 10 (excellent)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Settings</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Required question</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Anonymous responses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Position-specific</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium">Preview</label>
                  <div className="mt-2 p-3 bg-white rounded border">
                    <p className="text-sm font-medium mb-3">Rate your overall performance in today's match</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Poor</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div
                            key={num}
                            className="w-6 h-6 border rounded text-xs flex items-center justify-center hover:bg-[#0E79B2] hover:text-white cursor-pointer"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t p-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save as Template
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview Form
          </Button>
          <Button className="bg-[#0E79B2] hover:bg-[#0E79B2]/90">
            <Send className="w-4 h-4 mr-2" />
            Send Form
          </Button>
        </div>
      </div>
    </div>
  )
}
