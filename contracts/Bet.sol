// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./OracleInterface.sol";
import "./BetOracle.sol";

/**
 * This Ethereum smart-contract takes bets placed on sport events.
 * It then invests all bets deposits for a given event (pot) in DeFi.
 * Then once the event outcome is confirmed,
 * it makes the accrued interests ready for the winners
 * to withdraw proportionnaly to their initial stake.
 * Players do not loose their stake.
 *
 * @notice Takes bets and handles payouts for sport events
 * @title  a Smart-Contract in charge of handling bets on a sport event outcome where players do not loose their stake and winners earn the interests accrued on the stakes.
 * @author Tanteli, block74
 */
contract Bet is Ownable, ReentrancyGuard {
    /**
     * @notice Safe guarding contract from integer
     * overflow and underflow vulnerabilities.
     */
    using SafeMath for uint256;

    /**
     * @dev An instance of ERC20 DAI Token
     */
    IERC20 private Dai;

    /**
     * @dev list of all bets per player, ie. a map composed (player address => bet id) pairs
     */
    mapping(address => bytes32[]) private userToBets;

    /**
     *  @dev for any given event, get a list of all bets that have been made for that event
     *    map composed of (event id => array of bets) pairs
     */
    mapping(bytes32 => Bet[]) private eventToBets;

    /**
     * @dev Address of the sport events Oracle
     */
    address internal oracleAddress = address(0);

    /**
     *  @dev Instance of the sport events Oracle (used to register sport events get their outcome).
     */
    OracleInterface internal betOracle = OracleInterface(oracleAddress);

    /**
     * @dev minimum bet amount
     */
    uint256 internal minimumBet = 0.1 ether;

    /**
     * @dev payload of a bet on a sport event
     */
    struct Bet {
        address user; // who placed it
        bytes32 eventId; // id of the sport event as registered in the Oracle
        uint256 amount; // bet amount
        int8 chosenWinner; // Index of the team that will win according to the player
    }
    struct UserBetz {
        bytes32 eventId;
        uint256 amount;
        int8 team;
    }

    struct AmountonBet {
        uint256 totalAmountOnTeamA;
        uint256 totalAmountOnTeamB;
    }

    //mapping from event id to bet on each team
    mapping(bytes32 => AmountonBet) public userBet;

    // mapping from token address to bool
    mapping(address => bool) public tokenRegistered;

    address[] public registeredTokens;

    /**
     * @dev payload of user balance and bets
     */
    struct UserBalanceInfo {
        uint256 depositedAmount;
        uint256 ongoingBetAmount;
        uint256 balanceAvailable;
        uint256 balancewithdrawn;
        uint256 balanceLost;
    }

    mapping(address => uint256) public allTokenBalance;
    mapping(address => uint256) public userBetCount;
    mapping(address => UserBetz[]) public userBets;

    /**
     * @notice mapping from user address to user bal info.
     */
    mapping(address => UserBalanceInfo) public userTokenBal;

    /**
     * @dev Possible outcomes for a sport event
     */
    enum BettableOutcome {
        Team1,
        Team2
    }

    /**
     * @dev check that the passed in address is not 0.
     */
    modifier notAddress0(address _address) {
        require(_address != address(0), "Address 0 is not allowed");
        _;
    }

    /**
     * @dev Sent once the Sport Event Oracle is set
     */
    event OracleAddressSet(address _address);

    /**
     * @dev Sent when once a bet is placed
     */
    event BetPlaced(
        bytes32 _eventId,
        address _player,
        int8 _chosenWinner,
        uint256 _amount
    );

    uint256 public tokenCount = 0;

    /**
     * @param _tokenAddress the address of the deployed ERC20 DAI token
     */
    constructor(address _tokenAddress, address _oracleAddress)
        notAddress0(_tokenAddress)
    {
        Dai = IERC20(_tokenAddress);
        setOracleAddress(_oracleAddress);
    }

    /**
     * @notice register token
     * @param tokenAddress address of token
     * @return success true if success
     */
    function registerNewToken(address tokenAddress)
        public
        onlyOwner
        returns (bool success)
    {
        require(tokenRegistered[tokenAddress] == false, "already registered");
        tokenRegistered[tokenAddress] = true;
        registeredTokens.push(tokenAddress);
        // tokenCount=tokenCount.add(1);
        return true;
    }

    /**
     *
     *
     */
    function registerdTokens() public view returns (address[] memory) {
        return registeredTokens;
    }

    /**
     * @return the DAI balance of the contract
     */
    function getContractDAIBalance() public view returns (uint256) {
        return Dai.balanceOf(address(this));
    }

    /**
     * @return oddsTeamA the odds on TeamA
     */
    function getOddsA(bytes32 eventId) public view returns (uint256 oddsTeamA) {
        uint256 totalAmountPlacedTeamA1;
        uint256 totalAmountPlacedTeamB1;
        uint256 currentoddsTeamA;
        uint256 currentoddsTeamB;
        totalAmountPlacedTeamA1 = userBet[eventId].totalAmountOnTeamA;
        totalAmountPlacedTeamB1 = userBet[eventId].totalAmountOnTeamB;
        if (totalAmountPlacedTeamA1 == 0 || totalAmountPlacedTeamB1 == 0) {
            currentoddsTeamA = 1;
            currentoddsTeamB = 1;
        } else {
            currentoddsTeamA = totalAmountPlacedTeamA1.mul(100).div(
                totalAmountPlacedTeamB1
            );
            currentoddsTeamB = totalAmountPlacedTeamB1.mul(100).div(
                totalAmountPlacedTeamA1
            );
        }
        return (currentoddsTeamA);
    }

    /**
     * @return oddsTeamB the odds on TeamB
     */
    function getOddsB(bytes32 eventId) public view returns (uint256 oddsTeamB) {
        uint256 totalAmountPlacedTeamA1;
        uint256 totalAmountPlacedTeamB1;
        uint256 currentoddsTeamA;
        uint256 currentoddsTeamB;
        totalAmountPlacedTeamA1 = userBet[eventId].totalAmountOnTeamA;
        totalAmountPlacedTeamB1 = userBet[eventId].totalAmountOnTeamB;
        if (totalAmountPlacedTeamA1 == 0 || totalAmountPlacedTeamB1 == 0) {
            currentoddsTeamA = 1;
            currentoddsTeamB = 1;
        } else {
            currentoddsTeamA = totalAmountPlacedTeamA1.mul(100).div(
                totalAmountPlacedTeamB1
            );
            currentoddsTeamB = totalAmountPlacedTeamB1.mul(100).div(
                totalAmountPlacedTeamA1
            );
        }
        return (currentoddsTeamB);
    }

    /**
     * @notice Moves `_amount` tokens from `_sender` to this contract
     * @param tokenAddress the address that owns  the tokens
     * @param _amount the amount to be deposited
     */
    function deposit(address tokenAddress, uint256 _amount)
        public
        notAddress0(msg.sender)
    {
        // At least a minimum amount is required to be deposited
        require(_amount >= 10, "Amount deposited must be >= 10");
        require(tokenRegistered[tokenAddress] == true, "token not registered");
        uint256 depositAmount = userTokenBal[msg.sender].depositedAmount.add(
            _amount
        );
        uint256 amountAvaliable = userTokenBal[msg.sender].balanceAvailable.add(
            _amount
        );
        UserBalanceInfo memory newDeposit = UserBalanceInfo(
            depositAmount,
            0,
            amountAvaliable,
            0,
            0
        );
        userTokenBal[msg.sender] = newDeposit;

        allTokenBalance[tokenAddress] = allTokenBalance[tokenAddress].add(
            _amount
        );
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @notice Sets `_amount` as the allowance of `_spender` over the caller's tokens.
     * @param _spender an address allowed to spend user's DAI
     * @param _amount the amount approved to be used by _spender
     */
    function approve(address _spender, uint256 _amount)
        external
        notAddress0(_spender)
    {
        Dai.approve(_spender, _amount);
    }

    /**
     * @notice sets the address of the sport event bet oracle contract to use
     * @dev setting a wrong address may result in false return value, or error
     * @param _oracleAddress the address of the sport event bet oracle
     */
    function setOracleAddress(address _oracleAddress)
        internal
        onlyOwner
        notAddress0(_oracleAddress)
        returns (bool)
    {
        oracleAddress = _oracleAddress;
        betOracle = OracleInterface(oracleAddress);
        emit OracleAddressSet(oracleAddress);

        return betOracle.testConnection();
    }

    /**
     * @notice for testing purposes: make sure that the sport event oracle is callable
     */
    function testOracleConnection() public view returns (bool) {
        return oracleAddress != address(0) && betOracle.testConnection();
    }

    /**
     * @return the address of the oracle we use to get the sport events and their outcomes
     */
    function getOracleAddress() external view returns (address) {
        return oracleAddress;
    }

    /**
     * @notice determines whether or not the user has already bet on the given sport event
     
     * @param _eventId id of a event
    
     */
    function _betIsValid(bytes32 _eventId) public view returns (bool) {
        // if (userToBets[_user].length == 0) {
        //     userToBets[_user]
        // }
        uint256 bn = block.number;
        (
            bytes32 id,
            string memory name,
            string memory teamAname,
            string memory teamBname,
            uint256 date,
            OracleInterface.EventOutcome outcome,
            int8 winner
        ) = getEvent((_eventId));
        require(bn < date, "Too late to bet");
        return true;
    }

    /**
     * @notice determines whether or not bets may still be accepted for the given match
     * @param _eventId id of an event
     */
    function _eventOpenForBetting(bytes32 _eventId)
        private
        pure
        returns (bool)
    {
        return true;
    }

    /**
     * @notice gets a list ids of all currently bettable events
     * @return pendingEvents the list of pending sport events
     */
    function getBettableEvents()
        public
        view
        returns (bytes32[] memory pendingEvents)
    {
        return betOracle.getPendingEvents();
    }

    /**
     * @notice returns the full data of the specified event
     * @param _eventId the id of the desired event
     * @return id   the id of the event
     * @return name the name of the event
     * @return teamAname
     * @return teamBname
     * @return date when the event takes place
     * @return outcome an integer that represents the event outcome
     * @return winner the index of the winner
     */
    function getEvent(bytes32 _eventId)
        public
        view
        returns (
            bytes32 id,
            string memory name,
            string memory teamAname,
            string memory teamBname,
            uint256 date,
            OracleInterface.EventOutcome outcome,
            int8 winner
        )
    {
        return betOracle.getEvent(_eventId);
    }

    /**
     * @notice returns the full data of the most recent bettable sport event
     * @return id   the id of the event
     * @return name the name of the event
     * @return teamAname
     * @return teamBname
     * @return date when the event takes place
     * @return outcome an integer that represents the event outcome
     * @return winner the index of the winner (0 = TeamA, 1 = TeamB)
     */

    //bytes32,string memory,string memory,string memory,uint256,enum OracleInterface.EventOutcome,int8
    function getLatestEvent()
        public
        view
        returns (
            bytes32 id,
            string memory name,
            string memory teamAname,
            string memory teamBname,
            uint256 date,
            OracleInterface.EventOutcome outcome,
            int8 winner
        )
    {
        return betOracle.getLatestEvent(true);
    }

    /**
     * @notice returns the users bet history
     */
    function fetchBetHistory() public view returns (UserBetz[] memory) {
        UserBetz[] memory myBet = new UserBetz[](userBetCount[msg.sender]);
        for (uint256 i = 0; i < userBetCount[msg.sender]; i++) {
            UserBetz memory bet = userBets[msg.sender][i];
            myBet[i] = bet;
        }
        return myBet;
    }

    function getBlock() public returns (uint256) {
        return block.number;
    }

    /**
     * @notice places a bet on the given event
     * @param _eventId      id of the sport event on which to bet
     * @param _chosenWinner index of the supposed winner team
     */
    function placeBet(
        bytes32 _eventId,
        int8 _chosenWinner,
        uint256 _amount
    ) public payable notAddress0(msg.sender) nonReentrant {
        // At least a minimum amout is required to bet
        // require(msg.value >= minimumBet, "Bet amount must be >= minimum bet");

        // // Make sure this is sport event exists (ie. already registered in the Oracle)
        require(betOracle.eventExists(_eventId), "Specified event not found");

        // The chosen winner must fall within the defined number of participants for this event
        require(_betIsValid(_eventId), "Bet is not valid");

        // Event must still be open for betting
        require(_eventOpenForBetting(_eventId), "Event not open for betting");

        // Amount must be greater than 0
        require(_amount > 0, "Amount must be greater than 0");

        // Amount must be greater than balanceAvaliable

        require(
            _amount <= userTokenBal[msg.sender].balanceAvailable,
            "Amount must be greater than avaliable amount"
        );

        if (_chosenWinner == 0) {
            userBet[_eventId].totalAmountOnTeamA = userBet[_eventId]
                .totalAmountOnTeamA
                .add(_amount);
        } else {
            userBet[_eventId].totalAmountOnTeamB = userBet[_eventId]
                .totalAmountOnTeamB
                .add(_amount);
        }

        // add the new bet
        Bet[] storage bets = eventToBets[_eventId];
        bets.push(Bet(msg.sender, _eventId, _amount, _chosenWinner));
        userTokenBal[msg.sender].balanceAvailable = userTokenBal[msg.sender]
            .balanceAvailable
            .sub(_amount);
        userTokenBal[msg.sender].ongoingBetAmount = userTokenBal[msg.sender]
            .ongoingBetAmount
            .add(_amount);
        UserBetz memory bet = UserBetz(_eventId, _amount, _chosenWinner);
        userBetCount[msg.sender] = userBetCount[msg.sender].add(1);
        userBets[msg.sender].push(bet);
        // add the mapping
        bytes32[] storage userBets = userToBets[msg.sender];
        userBets.push(_eventId);

        emit BetPlaced(
            _eventId,
            msg.sender, // player
            _chosenWinner,
            _amount // bet amount
        );
    }

    /**
     * @notice places a bet on the given event
     * @param _eventId      id of the sport event on which to bet
     * @param _chosenWinner index of the supposed winner team
     */
    function flashBet(
        bytes32 _eventId,
        int8 _chosenWinner,
        uint256 _amount,
        address tokenAddress
    ) public payable notAddress0(msg.sender) nonReentrant {
        // At least a minimum amout is required to bet
        // require(msg.value >= minimumBet, "Bet amount must be >= minimum bet");

        // // Make sure this is sport event exists (ie. already registered in the Oracle)
        require(betOracle.eventExists(_eventId), "Specified event not found");

        // The chosen winner must fall within the defined number of participants for this event
        // require(
        //     _betIsValid(msg.sender, _eventId, _chosenWinner),
        //     "Bet is not valid"
        // );

        // Event must still be open for betting
        require(_eventOpenForBetting(_eventId), "Event not open for betting");

        // Amount must be greater than 0
        require(_amount > 0, "Amount must be greater than 0");

        if (_chosenWinner == 0) {
            userBet[_eventId].totalAmountOnTeamA = userBet[_eventId]
                .totalAmountOnTeamA
                .add(_amount);
        } else {
            userBet[_eventId].totalAmountOnTeamB = userBet[_eventId]
                .totalAmountOnTeamB
                .add(_amount);
        }

        // add the new bet
        Bet[] storage bets = eventToBets[_eventId];
        bets.push(Bet(msg.sender, _eventId, _amount, _chosenWinner));

        userTokenBal[msg.sender].ongoingBetAmount = userTokenBal[msg.sender]
            .ongoingBetAmount
            .add(_amount);

        // add the mapping
        bytes32[] storage userBets = userToBets[msg.sender];
        userBets.push(_eventId);

        deposit(tokenAddress, _amount);

        emit BetPlaced(
            _eventId,
            msg.sender, // player
            _chosenWinner,
            _amount // bet amount
        );
    }

    /**
     * @notice send winner price
     */
    function withdrawAmount(uint256 amount, address tokenAddress)
        public
        returns (bool success)
    {
        userTokenBal[msg.sender].balanceAvailable = userTokenBal[msg.sender]
            .balanceAvailable
            .sub(amount);
        userTokenBal[msg.sender].balancewithdrawn = userTokenBal[msg.sender]
            .balancewithdrawn
            .add(amount);
        allTokenBalance[tokenAddress] = allTokenBalance[tokenAddress].sub(
            amount
        );
        IERC20(tokenAddress).transfer(msg.sender, amount);
        return true;
    }

    /**
     * @notice bet lists of the given event
     * @param eventId id of event
     */
    function eventClosure(bytes32 eventId) public returns (Bet[] memory) {
        (
            bytes32 id,
            string memory name,
            string memory teamAname,
            string memory teamBname,
            uint256 date,
            OracleInterface.EventOutcome outcome,
            int8 winner
        ) = getEvent(eventId);
        require(
            outcome == OracleInterface.EventOutcome.Decided,
            "results not declared yet"
        );
        uint256 multiplicationfactor;
        for (uint256 i = 0; i < eventToBets[eventId].length; i++) {
            if (eventToBets[eventId][0].chosenWinner == winner) {
                if (winner == 0) {
                    multiplicationfactor = getOddsA(eventId);
                } else {
                    multiplicationfactor = getOddsB(eventId);
                }
                userTokenBal[eventToBets[eventId][0].user]
                    .balanceAvailable = userTokenBal[msg.sender]
                    .balanceAvailable
                    .add(
                        (multiplicationfactor * eventToBets[eventId][0].amount)
                            .div(100)
                    );
                userTokenBal[eventToBets[eventId][0].user]
                    .ongoingBetAmount = userTokenBal[msg.sender]
                    .ongoingBetAmount
                    .sub(eventToBets[eventId][0].amount);
            }
        }

        return eventToBets[eventId];
    }

    /**
     *  @notice This smart-contract accepts DAI ERC20 token
     */
    receive() external payable {}
}
