"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { TemplateSelector } from "@/components/template-selector"
import { CustomFormBuilder } from "@/components/form-builder"
import { MobileFormCompletion } from "@/components/mobile-form"
import { ResultsDashboard } from "@/components/results-dashboard"
import { getDefaultTemplates } from "@/lib/feedbackCore"

export default function FeedbackPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("event_id")
  const userType = searchParams.get("user_type") // "coach" or "player"
  const [step, setStep] = useState<string>("selector")
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  // Routing logic based on user type and step
  if (!eventId || !userType) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Missing Parameters</h1>
        <p className="text-gray-600">Please provide both <b>event_id</b> and <b>user_type</b> in the URL.</p>
      </div>
    )
  }

  if (userType === "coach") {
    if (step === "selector") {
      return (
        <TemplateSelector
          mode="use"
          onSelectTemplate={(template) => {
            setSelectedTemplate(template)
            setStep("builder")
          }}
          onPreviewTemplate={() => {}}
          onBack={() => {}}
        />
      )
    }
    if (step === "builder" && selectedTemplate) {
      return <CustomFormBuilder />
    }
    if (step === "dashboard") {
      return <ResultsDashboard />
    }
  }

  if (userType === "player") {
    return <MobileFormCompletion />
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Invalid User Type</h1>
      <p className="text-gray-600">user_type must be either <b>coach</b> or <b>player</b>.</p>
    </div>
  )
} 