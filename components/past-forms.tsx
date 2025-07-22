"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Calendar,
  Users,
  Eye,
  Download,
  MoreHorizontal,
  Target,
  Star,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

interface PastForm {
  id: string
  title: string
  type: "post-match" | "training" | "development" | "anonymous"
  date: string
  status: "completed" | "active" | "draft"
  responses: {
    completed: number
    total: number
  }
  averageRating?: number
  matchDetails?: string
}

const pastForms: PastForm[] = [
  {
    id: "1",
    title: "Post-Match vs Tipperary",
    type: "post-match",
    date: "March 10, 2024",
    status: "completed",
    responses: { completed: 22, total: 22 },
    averageRating: 7.2,
    matchDetails: "Championship Quarter-Final",
  },
  {
    id: "2",
    title: "Training Session Review",
    type: "training",
    date: "March 8, 2024",
    status: "completed",
    responses: { completed: 18, total: 22 },
    averageRating: 8.1,
  },
  {
    id: "3",
    title: "Player Development Check",
    type: "development",
    date: "March 5, 2024",
    status: "completed",
    responses: { completed: 20, total: 22 },
    averageRating: 6.8,
  },
  {
    id: "4",
    title: "Post-Match vs Kerry",
    type: "post-match",
    date: "March 3, 2024",
    status: "active",
    responses: { completed: 15, total: 22 },
    matchDetails: "League Final",
  },
  {
    id: "5",
    title: "Anonymous Team Feedback",
    type: "anonymous",
    date: "March 1, 2024",
    status: "completed",
    responses: { completed: 19, total: 22 },
  },
  {
    id: "6",
    title: "Pre-Season Assessment",
    type: "development",
    date: "February 28, 2024",
    status: "draft",
    responses: { completed: 0, total: 22 },
  },
]

const typeColors = {
  "post-match": { bg: "bg-[#0E79B2]/10", text: "text-[#0E79B2]", icon: Target },
  training: { bg: "bg-green-50", text: "text-green-600", icon: Users },
  development: { bg: "bg-orange-50", text: "text-orange-600", icon: Star },
  anonymous: { bg: "bg-purple-50", text: "text-purple-600", icon: MessageSquare },
}

const statusConfig = {
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  active: { color: "bg-blue-100 text-blue-800", icon: Clock },
  draft: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
}

const formatType = (type: string) => {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

interface PastFormsProps {
  onBack: () => void
}

export function PastForms({ onBack }: PastFormsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredForms = pastForms.filter((form) => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    const matchesType = typeFilter === "all" || form.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
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
            <h1 className="text-2xl font-bold">Past Feedback Forms</h1>
            <p className="text-gray-600">View and manage your previous feedback forms</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="post-match">Post-Match</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="anonymous">Anonymous</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Forms List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredForms.map((form) => {
            const typeConfig = typeColors[form.type]
            const statusInfo = statusConfig[form.status]
            const TypeIcon = typeConfig.icon
            const StatusIcon = statusInfo.icon
            const completionRate = (form.responses.completed / form.responses.total) * 100

            return (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${typeConfig.bg} rounded-lg flex items-center justify-center`}>
                        <TypeIcon className={`w-6 h-6 ${typeConfig.text}`} />
                      </div>

                      {/* Form Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{form.title}</h3>
                          <Badge className={`text-xs ${typeConfig.bg} ${typeConfig.text} border-0`}>
                            {formatType(form.type)}
                          </Badge>
                          <Badge className={`text-xs ${statusInfo.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{form.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {form.responses.completed}/{form.responses.total} responses
                            </span>
                          </div>
                          {form.averageRating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              <span>{form.averageRating}/10 avg</span>
                            </div>
                          )}
                        </div>

                        {form.matchDetails && <p className="text-sm text-gray-500 mb-3">{form.matchDetails}</p>}

                        {/* Progress Bar */}
                        {form.status !== "draft" && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#0E79B2] h-2 rounded-full transition-all"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{Math.round(completionRate)}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredForms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
