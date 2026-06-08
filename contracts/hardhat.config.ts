import { config as loadEnv } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

loadEnv({ path: "../.env" });
loadEnv();

const privateKey = process.env.PRIVATE_KEY;
const mantleRpcUrl = process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mantleSepolia: {
      url: mantleRpcUrl,
      chainId: 5003,
      accounts: privateKey ? [privateKey] : []
    }
  },
  etherscan: {
    apiKey: {
      mantleSepolia: process.env.MANTLE_EXPLORER_API_KEY ?? "not-required-for-sourcify-style-verification"
    },
    customChains: [
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: process.env.MANTLE_EXPLORER_API_URL ?? "https://explorer.sepolia.mantle.xyz/api",
          browserURL: "https://explorer.sepolia.mantle.xyz"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  }
};

export default config;
