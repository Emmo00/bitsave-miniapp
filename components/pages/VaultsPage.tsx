import { ChevronDown, Plus, TrendingUp, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import SavingsPlanDetailsPage from "./SavingsPlanDetailsPage";
import TopUpModal from "@/components/modals/TopUpModal";
import WithdrawModal from "@/components/modals/WithdrawModal";

// vaults = "saving plans"

// Mock interface for UI development
interface MockSavingDetails {
  name: string;
  amountFormatted: string;
  tokenId: string;
  startTime: number;
  maturityTime: number;
  timeToMaturity: number;
  interestFormatted: string;
  penaltyPercentage: number;
  isActive: boolean;
  isMatured: boolean;
}

type Props = {
  setCurrentTab: (tab: any) => void;
};

export default function VaultsPage({ setCurrentTab }: Props) {
  const [selectedSaving, setSelectedSaving] = useState<MockSavingDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    const now = Math.floor(Date.now() / 1000);
    setCurrentTime(now);
  }, []);

  // Mock data for UI development
  const mockSavings: MockSavingDetails[] = [
    {
      name: "Apple MacBook Air",
      amountFormatted: "595",
      tokenId: "cUSD",
      startTime: 1656720000, // July 2, 2022
      maturityTime: 1724371200, // August 23, 2025
      timeToMaturity: currentTime ? 1724371200 - currentTime : 0,
      interestFormatted: "23.8",
      penaltyPercentage: 5,
      isActive: true,
      isMatured: false
    },
    {
      name: "Emergency Fund",
      amountFormatted: "1200",
      tokenId: "USDC",
      startTime: 1672531200, // Jan 1, 2023
      maturityTime: 1735689600, // Jan 1, 2025
      timeToMaturity: currentTime ? 1735689600 - currentTime : 0,
      interestFormatted: "48.0",
      penaltyPercentage: 3,
      isActive: true,
      isMatured: false
    }
  ];

  const handleCardClick = (saving: MockSavingDetails) => {
    setSelectedSaving(saving);
    setShowDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowDetails(false);
    setSelectedSaving(null);
  };

  if (showDetails) {
    return (
      <SavingsPlanDetailsPage 
        savingDetails={selectedSaving}
        setCurrentTab={setCurrentTab}
        onBack={handleBackFromDetails}
      />
    );
  }
  
  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className="pt-[10vh] text-black pb-32">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl animate-fade-in-up">
        <div className="flex justify-between py-2 px-1">
          <h1 className="text-2xl font-bold">Savings Plans</h1>
          <button
            type="button"
            aria-label="Close"
            className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
            onClick={() => setCurrentTab("home")}
          >
            <X className="w-4 h-4 text-gray-800" />
          </button>
        </div>

        {/* Savings Plans List */}
        {mockSavings.map((saving: MockSavingDetails, index: number) => (
          <Card
            key={index}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
            style={{
              animation: `fadeInUp 0.3s ease-out ${0.1 * (index + 1)}s both`,
            }}
            onClick={() => handleCardClick(saving)}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-gray-800 font-medium mb-1">
                  {saving.name}
                </h3>
                <p className="text-[0.7rem]">
                  created: {new Date(saving.startTime * 1000).toLocaleDateString()}
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  {saving.amountFormatted} {saving.tokenId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                  <div className="text-xs py-1 px-2">
                    <span>{saving.tokenId}</span> on <span>CELO</span>
                  </div>
                </div>
              </div>
            </div>
            <Progress
              value={
                isClient && currentTime
                  ? Math.min(((currentTime - saving.startTime) / (saving.maturityTime - saving.startTime)) * 100, 100)
                  : 0
              }
              className="h-4 bg-white/20 backdrop-blur-sm border border-white/30"
            />
            <div className="flex justify-between pt-2">
              <span></span>
              <span className="text-xs text-green-600">
                Matures: {isClient ? new Date(saving.maturityTime * 1000).toLocaleDateString() : "Loading..."}
              </span>
            </div>
            <div className="flex justify-between">
              <div></div>
              <div className="flex justify-center items-center gap-2">
                <WithdrawModal
                  planName={saving.name}
                  tokenSymbol={saving.tokenId}
                  totalAmount={saving.amountFormatted}
                  isMatured={saving.isMatured}
                  penaltyPercentage={saving.penaltyPercentage}
                  maturityDate={new Date(saving.maturityTime * 1000)}
                  onWithdraw={() => {
                    // Handle the withdraw action here
                    console.log(`Withdrew from ${saving.name}`);
                  }}
                >
                  <Button 
                    variant="outline" 
                    className="mt-4 mr-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                    }}
                  >
                    <ChevronDown className="" /> Withdraw
                  </Button>
                </WithdrawModal>
                <TopUpModal 
                  planName={saving.name}
                  tokenSymbol={saving.tokenId}
                  onTopUp={(amount) => {
                    // Handle the top up action here
                    console.log(`Topped up ${amount} ${saving.tokenId} to ${saving.name}`);
                  }}
                >
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white font-medium py-2 rounded-lg mt-4"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                    }}
                  >
                    <Plus className="" /> Deposit
                  </Button>
                </TopUpModal>
              </div>
            </div>
          </Card>
        ))}

        {mockSavings.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Savings Plans Yet</h3>
            <p className="text-gray-500 mb-6">Create your first savings plan to start building your future!</p>
            <Button 
              onClick={() => setCurrentTab("create")}
              className="bg-gradient-to-r from-weirdBlue to-weirdGreen text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Savings Plan
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
