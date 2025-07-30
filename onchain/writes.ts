import { writeContract, simulateContract } from "@wagmi/core";
import BITSAVE_ABI from "../abi/BitSave.json";
import CONTRACT_ADDRESSES, { Stablecoin } from "../constants/addresses";
import { config } from "../components/providers/WagmiProvider";
import { getJoinFeeInNativeTokenBasedOnChain } from "../onchain/actions";
import { Address, parseEther } from "viem";

type SupportedChains = keyof typeof CONTRACT_ADDRESSES;

export async function joinBitSave(joinFeeInDollars: number) {
  const chainId = config.state.chainId;
  const chainName = (config.chains
    .find((chain) => chain.id === chainId)
    ?.name.toUpperCase() ?? "BASE") as SupportedChains;
  let contractAddress = CONTRACT_ADDRESSES[chainName]?.BITSAVE;
  if (!contractAddress) throw new Error("Contract address not found");

  config.connectors[0].getChainId = async () => chainId; // Ensure the connector uses the correct chain ID

  const { request, result } = await simulateContract(config, {
    abi: BITSAVE_ABI,
    address: contractAddress as Address,
    functionName: "joinBitsave",
    value: parseEther(
      await getJoinFeeInNativeTokenBasedOnChain(chainId, joinFeeInDollars)
    ),
    connector: config.connectors[0],
  });

  console.log("Simulated join BitSave transaction result:", result);

  const writeResult = await writeContract(config, request);

  console.log("Join BitSave transaction result:", writeResult);

  return writeResult;
}

export async function createSavingsVault(
  savingFeeInDollars: number,
  {
    name,
    network,
    token,
    amount,
    penalty,
    duration,
  }: {
    name: string;
    network: number;
    token: Stablecoin;
    amount: string;
    penalty: string;
    duration: number[];
  }
) {
  const maturityTime = Date.now() / 1000 + duration[0] * 24 * 60 * 60; // Current time in seconds + duration in seconds

  const chainId = config.state.chainId;
  const chainName = (config.chains
    .find((chain) => chain.id === chainId)
    ?.name.toUpperCase() ?? "BASE") as SupportedChains;
  let contractAddress = CONTRACT_ADDRESSES[chainName]?.BITSAVE;
  if (!contractAddress) throw new Error("Contract address not found");

  config.connectors[0].getChainId = async () => chainId; // Ensure the connector uses the correct chain ID

  const { request, result } = await simulateContract(config, {
    abi: BITSAVE_ABI,
    address: contractAddress as Address,
    functionName: "createSaving",
    value: parseEther(
      await getJoinFeeInNativeTokenBasedOnChain(chainId, savingFeeInDollars)
    ),
    args: [
      name, // Vault name
      maturityTime, // Maturity time in seconds
      penalty, // Penalty percentage
      false, // Is save mode
      token.address as Address, // Stablecoin address
      amount, // Amount in stablecoin
    ],
    connector: config.connectors[0],
  });

  console.log("Simulated create Savings Vault transaction result:", result);

  const writeResult = await writeContract(config, request);

  console.log("Create Savings Vault transaction result:", writeResult);

  return writeResult;
}
