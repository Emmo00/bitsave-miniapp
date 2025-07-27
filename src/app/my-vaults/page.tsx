"use client"

import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { ArrowLeft, PiggyBank, Coins, TrendingUp, Plus } from "lucide-react"
import { BottomNav } from "~/components/bottom-nav"

export default function MyVaults() {
  const router = useRouter()

  const mockVaults = [
    {
      id: 1,
      name: "Creator Fund",
      saved: 245,
      target: 1000,
      progress: 24.5,
      rewards: 12.3,
      status: "active",
      token: "USDC",
      network: "Base",
      endDate: "2024-08-15",
      daysLeft: 45,
    },
    {
      id: 2,
      name: "Equipment Upgrade",
      saved: 89,
      target: 500,
      progress: 17.8,
      rewards: 4.5,
      status: "active",
      token: "ETH",
      network: "Base",
      endDate: "2024-07-20",
      daysLeft: 20,
    },
    {
      id: 3,
      name: "Emergency Fund",
      saved: 500,
      target: 500,
      progress: 100,
      rewards: 25.0,
      status: "completed",
      token: "USDC",
      network: "Celo",
      endDate: "2024-06-01",
      daysLeft: 0,
    },
  ]

  const activeVaults = mockVaults.filter((v) => v.status === "active")
  const completedVaults = mockVaults.filter((v) => v.status === "completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">My Vaults</h1>
              <p className="text-sm text-gray-600">
                {activeVaults.length} active, {completedVaults.length} completed
              </p>
            </div>
            <Button
              size="icon"
              onClick={() => router.push("/create-vault")}
              className="bg-green-500 hover:bg-green-600 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Active Vaults */}
          {activeVaults.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-purple-500" />
                <span>Active Vaults</span>
              </h2>

              {activeVaults.map((vault) => (
                <Card key={vault.id} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900">{vault.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {vault.token}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {vault.network}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          ${vault.saved} / ${vault.target}
                        </span>
                      </div>
                      <Progress value={vault.progress} className="h-3" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{vault.progress.toFixed(1)}% complete</span>
                        <span>{vault.daysLeft} days left</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-green-600 font-medium">+{vault.rewards} $BTS</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/top-up?vault=${vault.id}`)}
                          className="text-xs"
                        >
                          Top Up
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed Vaults */}
          {completedVaults.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Completed Vaults</span>
              </h2>

              {completedVaults.map((vault) => (
                <Card key={vault.id} className="border-green-200 bg-green-50/30">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900">{vault.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {vault.token}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {vault.network}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">Completed ✓</Badge>
                    </div>

                    <div className="space-y-2">
                      <Progress value={100} className="h-3" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Final Amount</span>
                        <span className="font-bold text-green-600">${vault.saved}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-green-600 font-medium">+{vault.rewards} $BTS earned</span>
                      </div>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-xs">
                        Claim Rewards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {mockVaults.length === 0 && (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-8 text-center space-y-4">
                <PiggyBank className="w-12 h-12 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">No vaults yet</h3>
                  <p className="text-gray-600 text-sm">Create your first savings vault to get started</p>
                </div>
                <Button onClick={() => router.push("/create-vault")} className="bg-purple-500 hover:bg-purple-600">
                  Create Your First Vault
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        <BottomNav currentPage="my-vaults" />
      </div>
    </div>
  )
}
