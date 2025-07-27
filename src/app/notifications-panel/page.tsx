"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Bell, TrendingUp, Coins, Users, Target, PiggyBank, Plus } from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  suggestedAmount?: number;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
}

export default function NotificationsPanel() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [saveAmount, setSaveAmount] = useState("");
  const [selectedVault, setSelectedVault] = useState<string>("");

  const mockVaults = [
    { id: "1", name: "Creator Fund", saved: 245, target: 1000, token: "USDC" },
    {
      id: "2",
      name: "Equipment Upgrade",
      saved: 89,
      target: 500,
      token: "ETH",
    },
  ];

  useEffect(() => {
    const notificationData = getNotifications();
    setNotifications(notificationData);

    // Mark all as read when panel is opened
    setTimeout(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, 1000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "weekly_earnings":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "bts_reward":
        return <Coins className="w-5 h-5 text-yellow-500" />;
      case "social_motivator":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "vault_milestone":
        return <Target className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const handleSaveNow = (notification: Notification) => {
    setSelectedNotification(notification);
    setSaveAmount(notification.suggestedAmount?.toString() || "");
    setShowSaveModal(true);
  };

  const handleSaveToVault = () => {
    if (selectedVault) {
      router.push(`/top-up?vault=${selectedVault}&amount=${saveAmount}`);
    }
    setShowSaveModal(false);
  };

  const handleCreateNewVault = () => {
    router.push(`/create-vault?initialAmount=${saveAmount}`);
    setShowSaveModal(false);
  };

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
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600">Stay updated on your savings journey</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
              className="text-purple-600"
            >
              Mark all read
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-8 text-center space-y-4">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">All caught up!</h3>
                    <p className="text-gray-600 text-sm">No new notifications right now</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${
                    !notification.read ? "border-purple-200 bg-purple-50/30" : "border-gray-200"
                  } hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-700">{notification.message}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </div>

                        {notification.actionable && notification.type === "weekly_earnings" && (
                          <div className="flex items-center space-x-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNow(notification)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              💾 Save Now (${notification.suggestedAmount})
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push("/notifications")}
                              className="bg-transparent"
                            >
                              View Details
                            </Button>
                          </div>
                        )}

                        {notification.actionable && notification.type === "bts_reward" && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                              🎉 Claim Reward
                            </Button>
                          </div>
                        )}

                        {notification.type === "vault_milestone" && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push("/my-vaults")}
                              className="bg-transparent border-purple-300 text-purple-600"
                            >
                              🎯 View Vault
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-green-50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-purple-500" />
                <span>Stay on Track</span>
              </h4>
              <p className="text-sm text-gray-700">
                Enable notifications to never miss earning opportunities and savings reminders.
              </p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="bg-transparent">
                  Notification Settings
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/create-vault")}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Create Vault
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Modal */}
        <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-green-500" />
                <span>Save Your Earnings</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Save</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    value={saveAmount}
                    onChange={(e) => setSaveAmount(e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500">Suggested: 30% of your weekly earnings</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Choose an option:</h4>

                {/* Existing Vaults */}
                <div className="space-y-2">
                  {mockVaults.map((vault) => (
                    <Card
                      key={vault.id}
                      className={`cursor-pointer transition-colors ${
                        selectedVault === vault.id
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 hover:border-green-200"
                      }`}
                      onClick={() => setSelectedVault(vault.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{vault.name}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {vault.token}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Current: ${vault.saved}</span>
                            <span>Target: ${vault.target}</span>
                          </div>
                          <Progress value={(vault.saved / vault.target) * 100} className="h-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSaveToVault}
                    disabled={!selectedVault || !saveAmount}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    💾 Save to Selected Vault
                  </Button>

                  <Button
                    onClick={handleCreateNewVault}
                    disabled={!saveAmount}
                    variant="outline"
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Vault
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Mock notification data - same as in notification-bell.tsx
function getNotifications() {
  return [
    {
      id: 1,
      type: "weekly_earnings",
      title: "Great week! 💸",
      message: "You earned 0.02 ETH (~$47) on Farcaster this week.",
      suggestedAmount: 14,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      actionable: true,
    },
    {
      id: 2,
      type: "bts_reward",
      title: "BTS Rewards Ready! 🎉",
      message: "You've earned 5.2 $BTS from your Creator Fund vault.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false,
      actionable: true,
    },
    {
      id: 3,
      type: "social_motivator",
      title: "Friend Activity 👥",
      message: "cryptosaver.eth just saved $50 on Bitsave! Keep up the momentum.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
      actionable: false,
    },
    {
      id: 4,
      type: "vault_milestone",
      title: "Milestone Reached! 🎯",
      message: "Your Creator Fund vault just hit 25% of your goal!",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      read: true,
      actionable: false,
    },
  ];
}
