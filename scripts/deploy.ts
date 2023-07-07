import { ethers } from "hardhat";

async function main() {
  const lbc = await ethers.deployContract("LittleBoyCoin");

  const lbcTokenContract = await lbc.waitForDeployment();

  console.log(await lbcTokenContract.name(), await lbcTokenContract.symbol());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
