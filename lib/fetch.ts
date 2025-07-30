export async function fetchEthPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return null;
  }
}

export async function fetchCeloPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd"
    );
    const data = await response.json();
    return data.celo.usd;
  } catch (error) {
    console.error("Error fetching CELO price:", error);
    return null;
  }
}
