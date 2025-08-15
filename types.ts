interface SavingsPlan {
  name: string;
  amount: number;
  isWithdrawn: boolean;
  startTime: number;
  penaltyPercentage: number;
  maturityTime: number;
  currency?: string;
  chain?: string;
}
