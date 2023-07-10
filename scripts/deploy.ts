import { ethers, upgrades } from "hardhat";

async function main() {
  const LittleBoyCoin = await ethers.getContractFactory("LittleBoyCoin");

  const lbc = await upgrades.deployProxy(LittleBoyCoin);

  const res = await lbc.waitForDeployment();
  const address = await res.getAddress();

  console.log("LittleBoyCoin deployed to:", address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
