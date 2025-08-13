"use client";

import { useState } from "react";

import { Home, TrendingUp, Plus, User, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import HomePage from "@/components/pages/HomePage";
import CreatePlanPage from "@/components/pages/CreatePlanPage";

export default function App() {
  const currentTabNavButtonStyle =
    "text-white bg-blue-500 hover:bg-gray-800 rounded-full";
  const [currentTab, setCurrentTab] = useState<
    "home" | "ranking" | "create" | "vaults" | "settings"
  >("home");

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-br from-green-400 to-blue-500 font-grotesk">
      {currentTab === "home" && <HomePage setCurrentTab={setCurrentTab} />}
      {currentTab === "create" && (
        <CreatePlanPage setCurrentTab={setCurrentTab} />
      )}

      {/* Bottom Navigation */}
      {!["create", "settings"].includes(currentTab) && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs bg-black rounded-full px-6 py-3 shadow-lg transition-all duration-300 ease-out animate-slide-up">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-gray-800 rounded-full ${currentTab === "home" ? currentTabNavButtonStyle : ""}`}
              onClick={() => setCurrentTab("home")}
            >
              <Home className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-gray-800 rounded-full ${currentTab === "vaults" ? currentTabNavButtonStyle : ""}`}
              onClick={() => setCurrentTab("vaults")}
            >
              <PiggyBank className="w-6 h-6" />
            </Button>
            <Button
              size="sm"
              className={`bg-red-500 hover:bg-red-600 rounded-full w-12 h-12 p-0`}
              onClick={() => setCurrentTab("create")}
            >
              <Plus className="w-6 h-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-gray-800 rounded-full ${currentTab === "ranking" ? currentTabNavButtonStyle : ""}`}
              onClick={() => setCurrentTab("ranking")}
            >
              <TrendingUp className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-gray-800 rounded-full ${currentTab === "settings" ? currentTabNavButtonStyle : ""}`}
              onClick={() => setCurrentTab("settings")}
            >
              <User className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
