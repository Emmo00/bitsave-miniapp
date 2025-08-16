"use client";

import { ChevronDown, Plus, TrendingUp, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import SavingsPlanDetailsPage from "./SavingsPlanDetailsPage";
import { useAccount, useConnect } from "wagmi";
import { useSavings } from "@/hooks/useActiveSavings";
import type { SavingsPlan } from "@/types";

// vaults = "saving plans"
type Props = {
  setCurrentTab: (tab: any) => void;
};

export default function VaultsPage({ setCurrentTab }: Props) {
  const [selectedSaving, setSelectedSaving] = useState<SavingsPlan | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showActiveSavings, setShowActiveSavings] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const {
    isLoading: isFetchingSavings,
    activeSavings,
    withdrawnSavings,
  } = useSavings(address!);

  useEffect(() => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connect]);

  useEffect(() => {
    setIsClient(true);
    const now = Math.floor(Date.now() / 1000);
    setCurrentTime(now);
  }, []);

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

      <div className="pt-[10vh] text-black pb-32">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl animate-fade-in-up">
          <div className="flex justify-between py-2 px-1">
            <h1 className="text-2xl font-bold">Savings Plans</h1>
            <button
              type="button"
              aria-label="Close"
              className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
              onClick={() => setCurrentTab("home")}
            >
              <X className="w-4 h-4 text-gray-800" />
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant="default"
              className={`flex-1 outline-none ${showActiveSavings ? "pointer-events-none opacity-50  bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white hover:bg-weirdGreen-90 shadow-lg" : "bg-f2f2f2 text-black hover:bg-weirdGreen"}`}
              onClick={() => setShowActiveSavings(true)}
              disabled={isFetchingSavings || showActiveSavings}
            >
              Active
            </Button>
            <Button
              variant="default"
              className={`flex-1 ${!showActiveSavings ? "pointer-events-none opacity-50  bg-gradient-to-r from-weirdBlue-80 to-weirdBlue text-white hover:bg-weirdBlue-90 shadow-lg" : "bg-f2f2f2 text-black hover:bg-weirdBlue"} ${
                !isFetchingSavings && withdrawnSavings.length > 0
                  ? "bg-weirdBlue text-white"
                  : ""
              }`}
              onClick={() => setShowActiveSavings(false)}
              disabled={isFetchingSavings || !showActiveSavings}
            >
              Completed
            </Button>
          </div>

          {/* Active Savings Plans List */}
          {!isFetchingSavings &&
            showActiveSavings &&
            activeSavings.map((saving: SavingsPlan, index: number) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${0.1 * (index + 1)}s both`,
                }}
                onClick={() => handleCardClick(saving)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-gray-800 font-medium mb-1">
                      {saving.name}
                    </h3>
                    <p className="text-[0.7rem]">
                      created:{" "}
                      {new Date(saving.startTime * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 text-sm mt-2">
                      {saving.formattedAmount} {saving.token.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                      <div className="text-xs py-1 px-2">
                        <span>{saving.token.name}</span> on{" "}
                        <span>{saving.token.chain}</span>
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
                  className="h-4 bg-white/20 backdrop-blur-sm border border-white/30"
                />
                <div className="flex justify-between pt-2">
                  <span></span>
                  <span className="text-xs text-green-600">
                    Matures:{" "}
                    {isClient
                      ? new Date(
                          saving.maturityTime * 1000
                        ).toLocaleDateString()
                      : "Loading..."}
                  </span>
                </div>
              </Card>
            ))}

          {/* Withdrawn Savings Plans List */}
          {!isFetchingSavings &&
            !showActiveSavings &&
            withdrawnSavings.map((saving: SavingsPlan, index: number) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${0.1 * (index + 1)}s both`,
                }}
                onClick={() => handleCardClick(saving)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-gray-800 font-medium mb-1">
                      {saving.name}
                    </h3>
                    <p className="text-[0.7rem]">
                      created:{" "}
                      {new Date(saving.startTime * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 text-sm mt-2">
                      {saving.formattedAmount} {saving.token.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                      <div className="text-xs py-1 px-2">
                        <span>{saving.token.name}</span> on{" "}
                        <span>{saving.token.chain}</span>
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
                  className="h-4 bg-white/20 backdrop-blur-sm border border-white/30"
                />
                <div className="flex justify-between pt-2">
                  <span></span>
                  {isClient && saving.maturityTime > currentTime! ? (
                    <span className="text-xs text-green-600">
                      Matures:{" "}
                      {isClient
                        ? new Date(
                            saving.maturityTime * 1000
                          ).toLocaleDateString()
                        : "Loading..."}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">Matured</span>
                  )}
                </div>
              </Card>
            ))}

          {/* No Active Savings Plans Message */}
          {!isFetchingSavings &&
            showActiveSavings &&
            activeSavings.length === 0 && (
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Savings Plans Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first savings plan to start building your future!
                </p>
                <Button
                  onClick={() => setCurrentTab("create")}
                  className="bg-gradient-to-r from-weirdBlue to-weirdGreen text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Savings Plan
                </Button>
              </div>
            )}

          {/* No Withdrawn Savings Plans List */}
          {!isFetchingSavings &&
            withdrawnSavings.length === 0 &&
            !showActiveSavings && (
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Withdrawn Savings Plans Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first savings plan to start building your future!
                </p>
                <Button
                  onClick={() => setCurrentTab("create")}
                  className="bg-gradient-to-r from-weirdBlue to-weirdGreen text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Savings Plan
                </Button>
              </div>
            )}

          {/* Loader */}
          {isFetchingSavings && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Loading Savings Plans...
              </h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
