"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BaseError, useAccount, useConnect } from "wagmi";
import { switchChain } from "../../onchain/actions";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Plus,
  PiggyBank,
  Users,
  CheckCircle,
  Wallet,
  Sparkles,
  Info,
  Link,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
import sdk from "@farcaster/miniapp-sdk";
import { config } from "../../components/providers/WagmiProvider";
import {
  getUserChildContract,
  getUserChildContractFromAnyChain,
  getUserVaultNames,
} from "../../onchain/reads";
import { createSavingsVault, joinBitSave } from "../../onchain/writes";
import { useToast } from "../../hooks/useToast";
import { WriteContractErrorType } from "@wagmi/core";
import CONTRACT_ADDRESSES, { Stablecoin } from "../../constants/addresses";

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();

  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState<
    (typeof config)["chains"][number]["id"]
  >(config.state.chainId);
  const [vaultConfig, setVaultConfig] = useState<{
    name: string;
    network: number;
    token: Stablecoin;
    amount: string;
    penalty: string;
    duration: number[];
  }>({
    name: "Creator Vault",
    network: selectedChain,
    token:
      CONTRACT_ADDRESSES[
        config.chains
          .find((chain) => chain.id === selectedChain)
          ?.name.toUpperCase() ?? "BASE"
      ].STABLECOINS[0], // Default to first stablecoin
    amount: "0",
    penalty: "0",
    duration: [0], // 0 means unlock anytime
  });

  const [isAMember, setIsAMember] = useState(false);
  const [isVaultCreated, setIsVaultCreated] = useState(false);

  useEffect(() => {
    // connect wallet if not connected
    if (!isConnected) {
      connect({ connector: connectors[0] }); // Connect to Farcaster Frame by default
    }
  }, []);

  useEffect(() => {
    // switch chain when selectedChain changes
    const switchSelectedChain = async () => {
      console.log("Switched to chain:", selectedChain);
      // switch chain in Farcaster SDK
      await switchChain(selectedChain.toString());
      console.log(config.state.chainId);
    };
    switchSelectedChain();
  }, [selectedChain]);

  useEffect(() => {
    // check and set membership flag
    sdk.actions.ready(); // Notify the SDK that the miniapp is ready
    console.log("Bitsave miniapp is ready");

    // Check if user is already a member
    const checkMembership = async () => {
      if (!isConnected || !address) return;

      try {
        const result = await getUserChildContractFromAnyChain(
          address.toLowerCase()
        );
        if (!result) {
          console.log("User is not a member of Bitsave");
          setIsAMember(false);
          return;
        }
        const { childContract, chainId } = result;
        setIsAMember(!!childContract);
        await switchChain(chainId.toString()); // Switch to the chain of the child contract
        console.log(`User is a member of Bitsave on chain ${chainId}`);
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };

    checkMembership();
  }, [isConnected, address]);

  useEffect(() => {
    // get user vault names if member
    const fetchUserVaults = async () => {
      if (!isConnected || !address || !isAMember) return;

      try {
        const result = await getUserChildContractFromAnyChain(
          address.toLowerCase()
        );
        console.log("User child contract result [onboarding]:", result);
        if (!result) {
          console.log("User has no child contract or is not a member");
          return;
        }
        const { childContract, chainId } = result;
        if (childContract) {
          const vaultNames = await getUserVaultNames(childContract);
          // setIsVaultCreated(vaultNames.length > 0);
          console.log("User vaults:", vaultNames);
          await switchChain(chainId.toString()); // Switch to the chain of the child contract
        }
      } catch (error) {
        console.error("Error fetching user vaults:", error);
      }
    };
    fetchUserVaults();
  }, [isConnected, address, isAMember]);

  useEffect(() => {
    // redirect to dashboard if isVaultCreated
    if (isVaultCreated) {
      router.push("/dashboard");
    }
  }, [isVaultCreated]);

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
      title: "Choose Chain",
      description: "Select the chain you want to use for your vault",
      cost: "Free",
      icon: <Link className="w-6 h-6" />,
      color: "yellow",
    },
    {
      id: 3,
      title: "Join Bitsave",
      description: "Become a member of the Bitsave community",
      cost: "$1.00",
      icon: <Users className="w-6 h-6" />,
      color: "blue",
    },
    {
      id: 4,
      title: "Create Creator Vault",
      description: "Set up your first savings vault to start earning",
      cost: "$1.00",
      icon: <PiggyBank className="w-6 h-6" />,
      color: "green",
    },
  ];

  const joiningFee = 1; // Set the joining fee for Bitsave membership (Dollars)
  const savingFee = 1; // Set the saving fee for creating a vault (Dollars)
  const totalSteps = steps.length;

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => stepId === currentStep;
  const isStepAccessible = (stepId: number) => stepId <= currentStep;

  const handleStepAction = async (stepId: number) => {
    if (stepId === 4) {
      // Open vault configuration modal instead of directly processing
      setShowVaultModal(true);
      return;
    }

    setIsProcessing(true);

    if (stepId === 1) {
      // Add miniapp to Farcaster
      sdk.actions
        .addMiniApp()
        .then(() => {
          console.log("Bitsave MiniApp added to Farcaster");
          setCompletedSteps((prev) => [...prev, 1]);
          setCurrentStep(stepId + 1);
          setIsProcessing(false);
        })
        .catch((error) => {
          console.error("Error adding Bitsave MiniApp:", error);
          setCompletedSteps((prev) => [...prev, 1]); // debug
          console.log("Skipping to next step due to error");
          setCurrentStep(stepId + 1);
          setIsProcessing(false);
        });
    }

    if (stepId === 3) {
      // process joining transaction
      if (!isConnected) {
        // make sure is connected
        connect({ connector: connectors[0] });
      }

      // make transaction to join Bitsave
      try {
        const transactionHash = await joinBitSave(joiningFee);
        console.log("Transaction successful:", transactionHash);
        toast.success("Transaction Successfull", "Successfully joined BitSave");
        setCompletedSteps((prev) => [...prev, 3]);
        setCurrentStep(stepId + 1);
        setIsAMember(true);
        setIsProcessing(false);
      } catch (error) {
        console.error("Error joining Bitsave:", error);
        toast.error(
          "Transaction Failed",
          (error as BaseError).shortMessage ||
            "Failed to join BitSave. Please try again."
        );
        setIsProcessing(false);
      }
    }
  };

  const handleCreateVault = async () => {
    setShowVaultModal(false);
    setIsProcessing(true);

    // process create saving transaction
    if (!isConnected) {
      // make sure is connected
      connect({ connector: connectors[0] });
    }

    // make transaction to create savings vault
    try {
      const transactionHash = await createSavingsVault(savingFee, vaultConfig);
      console.log("Transaction successful:", transactionHash);
      toast.success(
        "Transaction Successfull",
        "Successfully created Savings Vault"
      );
      setCompletedSteps((prev) => [...prev, 4]);
      setIsProcessing(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating Savings Vault:", error);
      toast.error(
        "Transaction Failed",
        (error as BaseError).shortMessage ||
          "Failed to create Savings Vault. Please try again."
      );
      setIsProcessing(false);
    }
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
              <h3 className="text-lg font-semibold text-gray-900">
                Add Bitsave to Farcaster
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Add the Bitsave MiniApp in your Farcaster client for easy access
                to your savings.
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
                  <span>Adding...</span>
                </div>
              ) : isStepCompleted(1) ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Installed</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add to Farcaster</span>
                </div>
              )}
            </Button>
          </div>
        );

      case 2: // choose wallet
        return (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Link className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Choose Chain
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Select the chain you want to use for your vault. Base is
                recommended for lowest fees.
              </p>
            </div>

            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4 space-y-3">
                <Label className="flex items-center space-x-2">
                  <span>Chain</span>
                </Label>
                <Select
                  value={`${selectedChain}`}
                  onValueChange={(value) => {
                    setVaultConfig({ ...vaultConfig, network: Number(value) });
                    setSelectedChain(
                      Number(value) as (typeof config)["chains"][number]["id"]
                    ); // track global chain state
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.chains.map((chain) => (
                      <SelectItem value={`${chain.id}`} key={chain.id}>
                        <div className="flex items-center space-x-2">
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Base offers the low transaction fees for creators
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={() => {
                setCompletedSteps((prev) => [...prev, 2]);
                setCurrentStep(3);
              }}
              disabled={isProcessing || isStepCompleted(2)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 h-12"
            >
              {isStepCompleted(2) ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Chain Selected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4" />
                  <span>Continue</span>
                </div>
              )}
            </Button>
          </div>
        );

      case 3:
        return !isAMember ? (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Join Bitsave
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Become a member of the Bitsave community and unlock exclusive
                features.
              </p>
            </div>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-800">
                    Membership Benefits:
                  </h4>
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
              onClick={() => handleStepAction(3)}
              disabled={
                isProcessing || isStepCompleted(3) || !isStepCompleted(2)
              }
              className="w-full bg-blue-500 hover:bg-blue-600 h-12"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : isStepCompleted(3) ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Joined</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>Join for ${joiningFee}.00</span>
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Already a Member
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                You are already a member of the Bitsave community. Proceed to
                create your vault.
              </p>
            </div>
            <Button
              onClick={() => {
                setCompletedSteps((prev) => [...prev, 3]);
                setCurrentStep(4);
              }}
              disabled={isProcessing || isStepCompleted(3)}
              className="w-full bg-blue-500 hover:bg-blue-600 h-12"
            >
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Proceed to Create Vault</span>
              </div>
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <PiggyBank className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Create Creator Vault
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Set up your first savings vault and start earning $BTS rewards.
              </p>
            </div>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-green-800">
                    Creator Vault Features:
                  </h4>
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
              onClick={() => handleStepAction(4)}
              disabled={
                isProcessing || isStepCompleted(4) || !isStepCompleted(3)
              }
              className="w-full bg-green-500 hover:bg-green-600 h-12"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Vault...</span>
                </div>
              ) : isStepCompleted(4) ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Vault Created</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <PiggyBank className="w-4 h-4" />
                  <span>Create Vault for ${savingFee}.00</span>
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
            <Button
              size="icon"
              variant={"secondary"}
              onClick={() => {
                if (currentStep === 1) router.push("/landing");
                else setCurrentStep(currentStep - 1);
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Get Started with Bitsave
              </h1>
              <p className="text-sm text-gray-600">
                Complete these steps to start saving
              </p>
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
              <Progress
                value={(completedSteps.length / totalSteps) * 100}
                className="h-3"
              />
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
                    {isStepCompleted(step.id) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
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
              {getStepContent(
                steps.find((s) => s.id === currentStep) || steps[0]
              )}
            </CardContent>
          </Card>

          {/* Total Cost */}
          {currentStep !== 1 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4 text-center space-y-2">
                <h4 className="font-medium text-orange-800">
                  Total Setup Cost
                </h4>
                <div className="text-2xl font-bold text-green-600">$2.00</div>
                <p className="text-sm text-orange-700">
                  One-time setup fee to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Vault Configuration Modal */}
      <Dialog open={showVaultModal} onOpenChange={setShowVaultModal}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-hidden flex flex-col text-black">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <PiggyBank className="w-5 h-5 text-green-500" />
              <span>Configure Your Creator Vault</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4">
              {/* Recommended Defaults Notice */}
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Recommended Settings
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    These defaults are optimized for new creators. You can
                    customize them, but the defaults work great!
                  </p>
                </CardContent>
              </Card>

              {/* Vault Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="vault-name"
                  className="flex items-center space-x-2"
                >
                  <span>Vault Name</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    Recommended
                  </Badge>
                </Label>
                <Input
                  id="vault-name"
                  value={vaultConfig.name}
                  onChange={(e) =>
                    setVaultConfig({ ...vaultConfig, name: e.target.value })
                  }
                  className="rounded-xl"
                  placeholder="Creator Vault"
                />
                <p className="text-xs text-gray-500">
                  Perfect for creators starting their savings journey
                </p>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <span>Network</span>
                </Label>
                <Select
                  disabled={true}
                  value={config.state.chainId.toString()}
                  onValueChange={(value) =>
                    setVaultConfig({ ...vaultConfig, network: Number(value) })
                  }
                >
                  <SelectTrigger className="rounded-xl" disabled>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.chains.map((chain) => (
                      <SelectItem value={`${chain.id}`} key={chain.id}>
                        <div className="flex items-center space-x-2">
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Base offers low transaction fees for creators
                </p>
              </div>

              {/* Token */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <span>Token to Save</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    Recommended
                  </Badge>
                </Label>
                <Select
                  value={vaultConfig.token.address}
                  onValueChange={(value) =>
                    setVaultConfig({
                      ...vaultConfig,
                      token: CONTRACT_ADDRESSES[
                        config.chains
                          .find((chain) => chain.id === config.state.chainId)
                          ?.name.toUpperCase() ?? "BASE"
                      ].STABLECOINS.find(
                        (stablecoin) => stablecoin.address === value
                      )!,
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_ADDRESSES[
                      config.chains
                        .find((chain) => chain.id === config.state.chainId)
                        ?.name.toUpperCase() ?? "BASE"
                    ].STABLECOINS.map((stablecoin) => (
                      <SelectItem
                        value={stablecoin.address!}
                        key={stablecoin.address}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{stablecoin.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  USDC maintains stable value - perfect for savings goals
                </p>
              </div>

              {/* Initial Amount */}
              <div className="space-y-2">
                <Label
                  htmlFor="initial-amount"
                  className="flex items-center space-x-2"
                >
                  <span>Initial Amount (Optional)</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    Start Small
                  </Badge>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="initial-amount"
                    type="number"
                    value={vaultConfig.amount}
                    onChange={(e) =>
                      setVaultConfig({ ...vaultConfig, amount: e.target.value })
                    }
                    className="pl-8 rounded-xl"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Start with $0 and add funds as you earn - no pressure!
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <span>
                    Duration:{" "}
                    {vaultConfig.duration[0] === 0
                      ? "Unlock Anytime"
                      : `${vaultConfig.duration[0]} months`}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    Flexible
                  </Badge>
                </Label>
                <Slider
                  value={vaultConfig.duration}
                  onValueChange={(value) =>
                    setVaultConfig({ ...vaultConfig, duration: value })
                  }
                  max={24}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Unlock Anytime</span>
                  <span>24 months</span>
                </div>
                <p className="text-xs text-gray-500">
                  Flexible access means you can withdraw whenever needed
                </p>
              </div>

              {/* Penalty */}
              <div className="space-y-2">
                <Label
                  htmlFor="penalty"
                  className="flex items-center space-x-2"
                >
                  <span>Early Withdrawal Penalty</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    No Penalty
                  </Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="penalty"
                    type="number"
                    value={vaultConfig.penalty}
                    onChange={(e) =>
                      setVaultConfig({
                        ...vaultConfig,
                        penalty: e.target.value,
                      })
                    }
                    className="pr-8 rounded-xl"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  No penalty means complete flexibility - perfect for beginners
                </p>
              </div>

              {/* Info Card */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Why These Defaults?
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-blue-700">
                    <li>
                      • <strong>Base + USDC:</strong> Lowest fees, stable value
                    </li>
                    <li>
                      • <strong>No penalty:</strong> Learn without pressure
                    </li>
                    <li>
                      • <strong>Flexible duration:</strong> Access funds when
                      needed
                    </li>
                    <li>
                      • <strong>$0 start:</strong> Begin earning, then save
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 pt-4 space-y-3">
            <Button
              onClick={handleCreateVault}
              className="w-full bg-green-500 hover:bg-green-600 h-12"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Vault...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <PiggyBank className="w-4 h-4" />
                  <span>Create Vault for $1.00</span>
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowVaultModal(false)}
              className="w-full bg-transparent"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
