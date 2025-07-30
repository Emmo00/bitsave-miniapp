import sdk from "@farcaster/miniapp-sdk";

export async function switchChain(chainId: string) {
  await sdk.wallet.ethProvider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId }],
  });
}
