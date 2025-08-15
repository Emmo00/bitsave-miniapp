import CONTRACT_ADDRESSES, { Stablecoin } from "../constants/addresses";
import { config } from "@/components/providers/WagmiProvider";
import { formatUnits } from "viem";

export interface TokenInfo {
  symbol: string;
  image: string | null;
  name: string;
  decimals: number;
}

export function getChainName(chainId: number): string {
  const chain = config.chains.find((c) => c.id === chainId);
  return chain ? chain.name : "Unknown Chain";
}

/**
 * Get token information (symbol, image, name, decimals) from token address
 * Only supports stablecoins defined in constants/addresses.ts
 * @param tokenId - The token contract address
 * @returns TokenInfo object with symbol, image, name, and decimals
 */
export function getTokenInfo(tokenId: string): TokenInfo {
  // Search through all networks for matching token address
  for (const [network, addresses] of Object.entries(CONTRACT_ADDRESSES)) {
    const stablecoin = addresses.STABLECOINS.find(
      (coin: Stablecoin) =>
        coin.address?.toLowerCase() === tokenId.toLowerCase()
    );

    if (stablecoin) {
      // Extract symbol from name
      let symbol = stablecoin.name;
      if (stablecoin.name === "USD Coin") symbol = "USDC";
      else if (stablecoin.name === "GoodDollar") symbol = "G$";
      else if (stablecoin.name.includes("USD")) symbol = stablecoin.name; // cUSD, USDGLO

      return {
        symbol,
        image: stablecoin.image,
        name: stablecoin.name,
        decimals: stablecoin.decimals,
      };
    }
  }

  // Fallback for unknown tokens - this shouldn't happen in normal usage
  return {
    symbol: "UNKNOWN",
    image: null,
    name: "Unknown Token",
    decimals: 18,
  };
}

/**
 * Format token amount using the correct decimals for the token
 * @param amount - The amount in wei/base units
 * @param tokenId - The token contract address
 * @returns Formatted string with proper decimals
 */
export function formatTokenAmount(amount: bigint, tokenId: string): string {
  const tokenInfo = getTokenInfo(tokenId);
  return formatUnits(amount, tokenInfo.decimals);
}

/**
 * Get all supported tokens for a specific network
 * @param networkName - Network name (e.g., "BASE", "CELO")
 * @returns Array of supported stablecoins for that network
 */
export function getSupportedTokens(networkName: string): Stablecoin[] {
  const networkAddresses = CONTRACT_ADDRESSES[networkName.toUpperCase()];
  return networkAddresses?.STABLECOINS || [];
}

/**
 * Check if a token is supported in the app
 * @param tokenId - The token contract address
 * @returns boolean indicating if the token is supported
 */
export function isTokenSupported(tokenId: string): boolean {
  const tokenInfo = getTokenInfo(tokenId);
  return tokenInfo.symbol !== "UNKNOWN";
}
