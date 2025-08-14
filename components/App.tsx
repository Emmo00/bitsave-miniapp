"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useParams } from "next/navigation";
import HomePage from "@/components/pages/HomePage";
import CreatePlanPage from "@/components/pages/CreatePlanPage";
import BottomNavigation from "@/components/navigation/BottomNavigation";

export default function App() {
  const params = useParams<{ tab: string }>();
  const [currentTab, setCurrentTab] = useState<
    "home" | "ranking" | "create" | "vaults" | "settings"
  >("home");

  useEffect(() => {
    if (params.tab) {
      setCurrentTab(params.tab as any);
    }
  }, [params.tab]);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="bg-[#f2f2f2] min-h-screen max-w-screen-sm font-grotesk mx-auto relative overflow-hidden">
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
        <div className="bubble bubble-6"></div>
      </div>
      
      <style jsx>{`
        .bubble {
          position: absolute;
          border-radius: 50%;
          opacity: 0.3;
          animation: float 8s ease-in-out infinite;
        }
        
        .bubble-1 {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 12s;
        }
        
        .bubble-2 {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10b981, #059669);
          top: 20%;
          right: 15%;
          animation-delay: -2s;
          animation-duration: 10s;
        }
        
        .bubble-3 {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          bottom: 30%;
          left: 5%;
          animation-delay: -4s;
          animation-duration: 14s;
        }
        
        .bubble-4 {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #1d4ed8, #06b6d4);
          top: 60%;
          right: 20%;
          animation-delay: -1s;
          animation-duration: 11s;
        }
        
        .bubble-5 {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #059669, #06b6d4);
          bottom: 15%;
          right: 10%;
          animation-delay: -3s;
          animation-duration: 13s;
        }
        
        .bubble-6 {
          width: 25px;
          height: 25px;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          top: 45%;
          left: 20%;
          animation-delay: -5s;
          animation-duration: 9s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translateY(-20px) translateX(10px) scale(1.1);
            opacity: 0.5;
          }
          66% {
            transform: translateY(10px) translateX(-15px) scale(0.9);
            opacity: 0.2;
          }
        }
      `}</style>
      
      <div className="w-full relative z-10">
        {currentTab === "home" && <HomePage setCurrentTab={setCurrentTab} />}
        {currentTab === "create" && (
          <CreatePlanPage setCurrentTab={setCurrentTab} />
        )}

        {/* Bottom Navigation */}
        <BottomNavigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
    </div>
  );
}
