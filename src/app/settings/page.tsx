"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Wallet, Coins, LogOut, User } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

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
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your preferences</p>
            </div>
          </div>

          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">creator.eth</p>
                  <p className="text-sm text-gray-600">Connected via Farcaster</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Enable Notifications</p>
                  <p className="text-sm text-gray-600">
                    Get notified about earnings and savings opportunities
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Auto Save */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Auto-Save</p>
                  <p className="text-sm text-gray-600">
                    Automatically save a percentage of earnings
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} disabled />
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-gray-600" />
                <span>Wallet Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-green-600">$334</p>
                  <p className="text-sm text-gray-600">Total Saved</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-yellow-600">16.7</p>
                  <p className="text-sm text-gray-600">$BTS Earned</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Connected Wallets</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">0x1234...5678</p>
                        <p className="text-xs text-gray-600">Base Network</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Primary
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Coins className="w-5 h-5 text-gray-600" />
                <span>Token Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Preferred Tokens</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    USDC
                  </Badge>
                  <Badge variant="outline">ETH</Badge>
                  <Badge variant="outline">DEGEN</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Preferred Networks</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Base
                  </Badge>
                  <Badge variant="outline">Celo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-red-200">
            <CardContent className="p-4 space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">Bitsave v1.0.0 • Built for Farcaster</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNav currentPage="settings" />
      </div>
    </div>
  );
}
