import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther, toNumber } from "ethers";

describe("LBCLottery", () => {
  async function DeployLBCLotteryFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const lbc = await ethers.deployContract("LittleBoyCoin");

    const maxBuyLimit = 100;
    const ticketPrice = 50000;
    const ONE_MONTH_IN_SECS = 30 * 24 * 60 * 60;
    const lotteryCountdown = (await time.latest()) + ONE_MONTH_IN_SECS + 1;

    const tokenAddress = await lbc.getAddress();

    const lbcLottery = await ethers.deployContract("LBCLottery", [
      tokenAddress,
    ]);

    return {
      owner,
      otherAccount,
      maxBuyLimit,
      ticketPrice,
      lotteryCountdown,
      tokenAddress,
      lbc,
      lbcLottery,
    };
  }

  describe("Constructor", () => {
    it("Should set the right max buy limit", async () => {
      const { maxBuyLimit, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      expect(await lbcLottery.maxBuyLimit()).to.equal(maxBuyLimit);
    });

    it("Should set the right ticket price", async () => {
      const { ticketPrice, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      expect(await lbcLottery.ticketPrice()).to.equal(ticketPrice);
    });

    it("Should set the right lottery countdown", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      expect(await lbcLottery.lotteryCountdown()).to.equal(lotteryCountdown);
    });

    it("Should set the right token address", async () => {
      const { tokenAddress, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      expect(await lbcLottery.lbcToken()).to.equal(tokenAddress);
    });
  });

  describe("Set Ticket Price", () => {
    it("Should revert the right error if called from another account beside owner", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const [owner, otherAccount] = await ethers.getSigners();
      const newticketPrice = 10000;

      const notOwnerCall = lbcLottery
        .connect(otherAccount)
        .setTicketPrice(newticketPrice);

      await expect(notOwnerCall).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert the right error if called while lottery live", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const newticketPrice = 10000;

      const setTicketPrice = lbcLottery.setTicketPrice(newticketPrice);

      await expect(setTicketPrice).to.be.revertedWithCustomError(
        lbcLottery,
        "UnauthorizedAction()"
      );
    });

    it("Should revert the right error if the new price amount is invalid", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const newticketPrice = 0;

      await time.increaseTo(lotteryCountdown);

      const setTicketPrice = lbcLottery.setTicketPrice(newticketPrice);

      await expect(setTicketPrice)
        .to.be.revertedWithCustomError(lbcLottery, "InvalidAmount")
        .withArgs(newticketPrice);
    });

    it("Should set the right price amount to a new price amount", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const newticketPrice = 10000;

      await time.increaseTo(lotteryCountdown);
      await lbcLottery.setTicketPrice(newticketPrice);

      expect(await lbcLottery.ticketPrice()).to.be.equal(newticketPrice);
    });
  });

  describe("Set Max Buy Limit", () => {
    it("Should revert the right error if called from another account beside owner", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const [owner, otherAccount] = await ethers.getSigners();
      const newMaxBuyLimit = 200;

      const notOwnerCall = lbcLottery
        .connect(otherAccount)
        .setMaxBuyLimit(newMaxBuyLimit);

      await expect(notOwnerCall).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert the right error if called while lottery live", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const newMaxBuyLimit = 200;

      const setMaxBuyLimit = lbcLottery.setMaxBuyLimit(newMaxBuyLimit);

      await expect(setMaxBuyLimit).to.be.revertedWithCustomError(
        lbcLottery,
        "UnauthorizedAction()"
      );
    });

    it("Should revert the right error if the new max buy limit is invalid", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const newMaxBuyLimit = 0;

      await time.increaseTo(lotteryCountdown);

      const setMaxBuyLimit = lbcLottery.setMaxBuyLimit(newMaxBuyLimit);

      await expect(setMaxBuyLimit)
        .to.be.revertedWithCustomError(lbcLottery, "InvalidAmount")
        .withArgs(newMaxBuyLimit);
    });

    it("Should set the right max buy limit to a new max buy limit", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const newMaxBuyLimit = 200;

      await time.increaseTo(lotteryCountdown);
      await lbcLottery.setMaxBuyLimit(newMaxBuyLimit);

      expect(await lbcLottery.maxBuyLimit()).to.be.equal(newMaxBuyLimit);
    });
  });

  describe("Set Token Address", () => {
    it("Should revert the right error if called from another account beside owner", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const [owner, otherAccount] = await ethers.getSigners();
      const newTokenAddress = ethers.Wallet.createRandom();

      const notOwnerCall = lbcLottery
        .connect(otherAccount)
        .setTokenAddress(newTokenAddress);

      await expect(notOwnerCall).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert the right error if called while lottery live", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const newTokenAddress = ethers.Wallet.createRandom().address;

      const setTokenAddress = lbcLottery.setTokenAddress(newTokenAddress);

      await expect(setTokenAddress).to.be.revertedWithCustomError(
        lbcLottery,
        "UnauthorizedAction()"
      );
    });

    it("Should revert the right error if new token address is zero address", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const newZeroAddress = ethers.ZeroAddress;

      await time.increaseTo(lotteryCountdown);

      const setTokenAddress = lbcLottery.setTokenAddress(newZeroAddress);

      await expect(setTokenAddress)
        .to.be.revertedWithCustomError(lbcLottery, "InvalidTokenAddress")
        .withArgs(newZeroAddress);
    });

    it("Should set the right token address to a new token address", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const lbc = await ethers.deployContract("LittleBoyCoin");

      const newTokenAddress = await lbc.getAddress();

      await time.increaseTo(lotteryCountdown);
      await lbcLottery.setTokenAddress(newTokenAddress);

      expect(await lbcLottery.lbcToken()).to.be.equal(newTokenAddress);
    });
  });

  describe("Buy Tickets", () => {
    it("Should revert the right error if lottery contract is paused", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      await lbcLottery.pauseLottery();

      const buyTicketAmount = 100;
      const buyTickets = lbcLottery.buyTickets(buyTicketAmount);

      await expect(buyTickets).to.be.revertedWith("Contract is paused");
    });

    it("Should revert the right error if lottery is not live", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      await time.increaseTo(lotteryCountdown);

      const buyTicketAmount = 100;
      const buyTickets = lbcLottery.buyTickets(buyTicketAmount);

      await expect(buyTickets).to.be.revertedWith("Lottery is not live");
    });

    it("Should revert the right error if buy amount is invalid", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const buyTicketAmount = 0;
      const buyTickets = lbcLottery.buyTickets(buyTicketAmount);

      await expect(buyTickets)
        .to.be.revertedWithCustomError(lbcLottery, "InvalidAmount")
        .withArgs(buyTicketAmount);
    });

    it("Should revert the right error if buy amount is greater than the max buy limit", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const buyTicketAmount = 150;
      const buyTickets = lbcLottery.buyTickets(buyTicketAmount);

      await expect(buyTickets)
        .to.be.revertedWithCustomError(lbcLottery, "MaxBuyLimit")
        .withArgs(buyTicketAmount);
    });

    it("Should successfully buying lottery tickets", async () => {
      const { owner, lbc, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const buyTicketAmount = 100;

      const lotteryAddress = await lbcLottery.getAddress();
      const ticketPrice = await lbcLottery.ticketPrice();
      const tokensToSpend = buyTicketAmount * toNumber(ticketPrice);

      await lbc
        .connect(owner)
        .approve(lotteryAddress, parseEther(tokensToSpend.toString()));

      const buyTickets = await lbcLottery.buyTickets(buyTicketAmount);

      expect(buyTickets)
        .to.emit(lbcLottery, "BuyTicket")
        .withArgs(owner, lotteryAddress, buyTicketAmount)
        .to.changeTokenBalance(
          lbc,
          owner,
          -parseEther(tokensToSpend.toString())
        );
    });
  });

  describe("Pause Lottery Contract", () => {
    it("Should revert the right error if called from another account beside owner", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const [owner, otherAccount] = await ethers.getSigners();

      const notOwnerCall = lbcLottery.connect(otherAccount).pauseLottery();

      await expect(notOwnerCall).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert the right error if lottery contract is paused", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      await lbcLottery.pauseLottery();

      await expect(lbcLottery.pauseLottery()).to.be.revertedWith(
        "Contract is paused"
      );
    });

    it("Should revert the right error if lottery is not live", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      await time.increaseTo(lotteryCountdown);

      await expect(lbcLottery.pauseLottery()).to.be.revertedWith(
        "Lottery is not live"
      );
    });

    it("Should pause the lottery contract", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      lbcLottery.pauseLottery().then(async (res) => {
        expect(await lbcLottery.pauseTimestamp()).to.be.equal(res.blockNumber);
        expect(await lbcLottery.isPaused()).to.be.equal(true);
      });
    });
  });

  describe("Resume Lottery Contract", () => {
    it("Should revert the right error if called from another account beside owner", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const [owner, otherAccount] = await ethers.getSigners();

      const notOwnerCall = lbcLottery.connect(otherAccount).resumeLottery();

      await expect(notOwnerCall).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert the right error if lottery is not live", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      await time.increaseTo(lotteryCountdown);

      await expect(lbcLottery.resumeLottery()).to.be.revertedWith(
        "Lottery is not live"
      );
    });

    it("Should revert the right error if the lottery is not paused", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      await expect(lbcLottery.resumeLottery()).to.be.revertedWith(
        "Lottery is not paused"
      );
    });

    it("Should resume the lottery contract", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      await lbcLottery.pauseLottery();
      await lbcLottery.resumeLottery();

      expect(await lbcLottery.pauseTimestamp()).to.be.equal(0);
      expect(await lbcLottery.isPaused()).to.be.equal(false);
    });
  });

  describe("Reset Lottery Contract", () => {
    it("Should revert the right error if called from another account beside owner", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const [owner, otherAccount] = await ethers.getSigners();

      const notOwnerCall = lbcLottery.connect(otherAccount).reset();

      await expect(notOwnerCall).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert the right error if called while lottery is live", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const resetLottery = lbcLottery.reset();

      await expect(resetLottery).to.be.revertedWith("Lottery is still live");
    });

    it("Should reset the lottery contract state", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      await time.increaseTo(lotteryCountdown);
      await lbcLottery.reset();

      const ONE_MONTH_IN_SECS = 30 * 24 * 60 * 60;
      const newLotteryCountdown = (await time.latest()) + ONE_MONTH_IN_SECS;

      expect(await lbcLottery.prizePool()).to.be.equal(0);
      expect(await lbcLottery.ticketSold()).to.be.equal(0);
      expect(await lbcLottery.lotteryCountdown()).to.be.equal(
        newLotteryCountdown
      );
    });
  });

  describe("Withdraw All Tokens", () => {
    it("Should revert the right error if called from another account beside owner", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const [owner, otherAccount] = await ethers.getSigners();

      const notOwnerCall = lbcLottery.connect(otherAccount).withdrawAllTokens();

      await expect(notOwnerCall).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert the right error if called while lottery live", async () => {
      const { lbcLottery } = await loadFixture(DeployLBCLotteryFixture);

      const withdrawAllTokens = lbcLottery.withdrawAllTokens();

      await expect(withdrawAllTokens).to.be.revertedWithCustomError(
        lbcLottery,
        "UnauthorizedAction()"
      );
    });

    it("Should revert the right error if the lottery token balance is zero", async () => {
      const { lotteryCountdown, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      await time.increaseTo(lotteryCountdown);

      const withdrawAllTokens = lbcLottery.withdrawAllTokens();

      await expect(withdrawAllTokens).to.be.revertedWith(
        "No tokens to withdraw"
      );
    });

    it("Should withdraw all tokens from the lottery contract", async () => {
      const { owner, lotteryCountdown, lbc, lbcLottery } = await loadFixture(
        DeployLBCLotteryFixture
      );

      const buyTicketAmount = 100;

      const ticketPrice = await lbcLottery.ticketPrice();
      const tokensToSpend = buyTicketAmount * toNumber(ticketPrice);
      const lotteryAddress = await lbcLottery.getAddress();
      const lotteryTokenBalance = await lbcLottery.getLotteryTokenBalance();

      await lbc
        .connect(owner)
        .approve(lotteryAddress, parseEther(tokensToSpend.toString()));

      await lbcLottery.buyTickets(buyTicketAmount);

      await time.increaseTo(lotteryCountdown);

      const withdrawAllTokens = await lbcLottery.withdrawAllTokens();

      expect(withdrawAllTokens)
        .to.emit(lbcLottery, "WithdrawAllTokens")
        .withArgs(owner, lotteryTokenBalance)
        .to.changeTokenBalance(lbc, lotteryAddress, -lotteryTokenBalance);
    });
  });
});
