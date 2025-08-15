import sdk from "@farcaster/miniapp-sdk";
import { config } from "../components/providers/WagmiProvider";
import { readContract } from "@wagmi/core";
import BITSAVE_ABI from "../abi/BitSave.json";
import CHILDCONTRACT_ABI from "../abi/ChildContract.json";
import CONTRACT_ADDRESSES from "../constants/addresses";
import { Address, zeroAddress } from "viem";

type SupportedChains = keyof typeof CONTRACT_ADDRESSES;
type ChainId = (typeof config.chains)[number]["id"];

export async function getAllUserChildContractsFromAnyChain(
  userAccount: string
) {
  const chains = config.chains;
  const childContracts = [];
  for (const chain of chains) {
    try {
      const childContract = await getUserChildContract(userAccount, chain.id);
      if (!childContract || childContract === zeroAddress) {
        continue; // No child contract found, try next chain
      }

      childContracts.push({ childContract, chainId: chain.id });
    } catch (error) {
      // Error fetching user child contract, try next chain
      console.log("Error fetching user child contract:", error);
    }
  }
  return childContracts.length > 0 ? childContracts : null; // Return found child contracts or null
}

export async function getAllUserSavings(
  childContract: string,
  chainId: ChainId
) {
  // First get all savings names
  const savingsNames = await getUserVaultNames(childContract, chainId);

  // Then get all savings data
  const savingsPromises = savingsNames.map(async (name) => {
    const savingData = await getSaving(childContract, name, chainId);
    return {
      name,
      ...savingData,
    };
  });

  const allSavings = await Promise.all(savingsPromises);

  // Return all savings (both valid and invalid)
  // Invalid savings (isValid = false) are completed/withdrawn savings
  return allSavings;
}

export async function getUserChildContract(
  userAccount: string,
  chainId: ChainId = config.state.chainId
) {
  const chainName = (config.chains
    .find((chain) => chain.id === chainId)
    ?.name.toUpperCase() ?? "BASE") as SupportedChains;
  let contractAddress = CONTRACT_ADDRESSES[chainName]?.BITSAVE;
  if (!contractAddress) throw new Error("Contract address not found");

  return (await readContract(config, {
    abi: BITSAVE_ABI,
    address: contractAddress as Address,
    functionName: "getUserChildContractAddress",
    account: userAccount as Address,
    chainId,
  })) as Address;
}

export async function getUserVaultNames(
  childContract: string,
  chainId: ChainId
) {
  const result = (await readContract(config, {
    abi: CHILDCONTRACT_ABI,
    address: childContract as Address,
    functionName: "getSavingsNames",
    chainId,
  })) as { savingsNames: string[] };

  return result.savingsNames;
}

export async function getSaving(
  childContract: string,
  savingName: string,
  chainId: ChainId
) {
  const result = (await readContract(config, {
    abi: CHILDCONTRACT_ABI,
    address: childContract as Address,
    functionName: "getSaving",
    args: [savingName],
    chainId,
  })) as {
    isValid: boolean;
    amount: bigint;
    tokenId: string;
    interestAccumulated: bigint;
    startTime: bigint;
    penaltyPercentage: bigint;
    maturityTime: bigint;
    isSafeMode: boolean;
  };

  return result;
}
