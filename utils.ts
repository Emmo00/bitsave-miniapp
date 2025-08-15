import { Hex } from "viem";
import CONTRACT_ADDRESSES from "./constants/addresses";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Returns data about a token address based on app configurations
 *
 * @param tokenAddress token address
 */
export function getCoinFromTokenAddress(tokenAddress: Hex) {
  for (const [chain, config] of Object.entries(CONTRACT_ADDRESSES)) {
    for (const [_, token] of Object.entries(config.STABLECOINS)) {
      if (token.address.toLowerCase() === tokenAddress.toLowerCase()) {
        return { ...token, chain };
      }
    }
  }
  return null;
}
