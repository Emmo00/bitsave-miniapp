"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate checking for unread notifications
    const checkNotifications = () => {
      const notifications = getNotifications();
      const unread = notifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    };

    checkNotifications();

    // Check for new notifications every 30 seconds
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    router.push("/notifications-panel");
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="relative hover:bg-purple-50"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}

// Mock notification data - in real app, this would come from your backend
function getNotifications() {
  return [
    {
      id: 1,
      type: "weekly_earnings",
      title: "Great week! 💸",
      message: "You earned 0.02 ETH (~$47) on Farcaster this week.",
      suggestedAmount: 14,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      actionable: true,
    },
    {
      id: 2,
      type: "bts_reward",
      title: "BTS Rewards Ready! 🎉",
      message: "You've earned 5.2 $BTS from your Creator Fund vault.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: false,
      actionable: true,
    },
    {
      id: 3,
      type: "social_motivator",
      title: "Friend Activity 👥",
      message: "cryptosaver.eth just saved $50 on Bitsave! Keep up the momentum.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      actionable: false,
    },
    {
      id: 4,
      type: "vault_milestone",
      title: "Milestone Reached! 🎯",
      message: "Your Creator Fund vault just hit 25% of your goal!",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      read: true,
      actionable: false,
    },
  ];
}
