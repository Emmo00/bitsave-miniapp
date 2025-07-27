"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { ArrowLeft, TrendingUp, Coins, PiggyBank, Plus } from "lucide-react";

export default function WalletMonitor() {
  const router = useRouter();
  const suggestedAmount = 14;
  const weeklyEarnings = 47;

  const mockVaults = [
    { id: 1, name: "Creator Fund", saved: 245, target: 1000 },
    { id: 2, name: "Equipment Upgrade", saved: 89, target: 500 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Suggested Save</h1>
              <p className="text-sm text-gray-600">Smart savings recommendations</p>
            </div>
          </div>

          {/* Earnings Summary */}
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Great week! 🎉</h2>
                <p className="text-gray-700">
                  You earned <span className="font-bold text-green-600">${weeklyEarnings}</span>{" "}
                  from Farcaster
                </p>
                <p className="text-sm text-gray-600">Time to pay yourself and grow your savings!</p>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Save */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-green-600" />
                <span>Recommended Save</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600">${suggestedAmount}</div>
                <p className="text-sm text-gray-600">30% of your weekly earnings</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Recommended Amount
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-700 text-center">
                  Saving consistently helps you reach your goals faster and earn more $BTS rewards.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vault Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Choose a vault to top up:</h3>

            {mockVaults.map((vault) => (
              <Card
                key={vault.id}
                className="border-gray-200 hover:border-purple-300 cursor-pointer transition-colors"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{vault.name}</h4>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() =>
                        router.push(`/top-up?vault=${vault.id}&amount=${suggestedAmount}`)
                      }
                    >
                      Top Up ${suggestedAmount}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current</span>
                      <span className="font-medium">
                        ${vault.saved} / ${vault.target}
                      </span>
                    </div>
                    <Progress value={(vault.saved / vault.target) * 100} className="h-2" />
                  </div>

                  <div className="text-xs text-gray-500">
                    After top up: ${vault.saved + suggestedAmount} / ${vault.target}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Vault Option */}
            <Card className="border-2 border-dashed border-purple-300 hover:border-purple-400 cursor-pointer transition-colors">
              <CardContent className="p-4 text-center space-y-3">
                <Plus className="w-8 h-8 text-purple-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-900">Create New Vault</h4>
                  <p className="text-sm text-gray-600">
                    Start a new savings goal with ${suggestedAmount}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/create-vault")}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  Create & Save ${suggestedAmount}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="h-12">
              Maybe Later
            </Button>
            <Button className="h-12 bg-green-500 hover:bg-green-600">
              Save ${suggestedAmount} 🎯
            </Button>
          </div>

          {/* Motivation */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4 text-center space-y-2">
              <Coins className="w-6 h-6 text-yellow-500 mx-auto" />
              <p className="text-sm text-purple-700">
                <span className="font-medium">Pro tip:</span> Regular savers earn 2x more $BTS
                rewards!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
