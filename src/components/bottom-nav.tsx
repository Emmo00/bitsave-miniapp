"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Home, PiggyBank, Trophy, SettingsIcon } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
}

export function BottomNav({ currentPage }: BottomNavProps) {
  const router = useRouter();

  const navItems = [
    { id: "dashboard", label: "Home", icon: Home, path: "/dashboard" },
    { id: "my-vaults", label: "Vaults", icon: PiggyBank, path: "/my-vaults" },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      path: "/leaderboard",
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      path: "/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => router.push(item.path)}
              className={`flex-col space-y-1 h-16 ${
                isActive
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-purple-600" : ""}`} />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
