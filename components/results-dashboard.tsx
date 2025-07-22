"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  Share2,
  Eye,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export function ResultsDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Post-Match Feedback Results</h1>
            <p className="text-gray-600">Cork vs Kerry • March 15, 2024</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Response Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-semibold">18/22 players responded</span>
            <Badge className="bg-green-100 text-green-800">82% completion</Badge>
          </div>
          <Progress value={82} className="w-32" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Insights Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Team Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-[#0E79B2]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Team Performance</p>
                    <p className="text-2xl font-bold text-[#0E79B2]">7.2/10</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+0.3</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={72} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Player Effort</p>
                    <p className="text-2xl font-bold text-green-600">8.1/10</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+0.5</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={81} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tactical Execution</p>
                    <p className="text-2xl font-bold text-orange-600">6.8/10</p>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm">-0.2</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Team Morale</p>
                    <p className="text-2xl font-bold text-purple-600">8.4/10</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+0.7</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={84} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Top Insights */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Team Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Defensive Organization</p>
                    <p className="text-sm text-gray-600">Consistently rated 8.5+/10</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Team Communication</p>
                    <p className="text-sm text-gray-600">Strong improvement noted</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Improved</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Physical Fitness</p>
                    <p className="text-sm text-gray-600">High energy throughout match</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Strong</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Set Piece Execution</p>
                    <p className="text-sm text-gray-600">Average rating: 5.8/10</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Focus Area</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Forward Line Movement</p>
                    <p className="text-sm text-gray-600">Needs better coordination</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Develop</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Decision Making Under Pressure</p>
                    <p className="text-sm text-gray-600">Mixed feedback received</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Practice</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Anonymous Feedback Summary */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Anonymous Feedback Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Most Mentioned Positive</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Strong team spirit (12 mentions)</li>
                    <li>• Good defensive work (10 mentions)</li>
                    <li>• Improved fitness levels (8 mentions)</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Common Concerns</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Set piece preparation (9 mentions)</li>
                    <li>• Forward line coordination (7 mentions)</li>
                    <li>• Game management (5 mentions)</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Suggestions</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• More set piece practice (11 mentions)</li>
                    <li>• Video analysis sessions (6 mentions)</li>
                    <li>• Position-specific training (4 mentions)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button className="bg-[#0E79B2] hover:bg-[#0E79B2]/90">
            <Eye className="w-4 h-4 mr-2" />
            Detailed Analysis
          </Button>
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Individual Player Reports
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Full Report
          </Button>
        </div>
      </div>
    </div>
  )
}
