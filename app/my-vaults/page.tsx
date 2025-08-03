"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, PiggyBank, Coins, TrendingUp, Plus, Loader } from "lucide-react";
import { BottomNav } from "../../components/bottom-nav";
import { useActiveSavings } from "../../hooks/useActiveSavings";
import { useCompletedSavings } from "../../hooks/useCompletedSavings";
import { getTokenInfo } from "../../lib/tokenUtils";
import Image from "next/image";

export default function MyVaults() {
  const router = useRouter();
  
  const { 
    activeSavings, 
    totalActiveSavings, 
    isLoading: activeLoading, 
    error: activeError 
  } = useActiveSavings();
  
  const { 
    completedSavings, 
    totalCompletedSavings, 
    isLoading: completedLoading, 
    error: completedError 
  } = useCompletedSavings();

  const isLoading = activeLoading || completedLoading;
  const error = activeError || completedError;

  // Helper function to format time remaining
  const formatTimeRemaining = (timeToMaturity: number) => {
    if (timeToMaturity <= 0) return "Matured";
    const days = Math.floor(timeToMaturity / (24 * 3600));
    const hours = Math.floor((timeToMaturity % (24 * 3600)) / 3600);
    return `${days}d ${hours}h left`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">My Vaults</h1>
              <p className="text-sm text-gray-600">
                {isLoading ? (
                  <span className="flex items-center space-x-1">
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>Loading...</span>
                  </span>
                ) : error ? (
                  "Error loading vaults"
                ) : (
                  `${totalActiveSavings} active, ${totalCompletedSavings} completed`
                )}
              </p>
            </div>
            <Button
              size="icon"
              onClick={() => router.push("/create-vault")}
              className="bg-green-500 hover:bg-green-600 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center space-y-4">
                <Loader className="w-8 h-8 text-purple-500 mx-auto animate-spin" />
                <p className="text-gray-600">Loading your vaults...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <p className="text-red-600">Error loading vaults: {error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Active Vaults */}
          {!isLoading && !error && activeSavings.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-purple-500" />
                <span>Active Vaults</span>
              </h2>

              {activeSavings.map((saving) => {
                const tokenInfo = getTokenInfo(saving.tokenId);
                
                return (
                  <Card key={saving.name} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900">{saving.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                              {tokenInfo.image && (
                                <Image
                                  src={`/${tokenInfo.image}`}
                                  alt={tokenInfo.name}
                                  width={12}
                                  height={12}
                                  className="rounded-full"
                                />
                              )}
                              <span>{tokenInfo.symbol}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {saving.isSafeMode ? "Safe Mode" : "Direct"}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          className={
                            saving.isMatured 
                              ? "bg-blue-100 text-blue-700 border-blue-200" 
                              : "bg-green-100 text-green-700 border-green-200"
                          }
                        >
                          {saving.isMatured ? "Ready" : "Active"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Amount Saved</span>
                          <span className="font-medium">
                            ${parseFloat(saving.amountFormatted).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Time remaining:</span>
                          <span>{formatTimeRemaining(saving.timeToMaturity)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="text-green-600 font-medium">
                            +{parseFloat(saving.interestFormatted).toFixed(3)} $BTS
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/top-up?vault=${encodeURIComponent(saving.name)}`)}
                            className="text-xs"
                          >
                            Top Up
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            onClick={() => {
                              // TODO: Implement withdraw functionality
                              alert(`Withdraw from ${saving.name} - Coming soon!`);
                            }}
                          >
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Completed Vaults */}
          {!isLoading && !error && completedSavings.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Completed Vaults</span>
              </h2>

              {completedSavings.map((saving) => {
                const tokenInfo = getTokenInfo(saving.tokenId);
                
                return (
                  <Card key={saving.name} className="border-green-200 bg-green-50/30">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900">{saving.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                              {tokenInfo.image && (
                                <Image
                                  src={`/${tokenInfo.image}`}
                                  alt={tokenInfo.name}
                                  width={12}
                                  height={12}
                                  className="rounded-full"
                                />
                              )}
                              <span>{tokenInfo.symbol}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Withdrawn
                            </Badge>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white">Completed ✓</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Final Amount</span>
                          <span className="font-bold text-green-600">
                            ${parseFloat(saving.amountFormatted).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="text-green-600 font-medium">
                            +{parseFloat(saving.interestFormatted).toFixed(3)} $BTS earned
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs text-gray-500">
                          Already Claimed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && activeSavings.length === 0 && completedSavings.length === 0 && (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-8 text-center space-y-4">
                <PiggyBank className="w-12 h-12 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">No vaults yet</h3>
                  <p className="text-gray-600 text-sm">
                    Create your first savings vault to get started
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/create-vault")}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Create Your First Vault
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        <BottomNav currentPage="my-vaults" />
      </div>
    </div>
  );
}
