"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomFormBuilder } from "@/components/form-builder"
import { MobileFormCompletion, MobileFormTextQuestion } from "@/components/mobile-form"
import { ResultsDashboard } from "@/components/results-dashboard"
import { PlayerFeedbackStates } from "@/components/player-states"

export default function WireframesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-[#0E79B2] mb-2">GAA TeamSync - Complete Wireframe Set</h1>
        <p className="text-gray-600">Interactive wireframe prototypes for the feedback system</p>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 m-4">
          <TabsTrigger value="builder" className="text-xs">
            Custom Builder
          </TabsTrigger>
          <TabsTrigger value="mobile-rating" className="text-xs">
            Mobile Rating
          </TabsTrigger>
          <TabsTrigger value="mobile-text" className="text-xs">
            Mobile Text
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs">
            Results Dashboard
          </TabsTrigger>
          <TabsTrigger value="player-states" className="text-xs">
            Player States
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-0">
          <CustomFormBuilder />
        </TabsContent>

        <TabsContent value="mobile-rating" className="mt-0">
          <MobileFormCompletion />
        </TabsContent>

        <TabsContent value="mobile-text" className="mt-0">
          <MobileFormTextQuestion />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0">
          <ResultsDashboard />
        </TabsContent>

        <TabsContent value="player-states" className="mt-0">
          <PlayerFeedbackStates />
        </TabsContent>
      </Tabs>
    </div>
  )
}
