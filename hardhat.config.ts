import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

const API_KEY = process.env.API_KEY;
const MNEMONIC = process.env.MNEMONIC;

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      chainId: 11155111,
      accounts: {
        mnemonic: MNEMONIC,
      },
      url: "https://sepolia.infura.io/v3/0212bf9398b947a28eed24290649bc5e",
    },
  },
  etherscan: {
    apiKey: API_KEY,
  },
};

export default config;
