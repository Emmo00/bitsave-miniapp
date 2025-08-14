import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Plus, User, PiggyBank } from "lucide-react";

type Props = {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
};

export default function BottomNavigation({ currentTab, setCurrentTab }: Props) {
  const currentTabNavButtonStyle =
    "text-white bg-weirdGreen hover:bg-gray-800 rounded-full";
  return (
    !["create", "settings"].includes(currentTab) && (
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
            className={`bg-weirdBlue hover:bg-weirdBlue-80 rounded-full w-12 h-12 p-0`}
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
    )
  );
}
