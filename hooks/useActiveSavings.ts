import {
  getAllUserChildContractsFromAnyChain,
  getAllUserSavings,
} from "@/onchain/reads";
import { useEffect, useState } from "react";
import { formatUnits, Hex } from "viem";
import type { SavingsPlan } from "@/types";
import { getCoinFromTokenAddress } from "@/utils";

export function useSavings(account: Hex) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmountInSavings, setTotalAmountInSavings] = useState(0);
  const [savings, setSavings] = useState<SavingsPlan[]>([]);
  const [activeSavings, setActiveSavings] = useState<SavingsPlan[]>([]);
  const [withdrawnSavings, setWithdrawnSavings] = useState<SavingsPlan[]>([]);

  const getUserVaultAddresses = async () => {
    console.log("user account (address)", account);

    // Fetch user vault addresses from the blockchain
    const addresses = await getAllUserChildContractsFromAnyChain(account);

    return addresses;
  };

  const getAllSavingPlans = async (
    vaultAddresses: Awaited<ReturnType<typeof getUserVaultAddresses>>
  ) => {
    if (!vaultAddresses || vaultAddresses.length === 0) return [];

    const allSavings = [];

    for (const vault of vaultAddresses) {
      const savingsData = await getAllUserSavings(
        vault.childContract,
        vault.chainId
      );
      allSavings.push(...savingsData);
    }

    return allSavings;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const vaultAddresses = await getUserVaultAddresses();
        const allSavings = await getAllSavingPlans(vaultAddresses);
        console.log("all savings", allSavings);

        setSavings(
          allSavings.map((plan) => ({
            name: plan.name,
            amount: plan.amount,
            amountInDollar: Number(
              formatUnits(
                plan.amount,
                getCoinFromTokenAddress(plan.tokenId)!.decimals
              )
            ),
            isWithdrawn: !plan.isValid,
            startTime: Number(plan.startTime),
            penaltyPercentage: Number(plan.penaltyPercentage),
            maturityTime: Number(plan.maturityTime),
            token: getCoinFromTokenAddress(plan.tokenId)!,
          }))
        );
      } catch (error) {
        setError(error as string);
      } finally {
        console.log("Fetching savings data completed");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [account]);

  // set total amount in savings
  useEffect(() =>
    setTotalAmountInSavings(
      savings.reduce((total, plan) => plan.amountInDollar + total, 0)
    )
  );

  useEffect(() => {
    const active = savings.filter((plan) => !plan.isWithdrawn);
    const withdrawn = savings.filter((plan) => plan.isWithdrawn);
    setActiveSavings(active);
    setWithdrawnSavings(withdrawn);
  }, [savings]);

  return {
    isLoading,
    totalAmountInSavings,
    savings,
    activeSavings,
    withdrawnSavings,
    error,
  };
}
