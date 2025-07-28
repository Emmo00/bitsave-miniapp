"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Plus,
  PiggyBank,
  Users,
  CheckCircle,
  ExternalLink,
  Wallet,
  Sparkles,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    {
      id: 1,
      title: "Add Bitsave to Farcaster",
      description: "Add the Bitsave MiniApp in your Farcaster client",
      cost: "Free",
      icon: <Plus className="w-6 h-6" />,
      color: "purple",
    },
    {
      id: 2,
      title: "Join Bitsave",
      description: "Become a member of the Bitsave community",
      cost: "$1.00",
      icon: <Users className="w-6 h-6" />,
      color: "blue",
    },
    {
      id: 3,
      title: "Create Creator Vault",
      description: "Set up your first savings vault to start earning",
      cost: "$1.00",
      icon: <PiggyBank className="w-6 h-6" />,
      color: "green",
    },
  ];

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => stepId === currentStep;
  const isStepAccessible = (stepId: number) => stepId <= currentStep;

  const handleStepAction = async (stepId: number) => {
    setIsProcessing(true);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mark step as completed
    setCompletedSteps((prev) => [...prev, stepId]);

    // Move to next step or finish
    if (stepId < totalSteps) {
      setCurrentStep(stepId + 1);
    } else {
      // All steps completed, redirect to dashboard
      localStorage.setItem("bitsave-logged-in", "true");
      localStorage.setItem("bitsave-onboarded", "true");
      router.push("/dashboard");
    }

    setIsProcessing(false);
  };

  const getStepContent = (step: (typeof steps)[0]) => {
    switch (step.id) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add Bitsave to Farcaster</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Add the Bitsave MiniApp in your Farcaster client for easy access to your
                savings.
              </p>
            </div>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4 space-y-3">
                {/* <h4 className="font-medium text-purple-800">What you'll get:</h4> */}
                <ul className="space-y-2 text-sm text-purple-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Quick access from Farcaster</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Real-time earnings notifications</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Seamless saving experience</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Button
              onClick={() => handleStepAction(1)}
              disabled={isProcessing || isStepCompleted(1)}
              className="w-full bg-purple-500 hover:bg-purple-600 h-12"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Installing...</span>
                </div>
              ) : isStepCompleted(1) ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Installed</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Add to Farcaster</span>
                </div>
              )}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Join Bitsave</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Become a member of the Bitsave community and unlock exclusive features.
              </p>
            </div>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-800">Membership Benefits:</h4>
                  <Badge className="bg-blue-500 text-white">$1.00</Badge>
                </div>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Access to all vault types</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>$BTS rewards program</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Community leaderboard</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Button
              onClick={() => handleStepAction(2)}
              disabled={isProcessing || isStepCompleted(2) || !isStepCompleted(1)}
              className="w-full bg-blue-500 hover:bg-blue-600 h-12"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : isStepCompleted(2) ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Joined</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>Join for $1.00</span>
                </div>
              )}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <PiggyBank className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Create Creator Vault</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Set up your first savings vault and start earning $BTS rewards.
              </p>
            </div>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-green-800">Creator Vault Features:</h4>
                  <Badge className="bg-green-500 text-white">$1.00</Badge>
                </div>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Automated savings from earnings</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Customizable savings goals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>$BTS rewards for consistency</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Button
              onClick={() => handleStepAction(3)}
              disabled={isProcessing || isStepCompleted(3) || !isStepCompleted(2)}
              className="w-full bg-green-500 hover:bg-green-600 h-12"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Vault...</span>
                </div>
              ) : isStepCompleted(3) ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Vault Created</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <PiggyBank className="w-4 h-4" />
                  <span>Create Vault for $1.00</span>
                </div>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button size="icon" onClick={() => router.push("/landing")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Get Started with Bitsave</h1>
              <p className="text-sm text-gray-600">Complete these steps to start saving</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4 text-black">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">
                  {completedSteps.length} of {totalSteps} completed
                </span>
              </div>
              <Progress value={(completedSteps.length / totalSteps) * 100} className="h-3" />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isStepCompleted(step.id)
                        ? "bg-green-500 text-white"
                        : isStepActive(step.id)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isStepCompleted(step.id) ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 ${isStepCompleted(step.id) ? "bg-green-500" : "bg-gray-200"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              {getStepContent(steps.find((s) => s.id === currentStep) || steps[0])}
            </CardContent>
          </Card>

          {/* Total Cost */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 text-center space-y-2">
              <h4 className="font-medium text-orange-800">Total Setup Cost</h4>
              <div className="text-2xl font-bold text-green-600">$2.00</div>
              <p className="text-sm text-orange-700">One-time setup fee to get started</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
