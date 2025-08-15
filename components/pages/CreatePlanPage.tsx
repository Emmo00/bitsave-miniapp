"use client";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  X,
  Check,
  Share2,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { config } from "@/components/providers/WagmiProvider";
import {
  getChainName,
  getSupportedTokens,
  getTokenInfo,
} from "@/lib/tokenUtils";
import { Button } from "@/components/ui/button";
import { useSwitchChain, useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { formatUnits, Address, zeroAddress, parseUnits } from "viem";
import ERC20_ABI from "@/abi/ERC20.json";
import BITSAVE_ABI from "@/abi/BitSave.json";
import {
  getUserChildContract,
  getJoiningFee,
  getCreateSavingsFee,
} from "@/onchain/reads";
import { ChainId } from "@/types";
import { useWriteContract, useTransactionConfirmations } from "wagmi";
import CONTRACT_ADDRESSES from "@/constants/addresses";

export default function CreatePlanPage({
  setCurrentTab,
}: {
  setCurrentTab: (tab: any) => void;
}) {
  const [currentStep, setCurrentStep] = useState<
    "form" | "preview" | "loading" | "success"
  >("form");
  const [loadingStep, setLoadingStep] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>();
  const [errors, setErrors] = useState({
    name: "",
    amount: "",
    penaltyFee: "",
    maturityDate: "",
  });
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    selectedChain: config.chains[0].id.toString(),
    selectedToken: getSupportedTokens("BASE")[0].address || "",
    maturityDate: null as Date | null,
    penaltyFee: "",
  });
  const { switchChain } = useSwitchChain();
  const { address } = useAccount();
  const [hasAlreadyJoinedBitsave, setHasAlreadyJoinedBitsave] = useState(false);

  // Wagmi hooks
  const {
    data: joinBitsaveHash,
    writeContractAsync: writeJoinBitsaveContract,
    isPending: isWriteJoinBitsavePending,
  } = useWriteContract();
  const {
    data: createSavingsHash,
    writeContractAsync: writeCreateSavingsContract,
    isPending: isWriteCreateSavingsPending,
  } = useWriteContract();
  const {
    data: approveTokenSpendHash,
    writeContractAsync: writeApproveTokenSpendContract,
    isPending: isWriteApproveTokenSpendPending,
  } = useWriteContract();

  // Function to fetch token balance
  const fetchTokenBalance = async (tokenAddress: string, chainId: number) => {
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
        chainId: chainId as any, // Type assertion to handle the chain ID typing
      })) as bigint;

      const tokenInfo = getTokenInfo(tokenAddress);
      const formattedBalance = formatUnits(balance, tokenInfo.decimals);
      setTokenBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setTokenBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    // track chain, and check if user has joined bitsave on that chain
    if (formData.selectedChain) {
      (async () => {
        const userContract = await getUserChildContract(
          address!,
          Number(formData.selectedChain) as ChainId
        );
        setHasAlreadyJoinedBitsave(!(userContract === zeroAddress));
        console.log("Checking if user has joined Bitsave", {
          userContract,
          selectedChain: formData.selectedChain,
          address,
          hasAlreadyJoinedBitsave,
        });
      })();
    }
  }, [formData.selectedChain, address]);

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    // Set minimum date to one month from now
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    setCurrentDate(oneMonthFromNow);
    setFormData((prev) => ({ ...prev, maturityDate: oneMonthFromNow }));
  }, []);

  // Fetch balance when token or chain changes
  useEffect(() => {
    if (formData.selectedToken && formData.selectedChain) {
      fetchTokenBalance(formData.selectedToken, Number(formData.selectedChain));
    }
  }, [formData.selectedToken, formData.selectedChain, address]);

  // Dynamic loading steps based on whether user has joined BitSave
  const loadingSteps = hasAlreadyJoinedBitsave
    ? [
        {
          id: 1,
          title: "Approve Token Send",
          description: "Approving token transfer...",
        },
        {
          id: 2,
          title: "Create Savings Plan",
          description: "Creating your savings plan...",
        },
        { id: 3, title: "Finalizing", description: "Completing setup..." },
      ]
    : [
        {
          id: 1,
          title: "Join Bitsave",
          description: "Setting up your account...",
        },
        {
          id: 2,
          title: "Approve Token Send",
          description: "Approving token transfer...",
        },
        {
          id: 3,
          title: "Create Savings Plan",
          description: "Creating your savings plan...",
        },
        { id: 4, title: "Finalizing", description: "Completing setup..." },
      ];

  const handleNext = () => {
    // Clear previous errors
    setErrors({
      name: "",
      amount: "",
      penaltyFee: "",
      maturityDate: "",
    });

    let hasErrors = false;
    const newErrors = {
      name: "",
      amount: "",
      penaltyFee: "",
      maturityDate: "",
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Plan name is required";
      hasErrors = true;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Plan name must be at least 2 characters long";
      hasErrors = true;
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Plan name must be less than 50 characters";
      hasErrors = true;
    }

    // Validate amount
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
      hasErrors = true;
    } else {
      const amount = parseFloat(formData.amount);
      const currentBalance = parseFloat(tokenBalance);

      if (isNaN(amount)) {
        newErrors.amount = "Amount must be a valid number";
        hasErrors = true;
      } else if (amount <= 0) {
        newErrors.amount = "Amount must be greater than 0";
        hasErrors = true;
      } else if (amount > 1000000) {
        newErrors.amount = "Amount cannot exceed $1,000,000";
        hasErrors = true;
      } else if (amount < 1) {
        newErrors.amount = "Minimum amount is $1";
        hasErrors = true;
      } else if (amount > currentBalance) {
        newErrors.amount = `Insufficient balance. You have ${parseFloat(tokenBalance).toFixed(4)} ${getTokenInfo(formData.selectedToken).symbol}`;
        hasErrors = true;
      }
    }

    // Validate penalty fee
    if (!formData.penaltyFee.trim()) {
      newErrors.penaltyFee = "Penalty fee is required";
      hasErrors = true;
    } else {
      const penaltyFee = parseFloat(formData.penaltyFee);
      if (isNaN(penaltyFee)) {
        newErrors.penaltyFee = "Penalty fee must be a valid number";
        hasErrors = true;
      } else if (penaltyFee < 0) {
        newErrors.penaltyFee = "Penalty fee cannot be negative";
        hasErrors = true;
      } else if (penaltyFee > 100) {
        newErrors.penaltyFee = "Penalty fee cannot exceed 100%";
        hasErrors = true;
      }
    }

    // Validate maturity date
    if (!formData.maturityDate) {
      newErrors.maturityDate = "Maturity date is required";
      hasErrors = true;
    } else {
      const today = new Date();
      const oneMonthFromNow = new Date(today);
      oneMonthFromNow.setMonth(today.getMonth() + 1);
      oneMonthFromNow.setDate(oneMonthFromNow.getDate() - 1);

      console.log("maturity date", formData.maturityDate);

      if (formData.maturityDate < oneMonthFromNow) {
        newErrors.maturityDate =
          "Maturity date must be at least one month from today";
        hasErrors = true;
      }

      const fiveYearsFromNow = new Date(today);
      fiveYearsFromNow.setFullYear(today.getFullYear() + 5);

      if (formData.maturityDate > fiveYearsFromNow) {
        newErrors.maturityDate =
          "Maturity date cannot be more than 5 years from today";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      // scroll to top if name or amount has errors
      if (newErrors.name || newErrors.amount) {
        window.scroll({ top: 0, behavior: "smooth" });
      }
      setErrors(newErrors);
      return;
    }

    // If no errors, proceed to preview
    setCurrentStep("preview");
  };

  const handleBack = () => {
    setCurrentStep("form");
  };

  const handleSave = async () => {
    if (!address) return;

    setCurrentStep("loading");
    setLoadingStep(0);

    try {
      const chainId = Number(formData.selectedChain) as ChainId;
      const tokenInfo = getTokenInfo(formData.selectedToken);
      const amount = parseUnits(formData.amount, tokenInfo.decimals);

      // Step 1: Join BitSave if not already joined
      if (!hasAlreadyJoinedBitsave) {
        setLoadingStep(1);
        const joiningFee = await getJoiningFee(chainId);

        const joinBitsaveHash = await writeJoinBitsaveContract({
          abi: BITSAVE_ABI,
          address: CONTRACT_ADDRESSES[chainId].BITSAVE as Address,
          functionName: "joinBitsave",
          chainId,
          value: joiningFee,
        });

        // Wait for 1 confirmation
        await waitForConfirmations(joinBitsaveHash, 1);
      }

      // Step 2: Approve token transfer
      const approveStepId = hasAlreadyJoinedBitsave ? 1 : 2;
      setLoadingStep(approveStepId);

      const createSavingsFee = await getCreateSavingsFee(chainId);
      const totalAmount = amount + createSavingsFee;

      const approveHash = await writeApproveTokenSpendContract({
        abi: ERC20_ABI,
        address: formData.selectedToken as Address,
        functionName: "approve",
        args: [
          CONTRACT_ADDRESSES[getChainName(chainId).toUpperCase()]
            .BITSAVE as Address,
          totalAmount,
        ],
        chainId,
      });

      // Wait for 1 confirmation
      await waitForConfirmations(approveHash, 1);

      // Step 3: Create savings plan
      const createStepId = hasAlreadyJoinedBitsave ? 2 : 3;
      setLoadingStep(createStepId);

      // Convert maturity date to timestamp
      const maturityTimestamp = Math.floor(
        (formData.maturityDate?.getTime() || Date.now()) / 1000
      );

      const createSavingHash = await writeCreateSavingsContract({
        abi: BITSAVE_ABI,
        address: CONTRACT_ADDRESSES[chainId].BITSAVE as Address,
        functionName: "createSaving",
        args: [
          formData.name,
          maturityTimestamp,
          Number(formData.penaltyFee),
          false, // safeMode
          formData.selectedToken as Address,
          amount,
        ],
        chainId,
        value: createSavingsFee,
      });

      // Wait for 2 confirmations
      await waitForConfirmations(createSavingHash, 2);

      // Final step
      const finalStepId = hasAlreadyJoinedBitsave ? 3 : 4;
      setLoadingStep(finalStepId);

      // Small delay before showing success
      setTimeout(() => {
        setCurrentStep("success");
      }, 1000);
    } catch (error) {
      console.error("Error creating savings plan:", error);
      // Handle error - could show error state or go back to form
      setCurrentStep("form");
    }
  };

  // Helper function to wait for confirmations using the transaction confirmation hooks
  const waitForConfirmations = async (
    hash: `0x${string}`,
    requiredConfirmations: number
  ) => {
    return new Promise<void>((resolve) => {
      // Simple timeout-based approach for now
      // In a real implementation, you'd use the useTransactionConfirmations hook properly
      // by setting the hash state and watching the confirmations
      const checkInterval = setInterval(() => {
        // For demonstration, we'll use a fixed timeout
        // In practice, you'd check the actual confirmation count
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, requiredConfirmations * 2000); // 2 seconds per confirmation
      }, 100);
    });
  };

  const handleShare = () => {
    const shareText = `I just created a savings plan on BitSave! 💰 Saving $${formData.amount || "1000"} for ${formData.name || "my goal"}. Join me in building better financial habits! 🚀`;

    if (navigator.share) {
      navigator.share({
        title: "My BitSave Savings Plan",
        text: shareText,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert("Share text copied to clipboard!");
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideUpFromBottom {
          0% {
            opacity: 0.5;
            transform: translateY(10%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes checkmark {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes celebrate {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .slide-up {
          animation: slideUpFromBottom 0.3s ease-out;
        }

        .pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .checkmark {
          animation: checkmark 0.5s ease-out;
        }

        .celebrate {
          animation: celebrate 0.8s ease-in-out;
        }

        /* Custom calendar styling */
        .calendar-glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <div className="pt-[10vh] text-black">
        {currentStep === "form" && (
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl slide-up">
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Close"
                className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
                onClick={() => setCurrentTab("home")}
              >
                <X className="w-4 h-4 text-gray-800" />
              </button>
            </div>
            {/* Name */}
            <div className="mb-1">
              <Label
                htmlFor="plan-name"
                className="text-xs font-grotesk text-gray-800"
              >
                Name
              </Label>
              <Input
                id="plan-name"
                placeholder="Emergency Fund"
                className={`bg-white/30 backdrop-blur-sm border-white/40 ${
                  errors.name ? "border-red-400 focus:border-red-500" : ""
                }`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  // Clear error when user starts typing
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="mb-1">
              <Label
                htmlFor="plan-amount"
                className="text-xs font-grotesk text-gray-800"
              >
                Amount ($)
              </Label>
              <div className="relative">
                <Input
                  id="plan-amount"
                  type="number"
                  placeholder="1000"
                  className={`bg-white/30 backdrop-blur-sm border-white/40 pr-16 ${
                    errors.amount ? "border-red-400 focus:border-red-500" : ""
                  }`}
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    // Clear error when user starts typing
                    if (errors.amount) {
                      setErrors({ ...errors, amount: "" });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const maxAmount = parseFloat(tokenBalance).toFixed(4);
                    setFormData({ ...formData, amount: maxAmount });
                    // Clear error when user uses max
                    if (errors.amount) {
                      setErrors({ ...errors, amount: "" });
                    }
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-orange-500/80 text-white rounded-lg hover:bg-orange-600/80 transition-colors"
                  disabled={isLoadingBalance || parseFloat(tokenBalance) === 0}
                >
                  Max
                </button>
              </div>

              {/* Balance Display */}
              <div className="mt-1">
                {isLoadingBalance ? (
                  <p className="text-xs text-gray-600">Loading balance...</p>
                ) : (
                  <p className="text-xs text-gray-600">
                    Balance: {parseFloat(tokenBalance).toFixed(4)}{" "}
                    {getTokenInfo(formData.selectedToken).symbol}
                  </p>
                )}
              </div>

              {errors.amount && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Chain */}
            <div className="mb-1">
              <Label className="text-gray-800">Chain</Label>
              <Select
                value={formData.selectedChain}
                onValueChange={(value) => {
                  switchChain({ chainId: Number(value) });
                  setFormData({ ...formData, selectedChain: value });
                  // Reset token to first available token for new chain
                  const newChainTokens = getSupportedTokens(
                    getChainName(Number(value)).toUpperCase()
                  );
                  if (newChainTokens.length > 0) {
                    setFormData((prev) => ({
                      ...prev,
                      selectedChain: value,
                      selectedToken: newChainTokens[0].address || "",
                    }));
                  }
                }}
              >
                <SelectTrigger className="rounded-xl bg-white/30 backdrop-blur-sm border-white/40">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {config.chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* currency */}
            <div className="mb-1">
              <Label className="text-gray-800">Currency</Label>
              <Select
                value={formData.selectedToken}
                onValueChange={(value) => {
                  setFormData({ ...formData, selectedToken: value });
                  // Fetch balance for new token
                  fetchTokenBalance(value, Number(formData.selectedChain));
                }}
              >
                <SelectTrigger className="rounded-xl bg-white/30 backdrop-blur-sm border-white/40">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {getSupportedTokens(
                    getChainName(Number(formData.selectedChain)).toUpperCase()
                  ).map((token) => (
                    <SelectItem key={token.address} value={token.address || ""}>
                      <div className="flex items-center space-x-2">
                        {token.image && (
                          <Image
                            src={`/${token.image}`}
                            alt={token.name}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                        )}
                        <span>{token.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Maturity time */}
            <div className="mb-1">
              <Label className="text-xs font-grotesk text-gray-800">
                Maturity Time
              </Label>
              <div
                className={`bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl p-4 ${
                  errors.maturityDate ? "border-red-400" : ""
                }`}
              >
                {/* Date Display */}
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {isClient && currentDate
                      ? format(currentDate, "MMMM dd, yyyy")
                      : "Loading..."}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isClient && currentDate ? format(currentDate, "EEEE") : ""}
                  </div>
                </div>

                {/* Month/Year Selector */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentDate) {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        const today = new Date();
                        const oneMonthFromNow = new Date(today);
                        oneMonthFromNow.setMonth(today.getMonth() + 1);
                        if (newDate >= oneMonthFromNow) {
                          setCurrentDate(newDate);
                          setFormData({ ...formData, maturityDate: newDate });
                          // Clear error when user changes date
                          if (errors.maturityDate) {
                            setErrors({ ...errors, maturityDate: "" });
                          }
                        }
                      }
                    }}
                    className="p-2 rounded-lg bg-white/40 border border-white/50 hover:bg-white/60 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-700" />
                  </button>

                  <div className="text-center">
                    <div className="text-base font-medium text-gray-800">
                      {isClient && currentDate
                        ? format(currentDate, "MMMM yyyy")
                        : ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentDate) {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentDate(newDate);
                        setFormData({ ...formData, maturityDate: newDate });
                        // Clear error when user changes date
                        if (errors.maturityDate) {
                          setErrors({ ...errors, maturityDate: "" });
                        }
                      }
                    }}
                    className="p-2 rounded-lg bg-white/40 border border-white/50 hover:bg-white/60 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {/* Quick Date Options */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Quick Select:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "1 Month", months: 1 },
                      { label: "3 Months", months: 3 },
                      { label: "6 Months", months: 6 },
                      { label: "1 Year", months: 12 },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          const newDate = new Date(today);
                          newDate.setMonth(today.getMonth() + option.months);
                          setCurrentDate(newDate);
                          setFormData({ ...formData, maturityDate: newDate });
                          // Clear error when user changes date
                          if (errors.maturityDate) {
                            setErrors({ ...errors, maturityDate: "" });
                          }
                        }}
                        className="py-2 px-3 text-sm rounded-lg bg-white/40 border border-white/50 hover:bg-orange-500/80 hover:text-white transition-all duration-200 text-gray-700"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Input */}
                <div className="mt-4 pt-4 border-t border-white/40">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Or choose specific date:
                  </div>
                  <input
                    type="date"
                    value={
                      isClient && currentDate
                        ? format(currentDate, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      const oneMonthFromNow = new Date(today);
                      oneMonthFromNow.setMonth(today.getMonth() + 1);

                      if (selectedDate >= oneMonthFromNow) {
                        setCurrentDate(selectedDate);
                        setFormData({
                          ...formData,
                          maturityDate: selectedDate,
                        });
                        // Clear error when user changes date
                        if (errors.maturityDate) {
                          setErrors({ ...errors, maturityDate: "" });
                        }
                      }
                    }}
                    min={(() => {
                      const today = new Date();
                      const oneMonthFromNow = new Date(today);
                      oneMonthFromNow.setMonth(today.getMonth() + 1);
                      return format(oneMonthFromNow, "yyyy-MM-dd");
                    })()}
                    className="w-full p-2 rounded-lg bg-white/40 border border-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              {errors.maturityDate && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.maturityDate}
                </p>
              )}
            </div>

            {/* Penalty fee */}
            <div className="mb-1">
              <Label
                htmlFor="penalty-fee"
                className="text-xs font-grotesk text-gray-800"
              >
                Penalty Fee (%)
              </Label>
              <Input
                id="penalty-fee"
                type="number"
                placeholder="5"
                className={`bg-white/30 backdrop-blur-sm border-white/40 ${
                  errors.penaltyFee ? "border-red-400 focus:border-red-500" : ""
                }`}
                value={formData.penaltyFee}
                onChange={(e) => {
                  setFormData({ ...formData, penaltyFee: e.target.value });
                  // Clear error when user starts typing
                  if (errors.penaltyFee) {
                    setErrors({ ...errors, penaltyFee: "" });
                  }
                }}
              />
              {errors.penaltyFee && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.penaltyFee}
                </p>
              )}
            </div>

            {/* Action - next, cancel */}
            <div className="flex flex-col gap-2 justify-center space-x-2 mt-16">
              <Button
                onClick={handleNext}
                className="bg-orange-500/80 backdrop-blur-sm border border-orange-400/50 hover:bg-orange-600/80"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-800"
                onClick={() => setCurrentTab("home")}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {currentStep === "preview" && (
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl slide-up">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                aria-label="Back"
                className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 text-gray-800" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                Preview Plan
              </h2>
              <button
                type="button"
                aria-label="Close"
                className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
                onClick={() => setCurrentTab("home")}
              >
                <X className="w-4 h-4 text-gray-800" />
              </button>
            </div>

            {/* Preview Card */}
            <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Name:</span>
                  <span className="text-gray-800 font-medium">
                    {formData.name || "Emergency Fund"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Target Amount:</span>
                  <span className="text-gray-800 font-medium">
                    ${formData.amount || "1000"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Chain:</span>
                  <span className="text-gray-800 font-medium">
                    {config.chains.find(
                      (chain) => chain.id.toString() === formData.selectedChain
                    )?.name || "Base"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Currency:</span>
                  <span className="text-gray-800 font-medium">
                    {getSupportedTokens("BASE").find(
                      (token) => token.address === formData.selectedToken
                    )?.name || "USDC"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Maturity Date:</span>
                  <span className="text-gray-800 font-medium">
                    {formData.maturityDate
                      ? format(formData.maturityDate, "MMM dd, yyyy")
                      : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Penalty Fee:</span>
                  <span className="text-gray-800 font-medium">
                    {formData.penaltyFee || "5"}%
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-orange-100/50 to-orange-200/50 backdrop-blur-sm border border-orange-200/40 rounded-xl p-4 mb-8">
              <p className="text-orange-800 text-sm font-medium">
                You're creating a savings plan that will help you reach your
                goal of ${formData.amount || "1000"} by{" "}
                {formData.maturityDate
                  ? format(formData.maturityDate, "MMM yyyy")
                  : "your target date"}
                !
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-8">
              <Button
                onClick={handleSave}
                className="bg-green-500/80 backdrop-blur-sm border border-green-400/50 hover:bg-green-600/80 text-white"
              >
                Save Now ✨
              </Button>
              <Button
                variant="outline"
                className="border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-800"
                onClick={handleBack}
              >
                Back to Edit
              </Button>
            </div>
          </div>
        )}

        {currentStep === "loading" && (
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl slide-up">
            <div className="flex justify-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">
                Creating Your Savings Plan
              </h2>
            </div>

            {/* Loading Steps */}
            <div className="space-y-6 max-w-md mx-auto">
              {loadingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      loadingStep >= step.id
                        ? "bg-green-500/80 border-green-400 text-white"
                        : loadingStep === step.id - 1
                          ? "bg-orange-500/80 border-orange-400 text-white pulse"
                          : "bg-white/30 border-white/40 text-gray-600"
                    }`}
                  >
                    {loadingStep >= step.id ? (
                      <Check className="w-6 h-6 checkmark" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
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
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  {loadingStep === step.id - 1 && (
                    <div className="w-4 h-4 bg-orange-500 rounded-full pulse"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-12">
              <div className="w-full bg-white/30 rounded-full h-2 backdrop-blur-sm">
                <div
                  className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(loadingStep / loadingSteps.length) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-3">
                Step {loadingStep} of {loadingSteps.length} completed
              </p>
            </div>
          </div>
        )}

        {currentStep === "success" && (
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl slide-up">
            <div className="text-center">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  aria-label="Close"
                  className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
                  onClick={() => setCurrentTab("home")}
                >
                  <X className="w-4 h-4 text-gray-800" />
                </button>
              </div>

              {/* Success Animation */}
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-green-500/80 rounded-full flex items-center justify-center mb-6 celebrate">
                  <Check className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Success! 🎉
                </h2>
                <p className="text-gray-700">
                  Your savings plan has been created successfully!
                </p>
              </div>

              {/* Plan Summary */}
              <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Your New Savings Plan
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-800 font-medium">
                      {formData.name || "Emergency Fund"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Amount:</span>
                    <span className="text-gray-800 font-medium">
                      ${formData.amount || "1000"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maturity Date:</span>
                    <span className="text-gray-800 font-medium">
                      {formData.maturityDate
                        ? format(formData.maturityDate, "MMM dd, yyyy")
                        : "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleShare}
                  className="w-full bg-blue-500/80 backdrop-blur-sm border border-blue-400/50 hover:bg-blue-600/80 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Social Media
                </Button>
                <Button
                  onClick={() => setCurrentTab("home")}
                  className="w-full bg-orange-500/80 backdrop-blur-sm border border-orange-400/50 hover:bg-orange-600/80 text-white"
                >
                  View My Savings Plans
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-800"
                  onClick={() => {
                    setCurrentStep("form");
                    setLoadingStep(0);
                    setFormData({
                      name: "",
                      amount: "",
                      selectedChain: config.chains[0].id.toString(),
                      selectedToken:
                        getSupportedTokens("BASE")[0].address || "",
                      maturityDate: (() => {
                        const now = new Date();
                        const oneMonth = new Date(now);
                        oneMonth.setMonth(now.getMonth() + 1);
                        return oneMonth;
                      })(),
                      penaltyFee: "",
                    });
                  }}
                >
                  Create Another Plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
