import { writeContract, simulateContract } from "@wagmi/core";
import BITSAVE_ABI from "../abi/BitSave.json";
import CONTRACT_ADDRESSES from "../constants/addresses";
import { config } from "../components/providers/WagmiProvider";
import { getJoinFeeInNativeTokenBasedOnChain } from "../onchain/actions";
import { Address, parseEther } from "viem";

type SupportedChains = keyof typeof CONTRACT_ADDRESSES;

export async function joinBitSave(joinFeeInDollars: number) {
  const chainId = config.state.chainId;
  const chainName = (config.chains.find((chain) => chain.id === chainId)?.name.toUpperCase() ??
    "BASE") as SupportedChains;
  let contractAddress = CONTRACT_ADDRESSES[chainName]?.BITSAVE;
  if (!contractAddress) throw new Error("Contract address not found");

  config.connectors[0].getChainId = async () => chainId; // Ensure the connector uses the correct chain ID

  const { request, result } = await simulateContract(config, {
    abi: BITSAVE_ABI,
    address: contractAddress as Address,
    functionName: "joinBitsave",
    value: parseEther(await getJoinFeeInNativeTokenBasedOnChain(chainId, joinFeeInDollars)),
    connector: config.connectors[0],
  });

  console.log("Simulated join BitSave transaction result:", result);

  const writeResult = await writeContract(config, request);

  console.log("Join BitSave transaction result:", writeResult);

  return writeResult;
}
