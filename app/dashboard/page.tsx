"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PiggyBank, Coins, Plus, Bell, ArrowRight, Waves, Handshake } from "lucide-react";
import { BottomNav } from "../../components/bottom-nav";
import { NotificationBell } from "../../components/notification-bell";
import { useTotalSaved } from "../../hooks/useTotalSaved";
import { useActiveSavings } from "../../hooks/useActiveSavings";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { totalAmount, totalRewards, savingsCount, isLoading, error } = useTotalSaved();
  const { activeSavings, isLoading: activeSavingsLoading } = useActiveSavings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center gap-2 justify-between pt-4">
            <div></div>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back! <Handshake className="inline-block w-6 h-6 text-purple-800" /></h1>
              <p className="text-gray-600 text-sm">Let's grow your vault</p>
            </div>
            <NotificationBell />
          </div>

          {/* Total Saved */}
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center space-y-2">
              <p className="text-purple-100 text-sm">Total Amount Saved</p>
              <h2 className="text-4xl font-bold">
                {isLoading ? "Loading..." : error ? "Error" : `$${parseFloat(totalAmount).toFixed(2)}`}
              </h2>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4" />
                  <span>
                    {isLoading ? "Loading..." : error ? "Error" : `${parseFloat(totalRewards).toFixed(1)} $BTS earned`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/create-vault")}
              className="h-16 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex-col space-y-1"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">Create Vault</span>
            </Button>
            <Button
              onClick={() => router.push("/my-vaults")}
              variant="outline"
              className="h-16 border-2 border-purple-200 rounded-2xl flex-col space-y-1 hover:bg-purple-50"
            >
              <PiggyBank className="w-6 h-6 text-purple-500" />
              <span className="text-sm text-purple-700">My Vaults</span>
            </Button>
          </div>

          {/* Active Vaults Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Active Vaults {!isLoading && !error && savingsCount > 0 && `(${savingsCount})`}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/my-vaults")}
                className="text-purple-600"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {isLoading ? (
              <Card className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-500">Loading your vaults...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <p className="text-red-600">Error loading vaults: {error}</p>
                </CardContent>
              </Card>
            ) : savingsCount === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-4 text-center space-y-2">
                  <p className="text-gray-500">No vaults created yet</p>
                  <Button
                    size="sm"
                    onClick={() => router.push("/create-vault")}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Create Your First Vault
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Show real active savings data
              <div className="space-y-3">
                {activeSavings.slice(0, 3).map((saving) => { // Show max 3 savings on dashboard
                  const timeLeft = saving.timeToMaturity;
                  const daysLeft = Math.max(0, Math.floor(timeLeft / (24 * 3600)));
                  const hoursLeft = Math.max(0, Math.floor((timeLeft % (24 * 3600)) / 3600));
                  
                  return (
                    <Card key={saving.name} className="border-gray-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{saving.name}</h4>
                          <Badge 
                            variant="secondary" 
                            className={
                              saving.isMatured 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-green-100 text-green-700"
                            }
                          >
                            {saving.isMatured ? "Ready" : "Active"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Saved: ${parseFloat(saving.amountFormatted).toFixed(2)}</span>
                            <span>
                              {timeLeft > 0 
                                ? `${daysLeft}d ${hoursLeft}h left`
                                : "Matured"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1 text-sm text-green-600">
                            <Coins className="w-4 h-4" />
                            <span>+{parseFloat(saving.interestFormatted).toFixed(3)} $BTS</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-transparent"
                            onClick={() => router.push(`/top-up?vault=${encodeURIComponent(saving.name)}`)}
                          >
                            Top Up
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {activeSavings.length > 3 && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-3 text-center">
                      <p className="text-sm text-purple-700">
                        +{activeSavings.length - 3} more vault{activeSavings.length - 3 !== 1 ? 's' : ''}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push("/my-vaults")}
                        className="text-purple-600 p-0 h-auto font-normal"
                      >
                        View All
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Keep the old mock vaults for now, but commented out
            {mockVaults.map((vault) => (
              <Card key={vault.id} className="border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{vault.name}</h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        ${vault.saved} / ${vault.target}
                      </span>
                    </div>
                    <Progress value={vault.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1 text-sm text-green-600">
                      <Coins className="w-4 h-4" />
                      <span>+{vault.rewards} $BTS</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-transparent"
                      onClick={() => router.push(`/top-up?vault=${vault.id}`)}
                    >
                      Top Up
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))} */}
          </div>

          {/* Wallet Watch */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-gray-900">Wallet Watch</h4>
              </div>
              <p className="text-sm text-gray-700">You earned $47 this week from Farcaster!</p>
              <Button
                size="sm"
                onClick={() => router.push("/notifications")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Suggested Save: $14
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav currentPage="dashboard" />
      </div>
    </div>
  );
}
