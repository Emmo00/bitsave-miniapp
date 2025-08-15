"use client";

import { TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import type { MiniAppSDK } from "@farcaster/miniapp-sdk/dist/types";
import SavingsPlanDetailsPage from "./SavingsPlanDetailsPage";
import { useSavings } from "@/hooks/useActiveSavings";
import { useAccount, useConnect } from "wagmi";
import { formatCurrency } from "@/utils";

export default function HomePage({
  setCurrentTab,
}: {
  setCurrentTab: (tab: any) => void;
}) {
  const [selectedSaving, setSelectedSaving] = useState<SavingsPlan | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [userContext, setUserContext] = useState<Awaited<
    MiniAppSDK["context"]
  > | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // hook
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const {
    isLoading,
    totalAmountInSavings,
    savings,
    activeSavings,
    withdrawnSavings,
    error,
  } = useSavings(address!);

  useEffect(() => {
    setIsClient(true);
    const now = Math.floor(Date.now() / 1000);
    setCurrentTime(now);
  }, []);

  useEffect(() => {
    if (!userContext) (async () => setUserContext(await sdk.context))();
    console.log("user active savings", activeSavings);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      connect({
        connector: connectors[0],
      });
    }
  }, [userContext]);

  useEffect(() => {
    console.log("Active saving plans", activeSavings);
  }, [activeSavings]);

  const handleCardClick = (saving: SavingsPlan) => {
    setSelectedSaving(saving);
    setShowDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowDetails(false);
    setSelectedSaving(null);
  };

  if (showDetails) {
    return (
      <SavingsPlanDetailsPage
        savingDetails={selectedSaving}
        setCurrentTab={setCurrentTab}
        onBack={handleBackFromDetails}
      />
    );
  }
  return (
    <>
      <style jsx>{`
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/** Main Content */}
      <div className="pb-32">
        {/** Profile Section */}
        <div className="flex items-center justify-center">
          <div
            className="flex items-center gap-2 mb-8 mt-4 bg-white rounded-full cursor-pointer animate-fade-in-down shadow-lg"
            onClick={() => setCurrentTab("settings")}
            style={{
              animation: "fadeInDown 0.3s ease-out",
            }}
          >
            <Avatar className="w-[1.5rem] h-[1.5rem] ml-[0.15rem]">
              <AvatarImage src={userContext?.user.pfpUrl} />
              <AvatarFallback className="bg-orange-500 text-white">
                {userContext?.user?.displayName?.at(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-black font-medium text-xs my-2 mr-2">
              {userContext?.user.username}
            </span>
          </div>
        </div>

        {/* Total in Savings */}
        <div
          className="text-center mb-8"
          style={{
            animation: "fadeIn 1s ease-out 0.3s both",
          }}
        >
          <p className="text-gray-600 text-sm mb-2">Total savings</p>
          <h1 className="text-black text-4xl font-bold mb-1">
            {formatCurrency(totalAmountInSavings)}
          </h1>
          <p className="flex justify-center text-black text-xs opacity-70">
            20% since last month{" "}
            <TrendingUp className="w-4 h-4 text-green-500 bg-white rounded-full" />
          </p>
        </div>

        {/* Saving Plans */}
        <div className="px-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold pb-2 pl-4 text-black">
              Active Saving Plans
            </h1>
            <button
              className="pr-4 text-black"
              onClick={() => setCurrentTab("vaults")}
            >
              see all
            </button>
          </div>
          {activeSavings.map((saving, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
              style={{
                animation: `fadeInUp 0.3s ease-out ${0.3 + index * 0.1}s both`,
              }}
              onClick={() => handleCardClick(saving)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-gray-800 font-medium mb-1">
                    {saving.name}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {formatCurrency(saving.amount)} {saving.currency}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                    <div className="text-xs py-1 px-2">
                      <span>{saving.currency}</span> on{" "}
                      <span>{saving.chain}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Progress
                value={
                  isClient && currentTime
                    ? Math.min(
                        ((currentTime - saving.startTime) /
                          (saving.maturityTime - saving.startTime)) *
                          100,
                        100
                      )
                    : 0
                }
                className="h-2 bg-white/20 backdrop-blur-sm border border-white/30"
              />
              <div className="flex justify-between pt-2">
                <span></span>
                <span className="text-xs text-green-600">
                  Matures:{" "}
                  {isClient
                    ? new Date(saving.maturityTime * 1000).toLocaleDateString()
                    : "Loading..."}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
