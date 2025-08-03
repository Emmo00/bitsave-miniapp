import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Address, formatEther, formatUnits } from "viem";
import { getUserChildContractFromAnyChain, getAllUserSavings } from "../onchain/reads";
import CONTRACT_ADDRESSES from "../constants/addresses";

export interface SavingDetails {
  name: string;
  amount: bigint;
  amountFormatted: string;
  tokenId: string;
  interestAccumulated: bigint;
  interestFormatted: string;
  startTime: bigint;
  penaltyPercentage: bigint;
  maturityTime: bigint;
  isSafeMode: boolean;
  isValid: boolean;
  isActive: boolean; // true if isValid = true (not withdrawn)
  isMatured: boolean; // true if current time >= maturityTime
  timeToMaturity: number; // in seconds, negative if already matured
  progressPercentage: number; // progress based on time elapsed
}

interface UserSavingsData {
  allSavings: SavingDetails[];
  activeSavings: SavingDetails[];
  completedSavings: SavingDetails[];
  totalActiveSavings: number;
  totalCompletedSavings: number;
  isLoading: boolean;
  error: string | null;
}

// Helper function to get token decimals from token address
function getTokenDecimals(tokenAddress: string): number {
  // Search through all networks and stablecoins to find the token
  for (const network of Object.values(CONTRACT_ADDRESSES)) {
    const token = network.STABLECOINS.find(
      (stablecoin) => stablecoin.address?.toLowerCase() === tokenAddress.toLowerCase()
    );
    if (token) {
      return token.decimals;
    }
  }
  // Default to 18 decimals if token not found (most ERC20 tokens use 18)
  return 18;
}

export function useUserSavings(): UserSavingsData {
  const { address } = useAccount();
  const [childContractInfo, setChildContractInfo] = useState<{
    address: string;
    chainId: number;
  } | null>(null);
  const [allSavings, setAllSavings] = useState<SavingDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to get child contract address
  useEffect(() => {
    if (!address) {
      setChildContractInfo(null);
      setAllSavings([]);
      return;
    }

    const fetchChildContract = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserChildContractFromAnyChain(address);
        if (result) {
          setChildContractInfo({
            address: result.childContract,
            chainId: result.chainId,
          });
        } else {
          setChildContractInfo(null);
          setAllSavings([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch child contract");
        setChildContractInfo(null);
        setAllSavings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildContract();
  }, [address]);

  // Effect to fetch all savings
  useEffect(() => {
    if (!childContractInfo?.address) {
      setAllSavings([]);
      return;
    }

    const fetchAllSavings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const rawSavings = await getAllUserSavings(childContractInfo.address);
        const currentTime = Math.floor(Date.now() / 1000);

        const processedSavings: SavingDetails[] = rawSavings.map(saving => {
          const maturityTimeSeconds = Number(saving.maturityTime);
          const startTimeSeconds = Number(saving.startTime);
          const currentTime = Math.floor(Date.now() / 1000);
          
          // Get token decimals for proper formatting
          const tokenDecimals = getTokenDecimals(saving.tokenId);
          
          // Active = isValid true (not withdrawn)
          // Completed = isValid false (withdrawn)
          const isActive = saving.isValid;
          const isCompleted = !saving.isValid;
          const isMatured = currentTime >= maturityTimeSeconds;
          const timeToMaturity = maturityTimeSeconds - currentTime;
          
          // Calculate progress percentage based on time elapsed
          const totalDuration = maturityTimeSeconds - startTimeSeconds;
          const timeElapsed = currentTime - startTimeSeconds;
          const progressPercentage = totalDuration > 0 
            ? Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100))
            : 100;

          return {
            name: saving.name,
            amount: saving.amount,
            amountFormatted: formatUnits(saving.amount, tokenDecimals),
            tokenId: saving.tokenId,
            interestAccumulated: saving.interestAccumulated,
            interestFormatted: formatEther(saving.interestAccumulated), // Interest is in native token (ETH/MATIC etc)
            startTime: saving.startTime,
            penaltyPercentage: saving.penaltyPercentage,
            maturityTime: saving.maturityTime,
            isSafeMode: saving.isSafeMode,
            isValid: saving.isValid,
            isActive,
            isMatured,
            timeToMaturity,
            progressPercentage,
          };
        });

        setAllSavings(processedSavings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch savings");
        setAllSavings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSavings();
  }, [childContractInfo]);

  // Separate active and completed savings based on withdrawal status
  const activeSavings = allSavings.filter(saving => saving.isActive); // isValid = true
  const completedSavings = allSavings.filter(saving => !saving.isActive); // isValid = false (withdrawn)

  return {
    allSavings,
    activeSavings,
    completedSavings,
    totalActiveSavings: activeSavings.length,
    totalCompletedSavings: completedSavings.length,
    isLoading,
    error,
  };
}
