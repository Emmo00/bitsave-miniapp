"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ArrowLeft, Trophy, Share } from "lucide-react"
import { BottomNav } from "~/components/bottom-nav"

export default function Leaderboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  const mockLeaders = [
    {
      id: 1,
      username: "cryptosaver.eth",
      pfp: "/placeholder.svg?height=40&width=40",
      totalSaved: 2450,
      btsRewards: 125.5,
      vaultsCreated: 8,
      rank: 1,
      badges: ["🥇", "🌱", "🔥"],
    },
    {
      id: 2,
      username: "vaultmaster",
      pfp: "/placeholder.svg?height=40&width=40",
      totalSaved: 1890,
      btsRewards: 98.2,
      vaultsCreated: 6,
      rank: 2,
      badges: ["🥈", "💎"],
    },
    {
      id: 3,
      username: "hodlstrong",
      pfp: "/placeholder.svg?height=40&width=40",
      totalSaved: 1650,
      btsRewards: 87.3,
      vaultsCreated: 5,
      rank: 3,
      badges: ["🥉", "⚡"],
    },
    {
      id: 4,
      username: "you",
      pfp: "/placeholder.svg?height=40&width=40",
      totalSaved: 334,
      btsRewards: 16.7,
      vaultsCreated: 2,
      rank: 47,
      badges: ["🌱"],
      isCurrentUser: true,
    },
  ]

  const topThree = mockLeaders.slice(0, 3)
  const currentUser = mockLeaders.find((u) => u.isCurrentUser)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="secondary" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-sm text-gray-600">Top savers in the community</p>
            </div>
            <Button size="icon">
              <Share className="w-5 h-5" />
            </Button>
          </div>

          {/* Filters */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="farcaster">Farcaster</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6 mt-6">
              {/* Podium */}
              <Card className="bg-gradient-to-r from-yellow-50 via-orange-50 to-purple-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-end justify-center space-x-4">
                    {/* 2nd Place */}
                    <div className="text-center space-y-2">
                      <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-gray-300">
                          <AvatarImage src={topThree[1]?.pfp || "/placeholder.svg"} />
                          <AvatarFallback>{topThree[1]?.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium truncate max-w-16">{topThree[1]?.username}</p>
                        <p className="text-xs text-gray-600">${topThree[1]?.totalSaved}</p>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center space-y-2">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-4 border-yellow-400">
                          <AvatarImage src={topThree[0]?.pfp || "/placeholder.svg"} />
                          <AvatarFallback>{topThree[0]?.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <Trophy className="w-6 h-6 text-yellow-500 absolute -top-3 left-1/2 transform -translate-x-1/2" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold truncate max-w-20">{topThree[0]?.username}</p>
                        <p className="text-sm text-gray-600">${topThree[0]?.totalSaved}</p>
                        <div className="flex justify-center space-x-1">
                          {topThree[0]?.badges.map((badge, i) => (
                            <span key={i} className="text-xs">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center space-y-2">
                      <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-orange-300">
                          <AvatarImage src={topThree[2]?.pfp || "/placeholder.svg"} />
                          <AvatarFallback>{topThree[2]?.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium truncate max-w-16">{topThree[2]?.username}</p>
                        <p className="text-xs text-gray-600">${topThree[2]?.totalSaved}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sort Options */}
              <div className="flex space-x-2 overflow-x-auto">
                <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                  Total Saved
                </Button>
                <Button variant="secondary" size="sm" className="whitespace-nowrap">
                  BTS Rewards
                </Button>
                <Button variant="secondary" size="sm" className="whitespace-nowrap">
                  Vaults Created
                </Button>
              </div>

              {/* Current User Position */}
              {currentUser && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {currentUser.rank}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={currentUser.pfp || "/placeholder.svg"} />
                          <AvatarFallback>YOU</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">You</p>
                          <div className="flex space-x-1">
                            {currentUser.badges.map((badge, i) => (
                              <span key={i} className="text-sm">
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-right space-y-1">
                        <p className="font-bold text-purple-600">${currentUser.totalSaved}</p>
                        <p className="text-xs text-gray-600">{currentUser.btsRewards} $BTS</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Leaderboard */}
              <div className="space-y-3">
                {mockLeaders.slice(0, 10).map((user) => (
                  <Card
                    key={user.id}
                    className={`${user.isCurrentUser ? "border-purple-200 bg-purple-50/30" : "border-gray-200"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              user.rank === 1
                                ? "bg-yellow-400 text-white"
                                : user.rank === 2
                                  ? "bg-gray-300 text-white"
                                  : user.rank === 3
                                    ? "bg-orange-300 text-white"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.rank}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.pfp || "/placeholder.svg"} />
                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.isCurrentUser ? "You" : user.username}</p>
                            <div className="flex space-x-1">
                              {user.badges.map((badge, i) => (
                                <span key={i} className="text-sm">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 text-right space-y-1">
                          <p className="font-bold text-green-600">${user.totalSaved}</p>
                          <p className="text-xs text-gray-600">
                            {user.btsRewards} $BTS • {user.vaultsCreated} vaults
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Share Achievement */}
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4 text-center space-y-3">
                  <Trophy className="w-8 h-8 text-green-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-green-800">Share Your Progress</h4>
                    <p className="text-sm text-green-700">
                      "I'm #{currentUser?.rank} on the Bitsave leaderboard! 🏆 #Bitsave"
                    </p>
                  </div>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    Share to Cast
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <BottomNav currentPage="leaderboard" />
      </div>
    </div>
  )
}
