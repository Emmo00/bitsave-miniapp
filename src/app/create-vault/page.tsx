"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, PiggyBank, Coins, AlertTriangle } from "lucide-react";

export default function VaultCreation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [vaultData, setVaultData] = useState({
    name: "",
    token: "",
    network: "",
    initialAmount: searchParams.get("initialAmount") || "",
    duration: [6],
    penalty: "5",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleCreate = () => {
    // Simulate vault creation
    router.push("/dashboard");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vault Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Creator Equipment Fund"
                  value={vaultData.name}
                  onChange={(e) => setVaultData({ ...vaultData, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Network</Label>
                <Select
                  value={vaultData.network}
                  onValueChange={(value) => setVaultData({ ...vaultData, network: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="celo">Celo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Token to Save</Label>
                <Select
                  value={vaultData.token}
                  onValueChange={(value) => setVaultData({ ...vaultData, token: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdc">USDC</SelectItem>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="degen">DEGEN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initial">Initial Amount (Optional)</Label>
                <Input
                  id="initial"
                  placeholder="0.00"
                  value={vaultData.initialAmount}
                  onChange={(e) =>
                    setVaultData({
                      ...vaultData,
                      initialAmount: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-4">
                <Label>Duration: {vaultData.duration[0]} months</Label>
                <Slider
                  value={vaultData.duration}
                  onValueChange={(value) => setVaultData({ ...vaultData, duration: value })}
                  max={24}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 month</span>
                  <span>24 months</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="penalty">Early Withdrawal Penalty (%)</Label>
                <Input
                  id="penalty"
                  placeholder="5"
                  value={vaultData.penalty}
                  onChange={(e) => setVaultData({ ...vaultData, penalty: e.target.value })}
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-500">
                  Penalty helps you stay committed to your savings goal
                </p>
              </div>
            </div>

            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Early Withdrawal</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Withdrawing before {vaultData.duration[0]} months will incur a {vaultData.penalty}
                  % penalty
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + vaultData.duration[0]);

        return (
          <div className="space-y-6">
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <PiggyBank className="w-5 h-5 text-purple-600" />
                  <span>Vault Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{vaultData.name || "Unnamed Vault"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <Badge variant="secondary">{vaultData.token?.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <Badge variant="outline">{vaultData.network}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{vaultData.duration[0]} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{endDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Penalty:</span>
                    <span className="font-medium text-red-600">{vaultData.penalty}%</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Estimated Rewards</h4>
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-bold text-green-600">
                      ~{(vaultData.duration[0] * 2.5).toFixed(1)} $BTS
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Based on average savings and duration</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4 text-center space-y-2">
                <h4 className="font-medium text-green-800">Ready to Share?</h4>
                <p className="text-sm text-green-700">"I just started saving with Bitsave 🎉"</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Cast Preview
                </Badge>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50 text-black">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Create Savings Vault</h1>
              <p className="text-sm text-gray-600">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Details</span>
              <span>Settings</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Actions */}
          <div className="flex space-x-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
                disabled={step === 1 && (!vaultData.name || !vaultData.token || !vaultData.network)}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleCreate} className="flex-1 bg-green-500 hover:bg-green-600">
                Create Vault 🎉
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
