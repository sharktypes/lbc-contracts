// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LBCLottery is Ownable {
    bool public isPaused;

    uint256 public prizePool;
    uint256 public ticketSold;
    uint256 public ticketPrice;
    uint256 public maxBuyLimit;
    uint256 public pauseTimestamp;
    uint256 public lotteryCountdown;

    address public constant TOKEN_ADDRESS =
        0x5Cdbe5FA3b818b7CF220BEDA39BA753a5f607b62;

    IERC20 lbcToken = IERC20(TOKEN_ADDRESS);

    mapping(uint256 => address) public matchNumbers;
    mapping(address => uint256[]) private ticketNumbers;

    error UnauthorizedAction();
    error MaxBuyLimit(uint256 amount);
    error InvalidAmount(uint256 amount);
    error InvalidBuyAmount(uint256 amount);

    event BuyTicket(address sender, address receiver, uint256 amount);
    event WithdrawAllTokens(address owner, uint256 amount);

    constructor() {
        maxBuyLimit = 100;
        ticketPrice = 50000;
        lotteryCountdown = block.timestamp + 30 days;
    }

    modifier onlyWhenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    modifier onlyWhenLotteryLive() {
        require(block.timestamp < lotteryCountdown, "Lottery is not live");
        _;
    }

    modifier onlyWhenLotteryFinish() {
        if (block.timestamp < lotteryCountdown) {
            revert UnauthorizedAction();
        }
        _;
    }

    modifier onlyValidAmount(uint256 amount) {
        if (amount <= 0) {
            revert InvalidAmount(amount);
        }
        _;
    }

    function getLotteryTokenBalance() public view returns (uint256) {
        return lbcToken.balanceOf(address(this));
    }

    function getTotalTickets(address owner) public view returns (uint256) {
        return ticketNumbers[owner].length;
    }

    function getTicketNumbers(
        address owner
    ) public view returns (uint256[] memory) {
        return ticketNumbers[owner];
    }

    function setTicketPrice(
        uint256 price
    ) public onlyOwner onlyWhenLotteryFinish onlyValidAmount(price) {
        ticketPrice = price;
    }

    function setMaxBuyLimit(
        uint256 limit
    ) public onlyOwner onlyWhenLotteryFinish onlyValidAmount(limit) {
        maxBuyLimit = limit;
    }

    function buyTickets(
        uint256 amount
    ) public onlyWhenNotPaused onlyWhenLotteryLive onlyValidAmount(amount) {
        if (amount > maxBuyLimit) {
            revert MaxBuyLimit(amount);
        }

        uint256 totalTokens = amount * ticketPrice ** 18;

        lbcToken.transferFrom(msg.sender, address(this), totalTokens);

        for (uint256 i = 0; i < amount; i++) {
            uint256 numbers = ticketSold + i + 1;

            matchNumbers[numbers] = msg.sender;
            ticketNumbers[msg.sender].push(numbers);
        }

        ticketSold += amount;
        prizePool += amount * ticketPrice;

        emit BuyTicket(msg.sender, address(this), amount);
    }

    function pauseLottery()
        public
        onlyOwner
        onlyWhenNotPaused
        onlyWhenLotteryLive
    {
        pauseTimestamp = block.timestamp;
        isPaused = true;
    }

    function resumeLottery() public onlyOwner onlyWhenLotteryLive {
        require(isPaused, "Lottery is not paused");

        uint256 pauseDuration = block.timestamp - pauseTimestamp;

        lotteryCountdown += pauseDuration / 1 days;
        pauseTimestamp = 0;
        isPaused = false;
    }

    function reset() public onlyOwner {
        require(block.timestamp >= lotteryCountdown, "Lottery is still live");

        prizePool = 0;
        ticketSold = 0;
        lotteryCountdown = block.timestamp + 30 days;
    }

    function withdrawAllTokens() public onlyOwner onlyWhenLotteryFinish {
        uint256 allTokens = getLotteryTokenBalance();

        require(allTokens > 0, "No tokens to withdraw");

        lbcToken.transfer(owner(), allTokens);

        emit WithdrawAllTokens(owner(), allTokens);
    }
}
