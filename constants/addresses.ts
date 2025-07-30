export type Stablecoin = {
  name: string;
  image: string;
  address: string | undefined;
  decimals: number;
};

type NetworkAddresses = {
  BITSAVE: string | undefined;
  STABLECOINS: Stablecoin[];
};

type ContractAddresses = {
  [network: string]: NetworkAddresses;
};

let CONTRACT_ADDRESSES: ContractAddresses = {
  BASE: {
    BITSAVE: process.env.NEXT_PUBLIC_BASE_BITSAVE_CONTRACT_ADDRESS,
    STABLECOINS: [
      {
        name: "USDCC",
        image: "usdc.png",
        address: process.env.NEXT_PUBLIC_BASE_USDC_CONTRACT_ADDRESS,
        decimals: 6,
      },
    ],
  },
  CELO: {
    BITSAVE: process.env.NEXT_PUBLIC_CELO_BITSAVE_CONTRACT_ADDRESS,
    STABLECOINS: [
      {
        name: "cUSD",
        image: "cusd.png",
        address: process.env.NEXT_PUBLIC_CELO_CUSD_CONTRACT_ADDRESS,
        decimals: 18,
      },
      {
        name: "USDGLO",
        image: "usdglo.png",
        address: process.env.NEXT_PUBLIC_CELO_USDGLO_CONTRACT_ADDRESS,
        decimals: 18,
      },
      {
        name: "GoodDollar",
        image: "gooddollar.png",
        address: process.env.NEXT_PUBLIC_CELO_GOODDOLLAR_CONTRACT_ADDRESS,
        decimals: 18,
      },
    ],
  },
};

CONTRACT_ADDRESSES["BASE SEPOLIA"] = CONTRACT_ADDRESSES["BASE"];
CONTRACT_ADDRESSES["ALFAJORES"] = CONTRACT_ADDRESSES["CELO"];

export default CONTRACT_ADDRESSES;