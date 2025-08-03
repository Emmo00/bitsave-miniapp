import { useUserSavings, SavingDetails } from "./useUserSavings";
import { formatTokenAmount } from "../lib/tokenUtils";

interface ActiveSavingsData {
  activeSavings: SavingDetails[];
  totalActiveSavings: number;
  totalActiveAmount: string;
  totalActiveAmountWei: number;
  totalActiveRewards: string;
  totalActiveRewardsWei: bigint;
  isLoading: boolean;
  error: string | null;
}

export function useActiveSavings(): ActiveSavingsData {
  const { activeSavings, isLoading, error } = useUserSavings();

  // Calculate totals for active savings with proper USD conversion
  let totalActiveAmountUsd = 0;
  
  activeSavings.forEach(saving => {
    // Convert token amount to USD equivalent using proper decimals
    const tokenAmountFormatted = formatTokenAmount(saving.amount, saving.tokenId);
    const usdValue = parseFloat(tokenAmountFormatted);
    totalActiveAmountUsd += usdValue;
  });

  const totalActiveRewards = activeSavings.reduce((sum, saving) => sum + saving.interestAccumulated, 0n);

  return {
    activeSavings,
    totalActiveSavings: activeSavings.length,
    totalActiveAmount: totalActiveAmountUsd.toFixed(2),
    totalActiveAmountWei: totalActiveAmountUsd,
    totalActiveRewards: (parseFloat(totalActiveRewards.toString()) / 1e18).toFixed(6),
    totalActiveRewardsWei: totalActiveRewards,
    isLoading,
    error,
  };
}
