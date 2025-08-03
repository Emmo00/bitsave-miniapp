import { useEffect, useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { Address, formatEther, zeroAddress } from "viem";
import {
  getUserChildContractFromAnyChain,
  getUserVaultNames,
  getSaving,
} from "../onchain/reads";
import { formatTokenAmount } from "../lib/tokenUtils";
import CHILDCONTRACT_ABI from "../abi/ChildContract.json";

interface TotalSavedData {
  totalAmount: string; // Formatted as string for display
  totalAmountWei: number; // USD equivalent as number
  totalRewards: string; // Total interest accumulated
  totalRewardsWei: bigint; // Raw rewards in wei
  savingsCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useTotalSaved(): TotalSavedData {
  const { address } = useAccount();
  const [childContractInfo, setChildContractInfo] = useState<{
    address: string;
    chainId: number;
  } | null>(null);
  const [savingsNames, setSavingsNames] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
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
      setTotalAmount(0);
      setTotalRewards(0n);
      return;
    }

    const calculateTotal = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let totalUsdValue = 0;
        let rewards = 0n;

        // Get all savings data
        const savingsPromises = savingsNames.map((name) =>
          getSaving(childContractInfo.address, name)
        );

        const savingsData = await Promise.all(savingsPromises);

        // Sum up amounts and rewards for valid savings
        savingsData.forEach((saving) => {
          if (saving.isValid) {
            // Convert token amount to USD equivalent using proper decimals
            const tokenAmountFormatted = formatTokenAmount(saving.amount, saving.tokenId);
            const usdValue = parseFloat(tokenAmountFormatted);
            totalUsdValue += usdValue;
            rewards += saving.interestAccumulated;
          }
        });

        setTotalAmount(totalUsdValue);
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
    totalAmount: totalAmount.toFixed(2),
    totalAmountWei: totalAmount,
    totalRewards: formatEther(totalRewards),
    totalRewardsWei: totalRewards,
    savingsCount: savingsNames.length,
    isLoading: isLoading || namesLoading,
    error,
  };
}
