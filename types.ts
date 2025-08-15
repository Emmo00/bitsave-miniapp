import { Stablecoin } from "./constants/addresses";

export interface SavingsPlan {
  name: string;
  amount: bigint;
  formattedAmount: string;
  amountInDollar: number;
  isWithdrawn: boolean;
  startTime: number;
  penaltyPercentage: number;
  maturityTime: number;
  token: Stablecoin & { chain: string };
}
