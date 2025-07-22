"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Target, Plus, Edit3, History, ChevronRight, Calendar, Sparkles } from "lucide-react"
import { ScratchFormBuilder } from "@/components/scratch-form-builder"
import { TemplateSelector } from "@/components/template-selector"
import { FormPreview } from "@/components/form-preview"
import { PastForms } from "@/components/past-forms"

// Modern, Clean Form Builder Landing Page
function FormBuilderLanding({ setActiveWireframe }: { setActiveWireframe: (value: string) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#0E79B2] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Create Feedback Form</h1>
              </div>
              <p className="text-gray-600">Build engaging feedback forms for your GAA team</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Cork vs Kerry • March 15, 2024</span>
              <Button variant="ghost" size="sm" className="text-[#0E79B2] hover:bg-[#0E79B2]/10 ml-2">
                Change Match
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Start from Scratch */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-[#0E79B2] to-[#0E79B2]/80 text-white"
            onClick={() => setActiveWireframe("scratch")}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Start from Scratch</h3>
                  <p className="text-white/80 text-sm">Build a completely custom form</p>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Create a personalized feedback form tailored to your specific needs with full control over questions and
                structure.
              </p>
              <div className="flex items-center text-sm text-white/80">
                <span>Full customization</span>
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* Use Template */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0"
            onClick={() => setActiveWireframe("use-template")}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Use Template</h3>
                  <p className="text-gray-600 text-sm">Quick start with proven forms</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Choose from professionally designed templates optimized for GAA teams and get started in seconds.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Ready to use</span>
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* Modify Template */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0"
            onClick={() => setActiveWireframe("modify-template")}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Edit3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Modify Template</h3>
                  <p className="text-gray-600 text-sm">Customize existing templates</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Start with a template and customize it to match your team's specific requirements and preferences.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Best of both worlds</span>
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Showcase */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Templates</h2>
              <p className="text-gray-600">Professionally designed forms used by GAA teams nationwide</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveWireframe("use-template")}
              className="hover:bg-[#0E79B2] hover:text-white transition-colors"
            >
              View All Templates
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-[#0E79B2]"
              onClick={() => setActiveWireframe("use-template")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#0E79B2]/10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#0E79B2]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Post-Match Standard Review</CardTitle>
                    <CardDescription>Performance, tactics, and team dynamics</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>3 sections</span>
                  <span>•</span>
                  <span>12 questions</span>
                  <span>•</span>
                  <span>5-7 min</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-[#0E79B2] hover:bg-[#0E79B2]/90 group-hover:shadow-md transition-all">
                  Use This Template
                </Button>
              </CardContent>
            </Card>

            <Card
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500"
              onClick={() => setActiveWireframe("use-template")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Training Session Review</CardTitle>
                    <CardDescription>Drills, fitness, and skill development</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>4 sections</span>
                  <span>•</span>
                  <span>15 questions</span>
                  <span>•</span>
                  <span>6-8 min</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-[#0E79B2] hover:bg-[#0E79B2]/90 group-hover:shadow-md transition-all">
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setActiveWireframe("past-forms")}
            className="hover:bg-gray-50 transition-colors"
          >
            <History className="w-5 h-5 mr-2" />
            View Past Forms
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function WireframeDemo() {
  const [activeWireframe, setActiveWireframe] = useState("landing")

  const handleTemplateSelect = (template: any, mode: "use" | "modify") => {
    if (mode === "use") {
      setActiveWireframe("preview")
    } else {
      setActiveWireframe("scratch")
    }
  }

  const handlePreviewTemplate = (template: any) => {
    setActiveWireframe("preview")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-[#0E79B2] mb-2">GAA TeamSync - Feedback System</h1>
        <p className="text-gray-600">Modern, streamlined feedback collection for GAA teams</p>
      </div>

      <Tabs value={activeWireframe} onValueChange={setActiveWireframe} className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-gray-100 p-1 m-4">
          <TabsTrigger value="landing" className="text-xs">
            Home
          </TabsTrigger>
          <TabsTrigger value="use-template" className="text-xs">
            Use Template
          </TabsTrigger>
          <TabsTrigger value="modify-template" className="text-xs">
            Modify Template
          </TabsTrigger>
          <TabsTrigger value="scratch" className="text-xs">
            From Scratch
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            Preview Form
          </TabsTrigger>
          <TabsTrigger value="past-forms" className="text-xs">
            Past Forms
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs">
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing" className="mt-0">
          <FormBuilderLanding setActiveWireframe={setActiveWireframe} />
        </TabsContent>

        <TabsContent value="use-template" className="mt-0">
          <TemplateSelector
            mode="use"
            onSelectTemplate={handleTemplateSelect}
            onPreviewTemplate={handlePreviewTemplate}
            onBack={() => setActiveWireframe("landing")}
          />
        </TabsContent>

        <TabsContent value="modify-template" className="mt-0">
          <TemplateSelector
            mode="modify"
            onSelectTemplate={handleTemplateSelect}
            onPreviewTemplate={handlePreviewTemplate}
            onBack={() => setActiveWireframe("landing")}
          />
        </TabsContent>

        <TabsContent value="scratch" className="mt-0">
          <ScratchFormBuilder />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <FormPreview
            onBack={() => setActiveWireframe("landing")}
            onEdit={() => setActiveWireframe("scratch")}
            onSend={() => {
              alert("Form sent to players!")
              setActiveWireframe("landing")
            }}
          />
        </TabsContent>

        <TabsContent value="past-forms" className="mt-0">
          <PastForms onBack={() => setActiveWireframe("landing")} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0">
          <div className="p-4 text-center text-gray-500">
            <p>Results Dashboard wireframe would be displayed here</p>
            <p className="text-sm mt-2">Analytics cards, insights, and team performance metrics</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
