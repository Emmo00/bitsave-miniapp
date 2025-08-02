import { useUserSavings, SavingDetails } from "./useUserSavings";

interface CompletedSavingsData {
  completedSavings: SavingDetails[];
  totalCompletedSavings: number;
  totalCompletedAmount: string;
  totalCompletedAmountWei: bigint;
  totalCompletedRewards: string;
  totalCompletedRewardsWei: bigint;
  isLoading: boolean;
  error: string | null;
}

export function useCompletedSavings(): CompletedSavingsData {
  const { completedSavings, isLoading, error } = useUserSavings();

  // Calculate totals for completed savings
  const totalCompletedAmount = completedSavings.reduce((sum, saving) => sum + saving.amount, 0n);
  const totalCompletedRewards = completedSavings.reduce((sum, saving) => sum + saving.interestAccumulated, 0n);

  return {
    completedSavings,
    totalCompletedSavings: completedSavings.length,
    totalCompletedAmount: (parseFloat(totalCompletedAmount.toString()) / 1e18).toFixed(6),
    totalCompletedAmountWei: totalCompletedAmount,
    totalCompletedRewards: (parseFloat(totalCompletedRewards.toString()) / 1e18).toFixed(6),
    totalCompletedRewardsWei: totalCompletedRewards,
    isLoading,
    error,
  };
}
