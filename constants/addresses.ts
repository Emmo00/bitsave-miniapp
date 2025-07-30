export const CONTRACT_ADDRESSES = {
  BASE: {
    BITSAVE: process.env.NEXT_BASE_BITSAVE_CONTRACT_ADDRESS,
    STABLECOINS: [
      {
        name: "USDC",
        image: "usdc.png",
        address: process.env.NEXT_BASE_USDC_CONTRACT_ADDRESS,
        decimals: 6,
      },
    ],
  },
  CELO: {
    BITSAVE: process.env.NEXT_CELO_BITSAVE_CONTRACT_ADDRESS,
    STABLECOINS: [
      {
        name: "cUSD",
        image: "cusd.png",
        address: process.env.NEXT_CELO_CUSD_CONTRACT_ADDRESS,
        decimals: 18,
      },
      {
        name: "USDGLO",
        image: "usdglo.png",
        address: process.env.NEXT_CELO_USDGLO_CONTRACT_ADDRESS,
        decimals: 18,
      },
      {
        name: "GoodDollar",
        image: "gooddollar.png",
        address: process.env.NEXT_CELO_GOODDOLLAR_CONTRACT_ADDRESS,
        decimals: 18,
      },
    ],
  },
};
