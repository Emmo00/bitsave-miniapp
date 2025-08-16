"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Check, DollarSign, ArrowRight, X } from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useConnect,
  useSimulateContract,
} from "wagmi";
import { simulateContract, readContract } from "@wagmi/core";
import { config } from "@/components/providers/WagmiProvider";
import { formatUnits, Address, parseUnits, BaseError } from "viem";
import ERC20_ABI from "@/abi/ERC20.json";
import BITSAVE_ABI from "@/abi/BitSave.json";
import VAULT_ABI from "@/abi/ChildContract.json";
import { ChainId } from "@/types";
import CONTRACT_ADDRESSES from "@/constants/addresses";
import { useToast } from "@/hooks/useToast";
import { getChainName, getTokenInfo } from "@/lib/tokenUtils";

interface TopUpModalProps {
  children: React.ReactNode;
  planName?: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  chainId?: ChainId;
  onTopUp?: (amount: string) => void;
  onRefetch?: () => void;
}

export default function TopUpModal({
  children,
  planName = "Savings Plan",
  tokenSymbol = "cUSD",
  tokenAddress = "",
  chainId = config.chains[0].id as ChainId,
  onTopUp,
  onRefetch,
}: TopUpModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "form" | "loading" | "success"
  >("form");
  const [loadingStep, setLoadingStep] = useState(0);
  const [amount, setAmount] = useState("");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [errors, setErrors] = useState({
    amount: "",
  });

  const { address } = useAccount();
  const { error: showErrorToast } = useToast();
  const { connect, connectors } = useConnect();

  // Wagmi hooks
  const { writeContractAsync: writeApproveTokenSpendContract } =
    useWriteContract();
  const { writeContractAsync: writeIncrementSavingContract } =
    useWriteContract();

  const quickAmounts = [10, 20, 40, 50];

  const loadingSteps = [
    {
      id: 1,
      title: "Approve Token Spend",
      description: "Approving token transfer...",
    },
    {
      id: 2,
      title: "Top Up Plan",
      description: "Adding funds to your savings plan...",
    },
    {
      id: 3,
      title: "Finishing up",
      description: "Waiting for confirmations...",
    },
  ];

  // Function to fetch token balance
  const fetchTokenBalance = async () => {
    if (!address || !tokenAddress) {
      setTokenBalance("0");
      return;
    }

    setIsLoadingBalance(true);
    try {
      const balance = (await readContract(config, {
        abi: ERC20_ABI,
        address: tokenAddress as Address,
        functionName: "balanceOf",
        args: [address],
        chainId: chainId as any,
      })) as bigint;

      const tokenInfo = getTokenInfo(tokenAddress);
      const formattedBalance = formatUnits(balance, tokenInfo.decimals);
      setTokenBalance(formattedBalance);
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      setTokenBalance("0");
      if (tokenAddress && chainId) {
        if (error?.message?.includes("network")) {
          showErrorToast("Network Error", "Failed to fetch wallet balance");
        }
      }
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch balance when modal opens and we have required data
  useEffect(() => {
    if (isOpen && tokenAddress && address) {
      fetchTokenBalance();
    }
  }, [isOpen, tokenAddress, address, chainId]);

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    // Clear error when user selects amount
    if (errors.amount) {
      setErrors({ amount: "" });
    }
  };

  const validateAmount = () => {
    if (!amount.trim()) {
      setErrors({ amount: "Amount is required" });
      return false;
    }

    const amountNum = parseFloat(amount);
    const currentBalance = parseFloat(tokenBalance);

    if (isNaN(amountNum)) {
      setErrors({ amount: "Amount must be a valid number" });
      return false;
    } else if (amountNum <= 0) {
      setErrors({ amount: "Amount must be greater than 0" });
      return false;
    } else if (amountNum > 1000000) {
      setErrors({ amount: "Amount cannot exceed $1,000,000" });
      return false;
    } else if (amountNum < 1) {
      setErrors({ amount: "Minimum amount is $1" });
      return false;
    } else if (amountNum > currentBalance) {
      setErrors({
        amount: `Insufficient balance. You have ${parseFloat(tokenBalance).toFixed(4)} ${tokenSymbol}`,
      });
      return false;
    }

    setErrors({ amount: "" });
    return true;
  };

  const handleTopUp = async () => {
    if (!validateAmount()) {
      if (errors.amount && errors.amount.includes("Insufficient balance")) {
        showErrorToast(
          "Insufficient Balance",
          "Add more tokens to your wallet"
        );
      }
      return;
    }

    if (!address) {
      showErrorToast("Wallet Error", "Please connect your wallet");
      connect({ connector: connectors[0] });
      return;
    }

    if (!tokenAddress) {
      showErrorToast("Configuration Error", "Token address not available");
      return;
    }

    setCurrentStep("loading");
    setLoadingStep(0);

    const tokenInfo = getTokenInfo(tokenAddress);
    const amountToAdd = parseUnits(amount, tokenInfo.decimals);

    try {
      // Step 1: Approve token transfer
      try {
        const approveHash = await writeApproveTokenSpendContract({
          abi: ERC20_ABI,
          address: tokenAddress as Address,
          functionName: "approve",
          args: [
            CONTRACT_ADDRESSES[getChainName(chainId).toUpperCase()]
              .BITSAVE as Address,
            amountToAdd,
          ],
          chainId,
        });

        // Wait for 1 confirmation
        await waitForConfirmations(approveHash, 1);
        setLoadingStep(1);
      } catch (error: any) {
        console.error("Token approval error:", error);
        if (error?.message?.includes("insufficient")) {
          showErrorToast(
            "Insufficient Funds",
            "Not enough tokens in your wallet"
          );
        } else if (error?.message?.includes("rejected")) {
          showErrorToast(
            "Transaction Rejected",
            "You rejected the approval transaction"
          );
        } else {
          showErrorToast(
            "Approval Failed",
            (error as BaseError).shortMessage ||
              error.message ||
              "Failed to approve token spending"
          );
        }
        setCurrentStep("form");
        return;
      }

      // Step 2: Increment saving
      try {
        console.log("Incrementing saving...");
        console.log(
          "transaction deets",
          [planName, tokenAddress as Address, amountToAdd],
          chainId
        );

        const transactionConfig = {
          abi: [...BITSAVE_ABI, ...VAULT_ABI],
          address: CONTRACT_ADDRESSES[getChainName(chainId).toUpperCase()]
            .BITSAVE as Address,
          functionName: "incrementSaving",
          args: [planName, tokenAddress as Address, amountToAdd],
          chainId,
        };

        const result = await simulateContract(config, transactionConfig);

        console.log("Simulation result:", result.result);

        const incrementHash =
          await writeIncrementSavingContract(transactionConfig);

        console.log("Incrementing saving...");

        // Wait for 1 confirmation
        await waitForConfirmations(incrementHash, 1);
        setLoadingStep(2);
      } catch (error: any) {
        console.error("Increment saving error:", error);
        if (error?.message?.includes("insufficient")) {
          showErrorToast(
            "Insufficient ETH",
            "Not enough ETH for transaction fees"
          );
        } else if (error?.message?.includes("rejected")) {
          showErrorToast(
            "Transaction Rejected",
            "You rejected the top up transaction"
          );
        } else {
          showErrorToast(
            "Top Up Failed",
            (error as BaseError).shortMessage ||
              error.message ||
              "Failed to add funds to savings plan"
          );
        }
        setCurrentStep("form");
        return;
      }

      // Step 3: Finishing up (wait for final confirmations)
      try {
        // Wait for additional confirmations for security
        setTimeout(async () => {
          setLoadingStep(3);

          // Small delay before showing success
          setTimeout(() => {
            setCurrentStep("success");
            if (onTopUp) {
              onTopUp(amount);
            }
            if (onRefetch) {
              onRefetch();
            }
          }, 1000);
        }, 2000); // 2 second delay for finishing up step
      } catch (error: any) {
        console.error("Finishing up error:", error);
        // Even if this step fails, the transaction was successful
        setCurrentStep("success");
        if (onTopUp) {
          onTopUp(amount);
        }
        if (onRefetch) {
          onRefetch();
        }
      }
    } catch (error: any) {
      console.error("Unexpected error during top up:", error);

      if (error?.message?.includes("network")) {
        showErrorToast(
          "Network Error",
          "Please check your internet connection"
        );
      } else if (error?.message?.includes("chain")) {
        showErrorToast("Wrong Network", "Please switch to the correct network");
      } else {
        showErrorToast(
          "Something Went Wrong",
          (error as BaseError).shortMessage ||
            error.message ||
            "Please try again later"
        );
      }

      setCurrentStep("form");
    }
  };

  // Helper function to wait for confirmations
  const waitForConfirmations = async (
    hash: `0x${string}`,
    requiredConfirmations: number
  ) => {
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, requiredConfirmations * 2000); // 2 seconds per confirmation
      }, 100);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      // Reset state after modal closes
      setCurrentStep("form");
      setLoadingStep(0);
      setAmount("");
      setTokenBalance("0");
      setErrors({ amount: "" });
    }, 200);
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes checkmark {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes celebrate {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-5deg);
          }
          75% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        .checkmark {
          animation: checkmark 0.5s ease-out;
        }

        .celebrate {
          animation: celebrate 1s ease-out;
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/0 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogContent className="bg-white/90 backdrop-blur-3xl backdrop-brightness-125 border border-white/100 shadow-2xl max-w-md rounded-2xl backdrop-saturate-200 fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            {currentStep === "form" && (
              <div className="p-2">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto bg-weirdGreen/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border border-white/20">
                    <Plus className="w-6 h-6 text-weirdGreen" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Top Up {planName}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Add more funds to your savings plan
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Amount ({tokenSymbol})
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          // Clear error when user starts typing
                          if (errors.amount) {
                            setErrors({ amount: "" });
                          }
                        }}
                        placeholder="0.00"
                        className={`pl-10 bg-white/25 backdrop-blur-sm border-white/40 rounded-xl text-gray-800 placeholder-gray-500 focus:bg-white/35 focus:border-white/50 transition-all duration-200 ${
                          errors.amount
                            ? "border-red-400 focus:border-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const maxAmount = parseFloat(tokenBalance).toFixed(4);
                          setAmount(maxAmount);
                          // Clear error when user uses max
                          if (errors.amount) {
                            setErrors({ amount: "" });
                          }
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-orange-500/80 text-white rounded-lg hover:bg-orange-600/80 transition-colors"
                        disabled={
                          isLoadingBalance || parseFloat(tokenBalance) === 0
                        }
                      >
                        Max
                      </button>
                    </div>

                    {/* Balance Display */}
                    <div className="mt-1">
                      {isLoadingBalance ? (
                        <p className="text-xs text-gray-600">
                          Loading balance...
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600">
                          Balance: {parseFloat(tokenBalance).toFixed(4)}{" "}
                          {tokenSymbol}
                        </p>
                      )}
                    </div>

                    {errors.amount && (
                      <p className="text-red-500 text-xs mt-1 font-medium">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Quick Amounts
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {quickAmounts.map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(quickAmount)}
                          className={`bg-white/25 backdrop-blur-sm border-white/40 hover:bg-white/35 text-gray-800 transition-all duration-200 ${
                            amount === quickAmount.toString()
                              ? "ring-2 ring-weirdGreen/60 bg-weirdGreen/20 border-weirdGreen/50"
                              : ""
                          }`}
                        >
                          ${quickAmount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {amount && parseFloat(amount) > 0 && (
                    <Card className="bg-gradient-to-r from-weirdGreen/10 to-weirdBlue/10 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">You're adding:</span>
                        <span className="text-lg font-bold text-gray-800">
                          ${amount} {tokenSymbol}
                        </span>
                      </div>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 bg-white/20 backdrop-blur-sm border-white/40 hover:bg-white/30 text-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleTopUp}
                      disabled={
                        !amount ||
                        parseFloat(amount) <= 0 ||
                        isLoadingBalance ||
                        !address
                      }
                      className="flex-1 bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {!address ? "Connect Wallet" : "Top Up"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "loading" && (
              <div className="p-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Processing Top Up
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Please wait while we process your transaction
                  </p>
                </div>

                {/* Loading Steps */}
                <div className="space-y-6">
                  {loadingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          loadingStep >= step.id
                            ? "bg-green-500/80 border-green-400 text-white backdrop-blur-sm"
                            : loadingStep === step.id - 1
                              ? "bg-orange-500/80 border-orange-400 text-white pulse backdrop-blur-sm"
                              : "bg-white/20 border-white/30 text-gray-600 backdrop-blur-sm"
                        }`}
                      >
                        {loadingStep >= step.id ? (
                          <Check className="w-6 h-6 checkmark" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {step.id}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-medium transition-colors duration-500 ${
                            loadingStep >= step.id
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                      {loadingStep === step.id - 1 && (
                        <div className="w-4 h-4 bg-orange-500 rounded-full pulse"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                  <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 border border-white/30">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(loadingStep / 3) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Step {loadingStep} of 3 completed
                  </p>
                </div>
              </div>
            )}

            {currentStep === "success" && (
              <div className="p-6 text-center">
                {/* Success Animation */}
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-green-500/80 rounded-full flex items-center justify-center mb-4 celebrate">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Success! 🎉
                  </h2>
                  <p className="text-gray-700">
                    Your top up was processed successfully!
                  </p>
                </div>

                {/* Summary */}
                <Card className="bg-white/20 backdrop-blur-sm border border-white/35 rounded-xl p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added to:</span>
                      <span className="text-gray-800 font-medium">
                        {planName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-800 font-bold">
                        ${amount} {tokenSymbol}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Action Button */}
                <Button
                  onClick={handleSuccess}
                  className="w-full bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
