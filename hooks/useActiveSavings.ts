import { useUserSavings, SavingDetails } from "./useUserSavings";
import CONTRACT_ADDRESSES from "../constants/addresses";
import { formatUnits } from "viem";

interface ActiveSavingsData {
  activeSavings: SavingDetails[];
  totalActiveSavings: number;
  totalActiveAmount: string;
  totalActiveAmountWei: bigint;
  totalActiveRewards: string;
  totalActiveRewardsWei: bigint;
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

export function useActiveSavings(): ActiveSavingsData {
  const { activeSavings, isLoading, error } = useUserSavings();

  // Calculate totals for active savings with proper decimal handling
  let totalActiveAmountUsd = 0;
  let totalActiveAmountWei = 0n;
  
  activeSavings.forEach(saving => {
    // Get token decimals for proper normalization
    const tokenDecimals = getTokenDecimals(saving.tokenId);
    // Convert to USD value (assuming 1:1 for stablecoins)
    const usdValue = parseFloat(formatUnits(saving.amount, tokenDecimals));
    totalActiveAmountUsd += usdValue;
    totalActiveAmountWei += saving.amount;
  });

  const totalActiveRewards = activeSavings.reduce((sum, saving) => sum + saving.interestAccumulated, 0n);

  return {
    activeSavings,
    totalActiveSavings: activeSavings.length,
    totalActiveAmount: totalActiveAmountUsd.toFixed(2),
    totalActiveAmountWei: totalActiveAmountWei,
    totalActiveRewards: (parseFloat(totalActiveRewards.toString()) / 1e18).toFixed(6),
    totalActiveRewardsWei: totalActiveRewards,
    isLoading,
    error,
  };
}
