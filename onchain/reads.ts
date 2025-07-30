import sdk from "@farcaster/miniapp-sdk";
import { config } from "../components/providers/WagmiProvider";
import { readContract } from "@wagmi/core";
import BITSAVE_ABI from "../abi/BitSave.json";
import CHILDCONTRACT_ABI from "../abi/ChildContract.json";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
import { Address } from "viem";

type SupportedChains = keyof typeof CONTRACT_ADDRESSES;

export async function getUserChildContract(
  userAccount: string,
  chainId: number = config.state.chainId
) {
  const chainName = (config.chains.find((chain) => chain.id === chainId)?.name.toUpperCase() ??
    "BASE") as SupportedChains;
  let contractAddress = CONTRACT_ADDRESSES[chainName]?.BITSAVE;
  if (!contractAddress) throw new Error("Contract address not found");

  return (await readContract(config, {
    abi: BITSAVE_ABI,
    address: contractAddress as Address,
    functionName: "getUserChildContract",
    account: userAccount as Address,
  })) as Address;
}

export async function getUserChildContractFromAnyChain(userAccount: string) {
  const chains = config.chains;
  for (const chain of chains) {
    try {
      const childContract = await getUserChildContract(userAccount, chain.id);
      if (childContract) return { childContract, chainId: chain.id };
    } catch (error) {
      console.error(`Error fetching user child contract on ${chain.name}:`, error);
    }
  }
  return null; // No child contract found on any chain
}

export async function getUserVaultNames(childContract: string) {
  const result = (await readContract(config, {
    abi: CHILDCONTRACT_ABI,
    address: childContract as Address,
    functionName: "getSavingsNames",
  })) as { savingsNames: string[] };

  return result.savingsNames;
}
