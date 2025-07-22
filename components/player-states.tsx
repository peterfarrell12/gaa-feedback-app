"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, CheckCircle, Star, TrendingUp, Target, Eye, Award } from "lucide-react"

export function PlayerFeedbackStates() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50">
      <Tabs defaultValue="available" className="w-full">
        <div className="bg-white border-b p-4">
          <h1 className="text-xl font-bold text-[#0E79B2] mb-4">Feedback Center</h1>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
        </div>

        {/* State A - Form Available */}
        <TabsContent value="available" className="p-4 space-y-4">
          <Card className="border-l-4 border-l-[#0E79B2]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-[#0E79B2] text-white">New Feedback Request</Badge>
                <Badge variant="outline" className="text-xs">
                  Due in 2 days
                </Badge>
              </div>
              <CardTitle className="text-lg">Post-Match Feedback</CardTitle>
              <p className="text-sm text-gray-600">Cork vs Kerry • March 15, 2024</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>~5 minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>3 sections</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Form includes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Performance self-assessment</li>
                  <li>• Team tactics and communication</li>
                  <li>• Areas for improvement</li>
                  <li>• Anonymous feedback option</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-[#0E79B2]">
                  <CheckCircle className="w-4 h-4" />
                  <span>Auto-save enabled • Anonymous option available</span>
                </div>
              </div>

              <Button className="w-full bg-[#0E79B2] hover:bg-[#0E79B2]/90 h-12">Complete Feedback Form</Button>
            </CardContent>
          </Card>

          {/* Previous Forms */}
          <div>
            <h3 className="font-medium mb-3">Previous Forms</h3>
            <Card className="opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Training Session Review</p>
                    <p className="text-xs text-gray-500">March 12, 2024</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* State B - Form Completed, Waiting */}
        <TabsContent value="completed" className="p-4 space-y-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Badge className="bg-green-100 text-green-800">Feedback Submitted</Badge>
              </div>
              <CardTitle className="text-lg">Post-Match Feedback</CardTitle>
              <p className="text-sm text-gray-600">Cork vs Kerry • March 15, 2024</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Your Response Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Overall Performance:</span>
                    <Badge variant="outline">7/10</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Team Communication:</span>
                    <Badge variant="outline">8/10</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tactical Understanding:</span>
                    <Badge variant="outline">6/10</Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Team Completion Status</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">18 of 22 players responded</span>
                  <span className="text-sm font-medium">82%</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-sm">Results Coming Soon</p>
                <p className="text-xs text-gray-500">You'll be notified when the coach releases the team results</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* State C - Results Available */}
        <TabsContent value="results" className="p-4 space-y-4">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <Badge className="bg-purple-100 text-purple-800">Results Available</Badge>
              </div>
              <CardTitle className="text-lg">Your Feedback from Coach</CardTitle>
              <p className="text-sm text-gray-600">Cork vs Kerry • March 15, 2024</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <Star className="w-6 h-6 text-[#0E79B2] mx-auto mb-1" />
                  <p className="text-lg font-bold text-[#0E79B2]">7.5/10</p>
                  <p className="text-xs text-gray-600">Your Performance</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">+0.5</p>
                  <p className="text-xs text-gray-600">Improvement</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-sm mb-3">Team Performance Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Team Average</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-16 h-2" />
                      <span className="text-sm font-medium">7.2/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Your Rating</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-16 h-2" />
                      <span className="text-sm font-medium text-[#0E79B2]">7.5/10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-medium text-sm">Development Recommendations</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Focus on set piece positioning</li>
                  <li>• Continue strong defensive work</li>
                  <li>• Work on quick decision making</li>
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <Award className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                  <p className="text-xs font-medium">Strengths</p>
                  <p className="text-xs text-gray-600">Defense</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <Target className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                  <p className="text-xs font-medium">Focus</p>
                  <p className="text-xs text-gray-600">Set Pieces</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                  <p className="text-xs font-medium">Trend</p>
                  <p className="text-xs text-gray-600">Improving</p>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <Eye className="w-4 h-4 mr-2" />
                View Full Team Results
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
