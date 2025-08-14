"use client";

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Plus,
  Check,
  DollarSign,
  ArrowRight,
  X
} from "lucide-react";

interface TopUpModalProps {
  children: React.ReactNode;
  planName?: string;
  tokenSymbol?: string;
  onTopUp?: (amount: string) => void;
}

export default function TopUpModal({ 
  children, 
  planName = "Savings Plan",
  tokenSymbol = "cUSD",
  onTopUp 
}: TopUpModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"form" | "loading" | "success">("form");
  const [loadingStep, setLoadingStep] = useState(0);
  const [amount, setAmount] = useState("");

  const quickAmounts = [10, 20, 40, 50];

  const loadingSteps = [
    { id: 1, title: "Approve Token Spend", description: "Approving token transfer..." },
    { id: 2, title: "Top Up Plan", description: "Adding funds to your savings plan..." }
  ];

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleTopUp = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    setCurrentStep("loading");
    setLoadingStep(0);
    
    // Simulate the loading process
    const simulateLoading = async () => {
      for (let i = 1; i <= 2; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay for each step
        setLoadingStep(i);
      }
      // After all steps complete, show success
      setTimeout(() => {
        setCurrentStep("success");
        if (onTopUp) {
          onTopUp(amount);
        }
      }, 500);
    };
    
    simulateLoading();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      // Reset state after modal closes
      setCurrentStep("form");
      setLoadingStep(0);
      setAmount("");
    }, 200);
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
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
          0%, 100% {
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
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="bg-white/40 backdrop-blur-2xl backdrop-brightness-110 border border-white/50 shadow-2xl max-w-md rounded-2xl backdrop-saturate-200">
          {currentStep === "form" && (
            <div className="p-2">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto bg-weirdGreen/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border border-white/20">
                  <Plus className="w-6 h-6 text-weirdGreen" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Top Up {planName}</h2>
                <p className="text-gray-600 text-sm mt-1">Add more funds to your savings plan</p>
              </div>

              <div className="space-y-4">
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Amount ({tokenSymbol})</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-10 bg-white/25 backdrop-blur-sm border-white/40 rounded-xl text-gray-800 placeholder-gray-500 focus:bg-white/35 focus:border-white/50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Quick Amounts</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAmount(quickAmount)}
                        className={`bg-white/25 backdrop-blur-sm border-white/40 hover:bg-white/35 text-gray-800 transition-all duration-200 ${
                          amount === quickAmount.toString() 
                            ? 'ring-2 ring-weirdGreen/60 bg-weirdGreen/20 border-weirdGreen/50' 
                            : ''
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
                    className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 text-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleTopUp}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="flex-1 bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Top Up
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "loading" && (
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-800">Processing Top Up</h2>
                <p className="text-gray-600 text-sm mt-1">Please wait while we process your transaction</p>
              </div>
              
              {/* Loading Steps */}
              <div className="space-y-6">
                {loadingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      loadingStep >= step.id 
                        ? 'bg-green-500/80 border-green-400 text-white backdrop-blur-sm' 
                        : loadingStep === step.id - 1
                        ? 'bg-orange-500/80 border-orange-400 text-white pulse backdrop-blur-sm'
                        : 'bg-white/10 border-white/20 text-gray-600 backdrop-blur-sm'
                    }`}>
                      {loadingStep >= step.id ? (
                        <Check className="w-6 h-6 checkmark" />
                      ) : (
                        <span className="text-sm font-semibold">{step.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium transition-colors duration-500 ${
                        loadingStep >= step.id ? 'text-green-700' : 'text-gray-700'
                      }`}>
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
              <div className="mt-8">
                <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-2 border border-white/20">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(loadingStep / 2) * 100}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-3">
                  Step {loadingStep} of 2 completed
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
                <h2 className="text-xl font-bold text-gray-800 mb-2">Success! 🎉</h2>
                <p className="text-gray-700">Your top up was processed successfully!</p>
              </div>
              
              {/* Summary */}
              <Card className="bg-white/10 backdrop-blur-sm border border-white/25 rounded-xl p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Added to:</span>
                    <span className="text-gray-800 font-medium">{planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-gray-800 font-bold">${amount} {tokenSymbol}</span>
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
      </Dialog>
    </>
  );
}
