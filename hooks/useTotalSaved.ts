import { useEffect, useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { Address, formatEther, formatUnits, zeroAddress } from "viem";
import {
  getUserChildContractFromAnyChain,
  getUserVaultNames,
  getSaving,
} from "../onchain/reads";
import CHILDCONTRACT_ABI from "../abi/ChildContract.json";
import CONTRACT_ADDRESSES from "../constants/addresses";

interface TotalSavedData {
  totalAmount: string; // Formatted as string for display (normalized to USD value)
  totalAmountWei: bigint; // Raw wei amount (sum of all tokens in their native decimals)
  totalRewards: string; // Total interest accumulated
  totalRewardsWei: bigint; // Raw rewards in wei
  savingsCount: number;
  isLoading: boolean;
  error: string | null;
}

// Helper function to get token decimals from token address
function getTokenDecimals(tokenAddress: string): number {
  // Search through all networks and stablecoins to find the token
  for (const network of Object.values(CONTRACT_ADDRESSES)) {
    const token = network.STABLECOINS.find(
      (stablecoin) => stablecoin.address?.toLowerCase() === tokenAddress.toLowerCase()
    );
    if (token) {
      return token.decimals;
    }
  }
  // Default to 18 decimals if token not found (most ERC20 tokens use 18)
  return 18;
}

export function useTotalSaved(): TotalSavedData {
  const { address } = useAccount();
  const [childContractInfo, setChildContractInfo] = useState<{
    address: string;
    chainId: number;
  } | null>(null);
  const [savingsNames, setSavingsNames] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState<bigint>(0n);
  const [totalRewards, setTotalRewards] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get savings names from child contract
  const { data: savingsNamesData, isLoading: namesLoading } = useReadContract({
    abi: CHILDCONTRACT_ABI,
    address: childContractInfo?.address as Address,
    functionName: "getSavingsNames",
    query: {
      enabled: !!childContractInfo?.address,
    },
  });

  // Effect to get child contract address
  useEffect(() => {
    if (!address) {
      setChildContractInfo(null);
      return;
    }

    const fetchChildContract = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserChildContractFromAnyChain(address);
        if (result) {
          setChildContractInfo({
            address: result.childContract,
            chainId: result.chainId,
          });
        } else {
          setChildContractInfo(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch child contract"
        );
        setChildContractInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildContract();
  }, [address]);

  // Update savings names when data changes
  useEffect(() => {
    if (savingsNamesData) {
      const names = (savingsNamesData as { savingsNames: string[] })
        .savingsNames;
      setSavingsNames(names);
    }
  }, [savingsNamesData]);

  // Effect to calculate total saved amount
  useEffect(() => {
    if (!childContractInfo?.address || !savingsNames.length) {
      setTotalAmount(0n);
      setTotalRewards(0n);
      return;
    }

    const calculateTotal = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let totalUsdValue = 0; // Accumulate normalized USD value
        let totalRawAmount = 0n; // Keep track of raw amounts in wei
        let rewards = 0n;

        // Get all savings data
        const savingsPromises = savingsNames.map((name) =>
          getSaving(childContractInfo.address, name)
        );

        const savingsData = await Promise.all(savingsPromises);

        console.log("total saved array", savingsData);

        // Sum up amounts and rewards for valid savings
        savingsData.forEach((saving) => {
          // Get token decimals from the token address
          const tokenDecimals = getTokenDecimals(saving.tokenId);
          
          // Convert the raw amount to a normalized decimal value
          const normalizedAmount = parseFloat(formatUnits(saving.amount, tokenDecimals));
          
          console.log(`Processing saving: token=${saving.tokenId}, decimals=${tokenDecimals}, rawAmount=${saving.amount}, normalizedAmount=${normalizedAmount}`);
          
          // Add to USD value total (assuming 1:1 USD for stablecoins)
          totalUsdValue += normalizedAmount;
          
          // Add raw amount (keeping original decimals for wei total)
          totalRawAmount += saving.amount;
          
          // Add rewards (typically in native chain token, keep as is)
          rewards += saving.interestAccumulated;
        });

        console.log(`Total USD value: ${totalUsdValue}, Total raw amount: ${totalRawAmount}, Total rewards: ${rewards}`);

        setTotalAmount(BigInt(Math.round(totalUsdValue * 100))); // Store as cents for precision
        setTotalRewards(rewards);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to calculate total saved"
        );
      } finally {
        setIsLoading(false);
      }
    };

    calculateTotal();
  }, [childContractInfo, savingsNames]);

  return {
    totalAmount: (Number(totalAmount) / 100).toFixed(2), // Convert cents back to dollars with 2 decimal places
    totalAmountWei: totalAmount,
    totalRewards: formatEther(totalRewards),
    totalRewardsWei: totalRewards,
    savingsCount: savingsNames.length,
    isLoading: isLoading || namesLoading,
    error,
  };
}
