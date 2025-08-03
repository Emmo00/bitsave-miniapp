"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useConnect, useChainId, useSwitchChain } from "wagmi";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  PiggyBank,
  Coins,
  AlertTriangle,
  Share2,
  Twitter,
  Loader,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { createSavingsVault } from "../../onchain/writes";
import CONTRACT_ADDRESSES, { Stablecoin } from "../../constants/addresses";
import { getSupportedTokens } from "../../lib/tokenUtils";
import { useToast } from "../../hooks/useToast";
import Image from "next/image";
import { config } from "../../components/providers/WagmiProvider";

export default function VaultCreation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [vaultData, setVaultData] = useState({
    name: "",
    token: "",
    network: config.state.chainId,
    initialAmount: searchParams.get("initialAmount") || "",
    duration: [6],
    penalty: "5",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Get supported tokens for selected network
  const getTokensForNetwork = (networkId: number) => {
    const networkName =
      networkId === 8453 ? "BASE" : networkId === 42220 ? "CELO" : "BASE";
    return getSupportedTokens(networkName);
  };

  // Get selected token object
  const getSelectedToken = (): Stablecoin | null => {
    const tokens = getTokensForNetwork(vaultData.network);
    return tokens.find((token) => token.address === vaultData.token) || null;
  };

  // Helper function to extract error message from various error types
  const getErrorMessage = (error: any): { title: string; message: string } => {
    // Check if it's a Wagmi error with shortMessage
    if (error?.shortMessage) {
      return {
        title: "Transaction Failed",
        message: error.shortMessage,
      };
    }

    // Check if it's a Wagmi error with details
    if (error?.details) {
      return {
        title: "Transaction Failed",
        message: error.details,
      };
    }

    // Check if it's a user rejection
    if (error?.message?.includes("User rejected") || error?.code === 4001) {
      return {
        title: "Transaction Cancelled",
        message: "You cancelled the transaction",
      };
    }

    // Check if it's a network error
    if (
      error?.message?.includes("network") ||
      error?.message?.includes("chain")
    ) {
      return {
        title: "Network Error",
        message: "Please check your network connection and try again",
      };
    }

    // Check if it's an insufficient funds error
    if (
      error?.message?.includes("insufficient") ||
      error?.message?.includes("balance")
    ) {
      return {
        title: "Insufficient Funds",
        message: "You don't have enough funds to complete this transaction",
      };
    }

    // Generic error fallback
    return {
      title: "Error",
      message:
        error?.message || "An unexpected error occurred. Please try again.",
    };
  };

  const handleNext = () => {
    // Validate step 1 (Details)
    if (step === 1) {
      if (!vaultData.name.trim()) {
        toast.error("Missing Vault Name", "Please enter a name for your vault");
        return;
      }
      if (!vaultData.network) {
        toast.error("Missing Network", "Please select a network");
        return;
      }
      if (!vaultData.token) {
        toast.error("Missing Token", "Please select a token to save");
        return;
      }
      if (vaultData.initialAmount && parseFloat(vaultData.initialAmount) < 0) {
        toast.error("Invalid Amount", "Initial amount cannot be negative");
        return;
      }
    }

    // Validate step 2 (Settings)
    if (step === 2) {
      if (
        !vaultData.penalty ||
        parseFloat(vaultData.penalty) < 0 ||
        parseFloat(vaultData.penalty) > 100
      ) {
        toast.error("Invalid Penalty", "Penalty must be between 0% and 100%");
        return;
      }
      if (vaultData.duration[0] < 1 || vaultData.duration[0] > 24) {
        toast.error(
          "Invalid Duration",
          "Duration must be between 1 and 24 months"
        );
        return;
      }
    }

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

  const handleCreate = async () => {
    if (!isConnected || !address) {
      toast.error("Wallet Not Connected", "Please connect your wallet first");
      connect({ connector: connectors[0] });
      return;
    }

    const selectedToken = getSelectedToken();
    if (!selectedToken) {
      toast.error("Invalid Token", "Please select a valid token");
      return;
    }

    // Validate required fields
    if (!vaultData.name.trim()) {
      toast.error("Missing Vault Name", "Please enter a name for your vault");
      return;
    }

    if (!vaultData.penalty || parseFloat(vaultData.penalty) < 0) {
      toast.error("Invalid Penalty", "Please enter a valid penalty percentage");
      return;
    }

    setIsCreating(true);

    try {
      // Switch to correct network if needed
      if (chainId !== vaultData.network) {
        toast.info(
          "Switching Network",
          "Please confirm the network switch in your wallet"
        );
        await switchChain({ chainId: vaultData.network });
      }

      toast.info(
        "Creating Vault",
        "Please confirm the transaction in your wallet"
      );

      // Create the vault using smart contract
      const durationInDays = vaultData.duration[0] * 30; // Convert months to days (approximate)
      const result = await createSavingsVault(2, {
        // $2 saving fee
        name: vaultData.name,
        network: vaultData.network,
        token: selectedToken,
        amount: vaultData.initialAmount || "0",
        penalty: vaultData.penalty,
        duration: [durationInDays],
      });

      console.log("Vault creation result:", result);
      if (result) {
        setTransactionHash(result as string);
      }

      toast.success(
        "Vault Created!",
        "Your savings vault has been created successfully"
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating vault:", error);
      const { title, message } = getErrorMessage(error);
      toast.error(title, message);
    } finally {
      setIsCreating(false);
    }
  };

  // Social sharing functions
  const shareToFarcaster = () => {
    try {
      const text = `I just created a savings vault "${vaultData.name}" on @bitsave! 🎉 Saving ${vaultData.duration[0]} months to build better financial habits 💜`;
      const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      toast.success("Shared to Farcaster", "Your achievement has been shared!");
    } catch (error) {
      const { title, message } = getErrorMessage(error);
      toast.error(title, message);
    }
  };

  const shareToTwitter = () => {
    try {
      const text = `I just created a savings vault "${vaultData.name}" on Bitsave! 🎉 Saving for ${vaultData.duration[0]} months to build better financial habits 💜`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      toast.success("Shared to Twitter", "Your achievement has been shared!");
    } catch (error) {
      const { title, message } = getErrorMessage(error);
      toast.error(title, message);
    }
  };

  const viewTransaction = () => {
    try {
      const explorerUrl =
        vaultData.network === 8453
          ? `https://basescan.org/tx/${transactionHash}`
          : `https://celoscan.io/tx/${transactionHash}`;
      window.open(explorerUrl, "_blank");
    } catch (error) {
      const { title, message } = getErrorMessage(error);
      toast.error(title, message);
    }
  };

  // Calculate estimated interest rate (realistic DeFi rates)
  const calculateInterestRate = (): number => {
    const durationMonths = vaultData.duration[0] || 1; // Default to 1 month if invalid
    // Base rate: 4% annually, with bonus for longer commitments
    const baseRate = 0.04; // 4%
    const durationBonus = Math.min(0.02, (durationMonths - 1) * 0.001); // Up to 2% bonus for longer terms
    const totalRate = baseRate + durationBonus;

    // Ensure we return a valid number
    return isNaN(totalRate) ? 0.04 : totalRate;
  };

  // Calculate estimated BTS rewards
  const calculateEstimatedRewards = (): string => {
    // Safely parse initial amount, default to 0 if invalid
    const initialAmountString = vaultData.initialAmount?.trim() || "0";
    const initialAmount = parseFloat(initialAmountString) || 0;

    const durationMonths = vaultData.duration[0] || 1; // Default to 1 month if invalid
    const annualRate = calculateInterestRate();

    // Debug logging
    console.log("calculateEstimatedRewards debug:", {
      initialAmountString,
      initialAmount,
      durationMonths,
      annualRate,
      vaultData: vaultData,
    });

    // Calculate interest for the duration
    const monthlyRate = annualRate / 12;
    const totalInterest = initialAmount * monthlyRate * durationMonths;

    // Convert to BTS tokens (assuming 1 USD interest = 0.5 BTS as a reasonable conversion rate)
    const btsRewards = totalInterest * 0.5;

    // Add base rewards for commitment (duration-based)
    const commitmentBonus = durationMonths * 0.1; // 0.1 BTS per month of commitment

    const totalBtsRewards = btsRewards + commitmentBonus;

    // Ensure we always return a valid number, minimum 0.1 BTS
    const finalRewards = Math.max(0.1, totalBtsRewards);

    // Check if the result is NaN and provide fallback
    if (isNaN(finalRewards)) {
      console.error("calculateEstimatedRewards returned NaN, using fallback");
      return "0.1"; // Fallback minimum
    }

    return finalRewards.toFixed(1);
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
                  onChange={(e) =>
                    setVaultData({ ...vaultData, name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Network</Label>
                <Select
                  value={vaultData.network.toString()}
                  onValueChange={(value) =>
                    setVaultData({
                      ...vaultData,
                      network: parseInt(value) as 8453 | 42220 | 84532 | 44787,
                      token: "",
                    })
                  }
                  disabled
                >
                  <SelectTrigger className="rounded-xl">
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

              <div className="space-y-2">
                <Label>Token to Save</Label>
                <Select
                  value={vaultData.token}
                  onValueChange={(value) =>
                    setVaultData({ ...vaultData, token: value })
                  }
                  disabled={!vaultData.network}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTokensForNetwork(vaultData.network).map((token) => (
                      <SelectItem
                        key={token.address}
                        value={token.address || ""}
                      >
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

              <div className="space-y-2">
                <Label htmlFor="initial">Initial Amount (Optional)</Label>
                <Input
                  id="initial"
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0.00"
                  value={vaultData.initialAmount}
                  onChange={(e) => {
                    // Only allow numbers and at most one decimal point
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    // Prevent multiple decimals
                    const sanitized =
                      value.split(".").length > 2
                        ? value.split(".").slice(0, 2).join(".")
                        : value;
                    setVaultData({
                      ...vaultData,
                      initialAmount: sanitized,
                    });
                  }}
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
                  onValueChange={(value) =>
                    setVaultData({ ...vaultData, duration: value })
                  }
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
                  onChange={(e) =>
                    setVaultData({ ...vaultData, penalty: e.target.value })
                  }
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
                  <span className="text-sm font-medium text-yellow-800">
                    Early Withdrawal
                  </span>
                </div>
                <p className="text-xs text-yellow-700">
                  Withdrawing before {vaultData.duration[0]} months will incur a{" "}
                  {vaultData.penalty}% penalty
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + vaultData.duration[0]);
        const selectedToken = getSelectedToken();
        const networkName = config.chains.find(
          (chain) => chain.id === config.state.chainId
        )?.name;

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
                    <span className="font-medium">
                      {vaultData.name || "Unnamed Vault"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <div className="flex items-center space-x-2">
                      {selectedToken?.image && (
                        <Image
                          src={`/${selectedToken.image}`}
                          alt={selectedToken.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      )}
                      <Badge variant="secondary">{selectedToken?.name}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <Badge variant="outline">{networkName}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Initial Amount:</span>
                    <span className="font-medium">
                      {vaultData.initialAmount || "0"}{" "}
                      {selectedToken?.name.includes("USD")
                        ? selectedToken.name
                        : "tokens"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {vaultData.duration[0]} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">
                      {endDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Penalty:</span>
                    <span className="font-medium text-red-600">
                      {vaultData.penalty}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Estimated Rewards
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-bold text-green-600">
                      ~
                      {(() => {
                        try {
                          const rewards = calculateEstimatedRewards();
                          return rewards || "0.1";
                        } catch (error) {
                          console.error("Error calculating rewards:", error);
                          return "0.1";
                        }
                      })()}{" "}
                      $BTS
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Estimated based on{" "}
                    {((calculateInterestRate() || 0.04) * 100).toFixed(1)}%
                    annual rate
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4 text-center space-y-2">
                <h4 className="font-medium text-green-800">Ready to Share?</h4>
                <p className="text-sm text-green-700">
                  "I just started saving with Bitsave 🎉"
                </p>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
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
              <h1 className="text-xl font-bold text-gray-900">
                Create Savings Vault
              </h1>
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
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
                disabled={
                  step === 1 &&
                  (!vaultData.name || !vaultData.token || !vaultData.network)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={isCreating || !isConnected}
              >
                {isCreating ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Creating Vault...</span>
                  </div>
                ) : (
                  "Create Vault 🎉"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span>Vault Created Successfully! 🎉</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4 text-center space-y-3">
                  <PiggyBank className="w-12 h-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-green-800">
                      {vaultData.name}
                    </h3>
                    <p className="text-sm text-green-600">
                      Saving for {vaultData.duration[0]} months on{" "}
                      {vaultData.network === 8453 ? "Base" : "Celo"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium text-center">
                  Share your achievement!
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={shareToFarcaster}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Farcaster
                  </Button>
                  <Button
                    onClick={shareToTwitter}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                </div>
              </div>

              {transactionHash && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={viewTransaction}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Transaction
                  </Button>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push("/my-vaults");
                  }}
                  className="flex-1"
                >
                  View My Vaults
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push("/dashboard");
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
