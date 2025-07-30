import { writeContract } from "@wagmi/core";
import BITSAVE_ABI from "../abi/BitSave.json";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
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

  const result = await writeContract(config, {
    abi: BITSAVE_ABI,
    address: contractAddress as Address,
    functionName: "joinBitSave",
    value: parseEther(await getJoinFeeInNativeTokenBasedOnChain(chainId, joinFeeInDollars)),
  });

  return result;
}
