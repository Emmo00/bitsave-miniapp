import sdk from "@farcaster/miniapp-sdk";
import { config } from "../components/providers/WagmiProvider";
import { readContract } from "@wagmi/core";
import BITSAVE_ABI from "../abi/BitSave.json";
import CHILDCONTRACT_ABI from "../abi/ChildContract.json";
import STABLECOIN_ABI from "../abi/ERC20.json";
import CONTRACT_ADDRESSES from "../constants/addresses";
import { Address, zeroAddress } from "viem";

type SupportedChains = keyof typeof CONTRACT_ADDRESSES;

export async function getUserChildContract(
  userAccount: string,
  chainId: number = config.state.chainId
) {
  const chainName = (config.chains
    .find((chain) => chain.id === chainId)
    ?.name.toUpperCase() ?? "BASE") as SupportedChains;
  console.log("contract addresses", CONTRACT_ADDRESSES);
  let contractAddress = CONTRACT_ADDRESSES[chainName]?.BITSAVE;
  console.log(
    "Using contract address:",
    contractAddress,
    "for chain:",
    chainName
  );
  if (!contractAddress) throw new Error("Contract address not found");

  return (await readContract(config, {
    abi: BITSAVE_ABI,
    address: contractAddress as Address,
    functionName: "getUserChildContractAddress",
    account: userAccount as Address,
  })) as Address;
}

export async function getUserChildContractFromAnyChain(userAccount: string) {
  const chains = config.chains;
  for (const chain of chains) {
    try {
      const childContract = await getUserChildContract(userAccount, chain.id);
      if (!childContract || childContract === zeroAddress) {
        console.log(`No child contract found for user on ${chain.name}`);
        continue; // No child contract found, try next chain
      }
      console.log(`Found child contract on ${chain.name}:`, childContract);

      return { childContract, chainId: chain.id };
    } catch (error) {
      console.error(
        `Error fetching user child contract on ${chain.name}:`,
        error
      );
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

export async function getSaving(childContract: string, savingName: string) {
  const result = (await readContract(config, {
    abi: CHILDCONTRACT_ABI,
    address: childContract as Address,
    functionName: "getSaving",
    args: [savingName],
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

export async function getAllUserSavings(childContract: string) {
  // First get all savings names
  const savingsNames = await getUserVaultNames(childContract);

  console.log("User savings names:", savingsNames);

  // Then get all savings data
  const savingsPromises = savingsNames.map(async (name) => {
    const savingData = await getSaving(childContract, name);
    return {
      name,
      ...savingData,
    };
  });

  const allSavings = await Promise.all(savingsPromises);

  console.log("All user savings:", allSavings);

  // Return all savings (both valid and invalid)
  // Invalid savings (isValid = false) are completed/withdrawn savings
  return allSavings;
}

/**
 * Get the balance of a specific ERC20 token for a user
 * @param userAccount - The user's wallet address
 * @param tokenAddress - The ERC20 token contract address
 * @param chainId - The chain ID to query on
 * @returns The balance as a bigint
 */
export async function getTokenBalance(
  userAccount: string,
  tokenAddress: string,
  chainId: number = config.state.chainId
): Promise<bigint> {
  return (await readContract(config, {
    abi: STABLECOIN_ABI,
    address: tokenAddress as Address,
    functionName: "balanceOf",
    args: [userAccount as Address],
    chainId: chainId as 8453 | 42220 | 84532 | 44787,
  })) as bigint;
}
