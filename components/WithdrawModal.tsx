"use client";

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Download,
  Check,
  AlertTriangle,
  Share2,
  DollarSign,
  Clock
} from "lucide-react";

interface WithdrawModalProps {
  children: React.ReactNode;
  planName?: string;
  tokenSymbol?: string;
  totalAmount?: string;
  isMatured?: boolean;
  penaltyPercentage?: number;
  maturityDate?: Date;
  onWithdraw?: () => void;
}

export default function WithdrawModal({ 
  children, 
  planName = "Savings Plan",
  tokenSymbol = "cUSD",
  totalAmount = "100",
  isMatured = false,
  penaltyPercentage = 10,
  maturityDate = new Date(),
  onWithdraw 
}: WithdrawModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"confirm" | "loading" | "success">("confirm");

  const calculatePenalty = () => {
    const amount = parseFloat(totalAmount);
    return (amount * penaltyPercentage / 100).toFixed(2);
  };

  const calculateNetAmount = () => {
    const amount = parseFloat(totalAmount);
    const penalty = amount * penaltyPercentage / 100;
    return (amount - penalty).toFixed(2);
  };

  const handleWithdraw = () => {
    setCurrentStep("loading");
    
    // Simulate the loading process
    const simulateLoading = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      setCurrentStep("success");
      if (onWithdraw) {
        onWithdraw();
      }
    };
    
    simulateLoading();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      // Reset state after modal closes
      setCurrentStep("confirm");
    }, 200);
  };

  const handleSuccess = () => {
    handleClose();
  };

  const handleShare = () => {
    const shareText = isMatured 
      ? `I just successfully completed my savings plan on BitSave! 💰 Withdrew $${totalAmount} ${tokenSymbol} from my ${planName} plan. Building financial discipline one goal at a time! 🚀`
      : `I made an early withdrawal from my BitSave savings plan. Sometimes life happens, but I'm still committed to building better financial habits! 💪 #BitSave`;
    
    if (navigator.share) {
      navigator.share({
        title: 'BitSave Withdrawal',
        text: shareText,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    }
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
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

        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/0 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogContent className="bg-white/90 backdrop-blur-3xl backdrop-brightness-125 border border-white/100 shadow-2xl max-w-md rounded-2xl backdrop-saturate-200 fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {currentStep === "confirm" && (
            <div className="p-2">
              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto ${isMatured ? 'bg-blue-500/10' : 'bg-red-500/10'} backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border border-white/20`}>
                  {isMatured ? (
                    <Download className="w-6 h-6 text-blue-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isMatured ? `Withdraw from ${planName}` : `Early Withdrawal Warning`}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {isMatured 
                    ? "Your savings plan has matured. You can withdraw without penalties."
                    : "Your savings plan hasn't matured yet."
                  }
                </p>
              </div>

              <div className="space-y-4">
                {/* Plan Summary */}
                <Card className="bg-white/20 backdrop-blur-sm border border-white/35 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan Name:</span>
                      <span className="text-gray-800 font-medium">{planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-gray-800 font-bold">${totalAmount} {tokenSymbol}</span>
                    </div>
                    {!isMatured && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maturity Date:</span>
                        <span className="text-gray-800 font-medium">
                          {maturityDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Early Withdrawal Warning */}
                {!isMatured && (
                  <Card className="bg-red-50/30 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 shake">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <h3 className="text-red-700 font-semibold">Early Withdrawal Penalty</h3>
                        <ul className="text-red-600 text-sm space-y-1">
                          <li>• You will lose {penaltyPercentage}% of your savings</li>
                          <li>• You will forfeit any potential rewards that would have been earned at maturity</li>
                        </ul>
                        
                        <div className="mt-3 pt-3 border-t border-red-200/50">
                          <div className="flex justify-between text-sm">
                            <span className="text-red-600">Penalty Amount:</span>
                            <span className="text-red-700 font-semibold">-${calculatePenalty()} {tokenSymbol}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold mt-1">
                            <span className="text-red-600">You'll Receive:</span>
                            <span className="text-red-700">${calculateNetAmount()} {tokenSymbol}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Matured Plan Success */}
                {isMatured && (
                  <Card className="bg-green-50/30 backdrop-blur-sm border border-green-200/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="text-green-700 font-semibold">Plan Matured Successfully!</h3>
                        <p className="text-green-600 text-sm">No penalties apply. You can withdraw the full amount.</p>
                      </div>
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
                    onClick={handleWithdraw}
                    className={`flex-1 ${isMatured 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    } text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isMatured ? 'Withdraw' : 'Withdraw Anyway'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "loading" && (
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-800">Withdrawing Funds</h2>
                <p className="text-gray-600 text-sm mt-1">Please wait while we process your withdrawal</p>
              </div>
              
              {/* Loading Animation */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 backdrop-blur-sm border border-white/20 flex items-center justify-center pulse">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-700">Processing withdrawal...</h3>
                  <p className="text-sm text-gray-600">This may take a few moments</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-8">
                <div className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-3000 ease-out"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-3">
                  Processing your withdrawal...
                </p>
              </div>
            </div>
          )}

          {currentStep === "success" && (
            <div className="p-6 text-center">
              {/* Success Animation */}
              <div className="mb-6">
                <div className={`w-16 h-16 mx-auto ${isMatured ? 'bg-green-500/20' : 'bg-orange-500/20'} backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mb-4 celebrate`}>
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {isMatured ? 'Withdrawal Complete! 🎉' : 'Early Withdrawal Processed'}
                </h2>
                <p className="text-gray-700">
                  {isMatured 
                    ? 'Your funds have been successfully withdrawn!'
                    : 'Your early withdrawal has been processed.'
                  }
                </p>
              </div>
              
              {/* Summary */}
              <Card className="bg-white/20 backdrop-blur-sm border border-white/35 rounded-xl p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="text-gray-800 font-medium">{planName}</span>
                  </div>
                  {!isMatured && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Amount:</span>
                        <span className="text-gray-800">${totalAmount} {tokenSymbol}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Penalty ({penaltyPercentage}%):</span>
                        <span>-${calculatePenalty()} {tokenSymbol}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span className="text-gray-700">Amount Received:</span>
                    <span className="text-gray-800">
                      ${isMatured ? totalAmount : calculateNetAmount()} {tokenSymbol}
                    </span>
                  </div>
                </div>
              </Card>
              
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
                  onClick={handleSuccess}
                  className="w-full bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
