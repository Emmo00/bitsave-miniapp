"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Plus,
  Download,
  Activity,
  Calendar,
  Coins,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TopUpModal from "@/components/modals/TopUpModal";
import WithdrawModal from "@/components/modals/WithdrawModal";
import type { SavingsPlan } from "@/types";
import { formatCurrency } from "@/utils";
import { getChainIdFromName } from "@/lib/tokenUtils";
import { ChainId } from "@/types";
import { useToast } from "@/hooks/useToast";

interface SavingsPlanDetailsPageProps {
  savingDetails: SavingsPlan | null;
  setCurrentTab: (tab: any) => void;
  onBack: () => void;
  onRefetch?: () => void;
}

interface ActivityItem {
  id: string;
  type: "created" | "topup" | "withdrawal" | "interest";
  amount?: string;
  currency?: string;
  timestamp: string;
  txHash?: string;
  description: string;
}

export default function SavingsPlanDetailsPage({
  savingDetails,
  setCurrentTab,
  onBack,
  onRefetch,
}: SavingsPlanDetailsPageProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const { success: showSuccessToast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const now = Math.floor(Date.now() / 1000);
    setCurrentTime(now);
  }, []);

  useEffect(() => {
    // scroll to top
    window.scroll({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (savingDetails && isClient && currentTime) {
      const mockActivities: ActivityItem[] = [
        {
          id: "1",
          type: "created",
          timestamp: new Date(savingDetails.startTime * 1000).toISOString(),
          description: "Savings plan created",
          amount: formatCurrency(savingDetails.amountInDollar),
          currency: savingDetails.token.name,
        },
        {
          id: "2",
          type: "topup",
          amount: "50",
          currency: savingDetails.token.name,
          timestamp: new Date(
            (currentTime - 7 * 24 * 60 * 60) * 1000
          ).toISOString(),
          description: "Top up deposit",
          txHash: "0x1234...5678",
        },
        {
          id: "3",
          type: "interest",
          amount: formatCurrency(6),
          currency: savingDetails.token.name,
          timestamp: new Date(
            (currentTime - 3 * 24 * 60 * 60) * 1000
          ).toISOString(),
          description: "Interest earned",
        },
      ];
      setActivities(
        mockActivities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    }
  }, [savingDetails, isClient, currentTime]);

  if (!savingDetails) {
    return (
      <div className="pt-[10vh] text-black pb-32">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl animate-fade-in-up">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">No savings plan selected</p>
          </div>
        </div>
      </div>
    );
  }

  const formatTimeRemaining = (timeToMaturity: number) => {
    if (timeToMaturity <= Date.now() / 1000) return "Matured";

    const now = Date.now() / 1000;
    const diffSec = Math.abs(now - timeToMaturity);

    const days = Math.floor(diffSec / (24 * 3600));
    const hours = Math.floor((diffSec % (24 * 3600)) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProgressPercentage = () => {
    if (!isClient || !currentTime) return 0;
    const totalDuration = savingDetails.maturityTime - savingDetails.startTime;
    const elapsed = currentTime - savingDetails.startTime;
    return Math.min((elapsed / totalDuration) * 100, 100);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "created":
        return <Coins className="w-4 h-4 text-blue-600" />;
      case "topup":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "withdrawal":
        return <Download className="w-4 h-4 text-orange-600" />;
      case "interest":
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
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

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>

      <div className="pt-[10vh] text-black pb-32">
        <div
          className={`bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl transition-opacity duration-300 ${
            isRefreshing ? "opacity-80" : "opacity-100"
          }`}
          style={{
            animation: "fadeInUp 0.4s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between py-2 px-1 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 text-gray-800" />
            </Button>
            <h1 className="text-xl font-bold flex-1 text-center mr-12">
              Plan Details
            </h1>
          </div>

          {/* Plan Header Card */}
          <Card
            className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden"
            style={{
              animation: "scaleIn 0.3s ease-out 0.1s both",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-weirdBlue/10 to-weirdGreen/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {savingDetails.name}
                  {isRefreshing && (
                    <span className="ml-2 text-sm text-orange-600 animate-pulse">
                      Updating...
                    </span>
                  )}
                </h2>
                <Badge
                  variant={savingDetails.isWithdrawn ? "default" : "secondary"}
                  className={`${
                    savingDetails.isWithdrawn
                      ? "bg-green-100/80 text-green-800 border-green-200"
                      : "bg-gray-100/80 text-gray-800 border-gray-200"
                  } backdrop-blur-sm`}
                >
                  {!savingDetails.isWithdrawn ? "Active" : "Completed"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-weirdBlue" />
                    <span className="text-sm text-gray-600">Total Amount</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {savingDetails.formattedAmount} {savingDetails.token.name}
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-weirdGreen" />
                    <span className="text-sm text-gray-600">
                      Interest Earned
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {1} {"BTS"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Progress & Time Section */}
          <Card
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg"
            style={{
              animation: "fadeInUp 0.3s ease-out 0.2s both",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-weirdBlue" />
              <span className="text-sm font-medium text-gray-700">
                Maturity Progress
              </span>
            </div>

            <Progress
              value={getProgressPercentage()}
              className="h-3 bg-white/30 backdrop-blur-sm border border-white/30 mb-3"
            />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-600">Time Remaining</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatTimeRemaining(savingDetails.maturityTime)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Matures On</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(
                    savingDetails.maturityTime * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Plan Details Grid */}
          <div
            className="grid grid-cols-2 gap-4 mb-6"
            style={{
              animation: "fadeInUp 0.3s ease-out 0.3s both",
            }}
          >
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                  <span className="text-xs font-medium text-orange-700">
                    CELO
                  </span>
                </div>
                <span className="text-sm text-gray-600">Chain</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Celo Network
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Penalty Fee</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {savingDetails.penaltyPercentage}%
              </p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div
            className="flex gap-3 mb-6"
            style={{
              animation: "fadeInUp 0.3s ease-out 0.4s both",
            }}
          >
            {!savingDetails.isWithdrawn && (
              <WithdrawModal
                planName={savingDetails.name}
                tokenSymbol={savingDetails.token.name}
                tokenAddress={savingDetails.token.address}
                chainId={
                  getChainIdFromName(savingDetails.token.chain) as ChainId
                }
                totalAmount={savingDetails.formattedAmount}
                isMatured={savingDetails.maturityTime < Date.now() / 1000}
                penaltyPercentage={savingDetails.penaltyPercentage}
                maturityDate={new Date(savingDetails.maturityTime * 1000)}
                onWithdraw={() => {
                  // Handle the withdraw action here
                  console.log(`Withdrew from ${savingDetails.name}`);
                }}
                onRefetch={async () => {
                  if (onRefetch) {
                    setIsRefreshing(true);
                    try {
                      await onRefetch();
                      showSuccessToast("Updated!", "Savings plan data refreshed");
                    } catch (error) {
                      console.error("Error refreshing data:", error);
                    } finally {
                      setIsRefreshing(false);
                    }
                  }
                }}
              >
                <Button
                  variant="outline"
                  className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 text-gray-800 font-medium py-3 rounded-xl"
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </WithdrawModal>
            )}

            {savingDetails.maturityTime > Date.now() / 1000 && (
              <TopUpModal
                planName={savingDetails.name}
                tokenSymbol={savingDetails.token.name}
                tokenAddress={savingDetails.token.address}
                chainId={
                  getChainIdFromName(savingDetails.token.chain) as ChainId
                }
                onTopUp={(amount) => {
                  // Handle the top up action here - could trigger a refetch of savings data
                  console.log(
                    `Topped up ${amount} ${savingDetails.token.name} to ${savingDetails.name}`
                  );
                }}
                onRefetch={async () => {
                  if (onRefetch) {
                    setIsRefreshing(true);
                    try {
                      await onRefetch();
                      showSuccessToast("Updated!", "Savings plan data refreshed");
                    } catch (error) {
                      console.error("Error refreshing data:", error);
                    } finally {
                      setIsRefreshing(false);
                    }
                  }
                }}
              >
                <Button
                  className="flex-1 bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white font-medium py-3 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Top Up
                </Button>
              </TopUpModal>
            )}
          </div>

          {/* Activities Section */}
          <Card
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg"
            style={{
              animation: "fadeInUp 0.3s ease-out 0.5s both",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-weirdBlue" />
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Activity
              </h3>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 hover:bg-white/25 transition-all duration-200"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${0.1 * index}s both`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {activity.type === "withdrawal" ? "-" : "+"}
                          {activity.amount} {activity.currency}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activities yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
