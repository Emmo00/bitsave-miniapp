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
import { cn } from "@/lib/utils";
import { config } from "@/components/providers/WagmiProvider";
import { getChainName, getSupportedTokens } from "@/lib/tokenUtils";
import { parseDate } from "chrono-node";
import { Button } from "@/components/ui/button";
import { useSwitchChain } from "wagmi";

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
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    selectedChain: config.chains[0].id.toString(),
    selectedToken: getSupportedTokens("BASE")[0].address || "",
    maturityDate: null as Date | null,
    penaltyFee: "",
  });
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    // Set minimum date to one month from now
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    setCurrentDate(oneMonthFromNow);
    setFormData((prev) => ({ ...prev, maturityDate: oneMonthFromNow }));
  }, []);

  const loadingSteps = [
    { id: 1, title: "Join Bitsave", description: "Setting up your account..." },
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
    // Here you could add form validation
    setCurrentStep("preview");
  };

  const handleBack = () => {
    setCurrentStep("form");
  };

  const handleSave = () => {
    setCurrentStep("loading");
    setLoadingStep(0);

    // Simulate the loading process
    const simulateLoading = async () => {
      for (let i = 1; i <= 4; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay for each step
        setLoadingStep(i);
      }
      // After all steps complete, show success
      setTimeout(() => {
        setCurrentStep("success");
      }, 500);
    };

    simulateLoading();
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
                className="bg-white/30 backdrop-blur-sm border-white/40"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Amount */}
            <div className="mb-1">
              <Label
                htmlFor="plan-amount"
                className="text-xs font-grotesk text-gray-800"
              >
                Amount ($)
              </Label>
              <Input
                id="plan-amount"
                type="number"
                placeholder="1000"
                className="bg-white/30 backdrop-blur-sm border-white/40"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>

            {/* Chain */}
            <div className="mb-1">
              <Label className="text-gray-800">Chain</Label>
              <Select
                value={formData.selectedChain}
                onValueChange={(value) => {
                  switchChain({ chainId: Number(value) });
                  setFormData({ ...formData, selectedChain: value });
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
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedToken: value })
                }
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
              <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl p-4">
                {/* Date Display */}
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {isClient && currentDate
                      ? format(currentDate, "MMMM dd, yyyy")
                      : "Loading..."}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isClient && currentDate
                      ? format(currentDate, "EEEE")
                      : ""}
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
                        }
                      }
                    }}
                    className="p-2 rounded-lg bg-white/40 border border-white/50 hover:bg-white/60 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-base font-medium text-gray-800">
                      {isClient && currentDate ? format(currentDate, "MMMM yyyy") : ""}
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
                      }
                    }}
                    className="p-2 rounded-lg bg-white/40 border border-white/50 hover:bg-white/60 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {/* Quick Date Options */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Quick Select:</div>
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
                  <div className="text-xs font-medium text-gray-700 mb-2">Or choose specific date:</div>
                  <input
                    type="date"
                    value={isClient && currentDate ? format(currentDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      const oneMonthFromNow = new Date(today);
                      oneMonthFromNow.setMonth(today.getMonth() + 1);
                      
                      if (selectedDate >= oneMonthFromNow) {
                        setCurrentDate(selectedDate);
                        setFormData({ ...formData, maturityDate: selectedDate });
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
                className="bg-white/30 backdrop-blur-sm border-white/40"
                value={formData.penaltyFee}
                onChange={(e) =>
                  setFormData({ ...formData, penaltyFee: e.target.value })
                }
              />
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
                  style={{ width: `${(loadingStep / 4) * 100}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-3">
                Step {loadingStep} of 4 completed
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
