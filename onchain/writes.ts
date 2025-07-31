import { writeContract, simulateContract, sendCalls } from "@wagmi/core";
import BITSAVE_ABI from "../abi/BitSave.json";
import CHILD_CONTRACT_ABI from "../abi/ChildContract.json";
import STABLECOIN_ABI from "../abi/ERC20.json";
import CONTRACT_ADDRESSES, { Stablecoin } from "../constants/addresses";
import { config } from "../components/providers/WagmiProvider";
import { getJoinFeeInNativeTokenBasedOnChain } from "../onchain/actions";
import { Address, parseEther, parseUnits } from "viem";

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
  const maturityTime =
    Math.floor(Date.now() / 1000 + duration[0] * 24 * 60 * 60) + 15 * 60; // Current time in seconds + duration in seconds + 15 minutes buffer

  const chainId = network;
  const chainName = (config.chains
    .find((chain) => chain.id === chainId)
    ?.name.toUpperCase() ?? "BASE") as SupportedChains;
  let contractAddress = CONTRACT_ADDRESSES[chainName]?.BITSAVE;
  if (!contractAddress) throw new Error("Contract address not found");

  config.connectors[0].getChainId = async () => chainId; // Ensure the connector uses the correct chain ID

  // Approve token transfer
  const approveRequest = await simulateContract(config, {
    abi: STABLECOIN_ABI,
    address: token.address as Address,
    functionName: "approve",
    args: [contractAddress, parseUnits(amount, token.decimals)],
    connector: config.connectors[0],
  });

  const approveResult = await writeContract(config, approveRequest.request);
  console.log("Approve transaction result:", approveResult);

  // Create savings vault
  const createRequest = await simulateContract(config, {
    abi: [...BITSAVE_ABI, ...CHILD_CONTRACT_ABI],
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
      parseUnits(amount, token.decimals), // Amount in stablecoin
    ],
    connector: config.connectors[0],
  });

  const createResult = await writeContract(config, createRequest.request);
  console.log("Create savings vault transaction result:", createResult);

  const id = createResult;

  console.log("Transaction ID:", id);
}
