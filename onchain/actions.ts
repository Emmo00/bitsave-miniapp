import sdk from "@farcaster/miniapp-sdk";
import { base, baseSepolia, celo, celoAlfajores } from "wagmi/chains";
import { fetchEthPrice, fetchCeloPrice } from "../lib/fetch";

export async function switchChain(chainId: string) {
  await sdk.wallet.ethProvider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId }],
  });
}

export async function getJoinFeeInNativeTokenBasedOnChain(
  chainId: number,
  joinFeeInDollars: number
) {
  if (chainId === base.id || chainId === baseSepolia.id) {
    const ethPrice = await fetchEthPrice();
    return (joinFeeInDollars / ethPrice).toFixed(18); // Return value in ETH
  }
  if (chainId === celo.id || chainId === celoAlfajores.id) {
    const celoPrice = await fetchCeloPrice();
    return (joinFeeInDollars / celoPrice).toFixed(18); // Return value in CELO
  }
  throw new Error("Unsupported chain for join fee calculation");
}
