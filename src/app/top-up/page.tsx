"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { ArrowLeft, PiggyBank, Coins, CheckCircle } from "lucide-react";

export default function TopUpVault() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vaultId = searchParams.get("vault");

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1); // 1: input, 2: confirm, 3: success

  // Mock vault data - in real app, fetch based on vaultId
  const vault = {
    id: 1,
    name: "Creator Fund",
    saved: 245,
    target: 1000,
    progress: 24.5,
    rewards: 12.3,
    token: "USDC",
    network: "Base",
  };

  const handleConfirm = () => {
    setStep(2);
  };

  const handleTopUp = () => {
    setStep(3);
  };

  const handleComplete = () => {
    router.push("/my-vaults");
  };

  const newTotal = vault.saved + Number.parseFloat(amount || "0");
  const newProgress = (newTotal / vault.target) * 100;

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
          <div className="p-6 space-y-6 pb-24">
            <div className="text-center space-y-6 pt-12">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Success! 🎉</h1>
                <p className="text-gray-600">You just saved ${amount}</p>
              </div>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vault:</span>
                    <span className="font-medium">{vault.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Total:</span>
                    <span className="font-bold text-green-600">${newTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{newProgress.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4 text-center space-y-2">
                  <h4 className="font-medium text-purple-800">Share Your Progress</h4>
                  <p className="text-sm text-purple-700">
                    "Just topped up my {vault.name} vault with ${amount}! 💪 #Bitsave"
                  </p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Cast Preview
                  </Badge>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button onClick={handleComplete} className="w-full bg-green-500 hover:bg-green-600">
                  Back to My Vaults
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Share to Cast
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
          <div className="p-6 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">Confirm Top Up</h1>
                <p className="text-sm text-gray-600">Review your transaction</p>
              </div>
            </div>

            {/* Confirmation Details */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <PiggyBank className="w-5 h-5 text-purple-600" />
                  <span>Transaction Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vault:</span>
                    <span className="font-medium">{vault.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top Up Amount:</span>
                    <span className="font-bold text-green-600">${amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="font-medium">${vault.saved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Balance:</span>
                    <span className="font-bold">${newTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <Badge variant="secondary">{vault.token}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <Badge variant="outline">{vault.network}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Progress */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Updated Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      ${newTotal} / ${vault.target}
                    </span>
                  </div>
                  <Progress value={newProgress} className="h-3" />
                  <div className="text-center text-sm text-gray-600">
                    {newProgress.toFixed(1)}% complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={handleTopUp} className="w-full bg-green-500 hover:bg-green-600">
                Confirm Top Up
              </Button>
              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                Back to Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Top Up Vault</h1>
              <p className="text-sm text-gray-600">Add funds to your savings</p>
            </div>
          </div>

          {/* Vault Info */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{vault.name}</h3>
                <div className="flex space-x-2">
                  <Badge variant="secondary">{vault.token}</Badge>
                  <Badge variant="outline">{vault.network}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Balance</span>
                  <span className="font-medium">
                    ${vault.saved} / ${vault.target}
                  </span>
                </div>
                <Progress value={vault.progress} className="h-2" />
              </div>

              <div className="flex items-center space-x-1 text-sm">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-green-600">+{vault.rewards} $BTS earned</span>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <div className="space-y-4 text-gray-900">
            <div className="space-y-2">
              <Label htmlFor="amount">Top Up Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-lg h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="rounded-xl"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {amount && Number.parseFloat(amount) > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-green-800">Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New Balance:</span>
                    <span className="font-bold">${newTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New Progress:</span>
                    <span className="font-medium">{newProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={newProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <Button
            onClick={handleConfirm}
            disabled={!amount || Number.parseFloat(amount) <= 0}
            className="w-full bg-green-500 hover:bg-green-600 h-12 text-lg"
          >
            Top Up ${amount || "0"}
          </Button>
        </div>
      </div>
    </div>
  );
}
