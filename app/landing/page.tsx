"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PiggyBank, Trophy, Bell, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    localStorage.setItem("bitsave-logged-in", "true");
    router.push("/dashboard");
  };

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 pt-8">
            <div className="flex justify-center">
              <div className="relative">
                <PiggyBank className="w-16 h-16 text-purple-400" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Bitsave</h1>
            <p className="text-xl font-semibold text-purple-600">Save while you earn onchain</p>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              Automatically stash away a portion of your Farcaster earnings and watch your vault
              grow.
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-medium"
            >
              Start Saving
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 text-center">Core Features</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-purple-100 bg-purple-50/50">
                <CardContent className="p-4 text-center space-y-2">
                  <PiggyBank className="w-8 h-8 text-purple-500 mx-auto" />
                  <h3 className="font-medium text-sm">Create Vaults</h3>
                  <p className="text-xs text-gray-600">Set savings goals with custom durations</p>
                </CardContent>
              </Card>
              <Card className="border-green-100 bg-green-50/50">
                <CardContent className="p-4 text-center space-y-2">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto" />
                  <h3 className="font-medium text-sm">Auto Save</h3>
                  <p className="text-xs text-gray-600">Save from your Farcaster earnings</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-100 bg-yellow-50/50">
                <CardContent className="p-4 text-center space-y-2">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />
                  <h3 className="font-medium text-sm">Leaderboard</h3>
                  <p className="text-xs text-gray-600">Compete with other savers</p>
                </CardContent>
              </Card>
              <Card className="border-blue-100 bg-blue-50/50">
                <CardContent className="p-4 text-center space-y-2">
                  <Bell className="w-8 h-8 text-blue-500 mx-auto" />
                  <h3 className="font-medium text-sm">Smart Alerts</h3>
                  <p className="text-xs text-gray-600">Get notified about earnings</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How it Works */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-green-50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-center">How Your Vault Works</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    Connect your wallet and create a savings vault
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-gray-700">Set your savings percentage and duration</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm text-gray-700">Earn $BTS rewards as your vault grows</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
