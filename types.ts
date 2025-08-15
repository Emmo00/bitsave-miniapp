import { Stablecoin } from "@/constants/addresses";
import type { config } from "@/components/providers/WagmiProvider";
import CONTRACT_ADDRESSES from "@/constants/addresses";
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

export type ChainId = (typeof config.chains)[number]["id"];
export type SupportedChains = keyof typeof CONTRACT_ADDRESSES;
