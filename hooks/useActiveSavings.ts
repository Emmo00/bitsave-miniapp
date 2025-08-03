import { useUserSavings, SavingDetails } from "./useUserSavings";

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

export function useActiveSavings(): ActiveSavingsData {
  const { activeSavings, isLoading, error } = useUserSavings();

  // Calculate totals for active savings
  const totalActiveAmount = activeSavings.reduce((sum, saving) => sum + saving.amount, 0n);
  const totalActiveRewards = activeSavings.reduce((sum, saving) => sum + saving.interestAccumulated, 0n);

  return {
    activeSavings,
    totalActiveSavings: activeSavings.length,
    totalActiveAmount: (parseFloat(totalActiveAmount.toString()) / 1e18).toFixed(6),
    totalActiveAmountWei: totalActiveAmount,
    totalActiveRewards: (parseFloat(totalActiveRewards.toString()) / 1e18).toFixed(6),
    totalActiveRewardsWei: totalActiveRewards,
    isLoading,
    error,
  };
}
