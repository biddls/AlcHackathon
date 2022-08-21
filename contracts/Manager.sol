pragma solidity ^0.8.11;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAlchemistV2} from ".././v2-contracts-master/contracts/interfaces/IAlchemistV2.sol";
import {IManager} from "./IManager.sol";

import "hardhat/console.sol";

contract Manager is IManager{

	struct Position{
		bool stable;
		bool active;
		address receiver;
		uint256 shares;
		uint256 sinceLast;
	}

	uint256 public positionIndex = 1; // shows the index of the next available position to write to
	address public immutable token; // the address of the token that will be used
	address public immutable alToken; // the address of the token that will be used
	address public immutable alchemistV2; // the address of the token that will be used
	uint256 public immutable yield; // the yield that will be generated over the course of the vault
	uint256 public immutable duration; // the address of the token that will be used
	uint256 public immutable cutOffTime; // the unix time stamp when the contract will go into action
	uint256 public immutable shareScaler; // the address of the token that will be used
	uint256 public immutable end; // the time when the bond matures
	uint256 public sharesStable; // the amount of stable shares that have been matched
	uint256 public sharesVariable; // the amount of variable shares that have been matched
	uint8 public stage = 0; // shows what stage we are at
	mapping(uint256 => Position) public positions; // list of all

	// given a token, partisipents, and shares
	/// @notice Allows a user to join the bond
	/// @param _token address of the token
	/// @param _alToken address of the alToken
	/// @param _AlchemistV2 address of the alToken
	/// @param _yield the yield the contract will generate for the stable party
	/// @param _duration the duration the bond is for
	/// @param _cutOff the time when the bond will go active
	/// @param _shareScalar the number of tokens per share (10^19 = 10 ETH or 10 DAI = 1 share etc.)
	constructor(
		address _token,
		address _alToken,
		address _AlchemistV2,
		uint256 _yield,
		uint256 _duration,
		uint256 _cutOff,
		uint8 _shareScalar
	){
		// makes sure that the contract is set to run in the future
		require(block.timestamp < _cutOff, "Cut off < time");
		// 100% return on the bond over its life (2% for 50 years = 100%)
		require(_yield <= 10**18, "yield too high");
		// a check to see if the address for the token given is accepted by Alchemix
		require(IAlchemistV2(_AlchemistV2).isSupportedYieldToken(_token), "token not supported");

		// load all the config variables into state
		token = _token;
		alToken = _alToken;
		alchemistV2 = _AlchemistV2;
		yield = _yield;
		duration = _duration;
		cutOffTime = _cutOff;
		shareScaler = uint256(10**_shareScalar);
		end = _cutOff + _duration;
	}

	/// @notice allows users to submit offers and accept them
	/// @param _stable are you opening a stable position or not
	/// @param _shares how many shares will you be using
	/// @param _position if you want to match with a position
	function join(bool _stable, uint256 _shares, uint256 _position) _stageCheck(0) public {
		require(block.timestamp < cutOffTime);
		require(_shares > 0);
		// if caller is in the stable vault
		// balance checks
		if (_stable) {
			// check to see if caller has enough coin
			require(IERC20(token).balanceOf(msg.sender) >= shareScaler * _shares);
		} else { // if caller is not in the stable vault
			// gets the number of coins that 'n' shares will produce in profit
			require(IERC20(token).balanceOf(msg.sender) >= (shareScaler * _shares * yield) / 10**18);
		}

		// matching of positions or opening a position
		// writes to the position to the next free slot
		if (_position == 0){
			positions[positionIndex] = Position(
				_stable,
				false,
				msg.sender,
				_shares,
				_stable ? cutOffTime : 0
			);

			positionIndex++; // sets the pointer up for the next user for the next free slot
		} else { // matching with a proposed position
			// cache locally for gas
			Position memory temp = positions[_position];
			require(temp.stable != _stable); // cant both be _stable
			require(temp.shares == _shares); // has to have the same amount of "shares"
			require(temp.active != true); // cant already be reserved

			// collect the amounts
			// if caller is in the stable vault
			if (_stable) {
				IERC20(token).transferFrom(msg.sender, address(this), shareScaler * _shares);
				IERC20(token).transferFrom(temp.receiver, address(this), (shareScaler * _shares * yield) / 10**18);
			} else { // if caller is not in the stable vault
				IERC20(token).transferFrom(temp.receiver, address(this), shareScaler * _shares);
				IERC20(token).transferFrom(msg.sender, address(this), (shareScaler * _shares * yield) / 10**18);
			}

			// increment the amount of shares
			sharesStable += _shares;
			sharesVariable += _shares;

			// store new position and activate another position
			// writes the position to the next free slot
			positions[positionIndex] = Position(
				_stable,
				true,
				msg.sender,
				_shares,
				_stable ? cutOffTime : 0
			);

			// sets the pointer up for the next user for the next free slot
			positionIndex++;

			// activates matched position
			positions[_position].active = true;
		}
	}

	/// @notice Allows someone to start the bond once the cut off time has been met
	function startBond() _stageCheck(0) public {
		// ensures that the cut off time has been passed
		require(block.timestamp > cutOffTime);
		//approves alchemistV2 for spending the tokens
		uint256 _tokens = IERC20(token).balanceOf(address(this));
		IERC20(token).approve(alchemistV2, _tokens);
		// deposits funds into alchemix
		/*uint256 shares = */IAlchemistV2(alchemistV2).deposit(
			token,
			_tokens,
			address(this));

		// mint the yield
		IAlchemistV2(alchemistV2).mint(
			// total payout
			(shareScaler * sharesStable * yield) / 10**18,
			address(this));
		// set started true so the bond can only be started once
		stage = 1;
	}

	/// @notice allows the user to claim their yield
	/// @param _position what position will you call the claim for
	function claim(uint256 _position) public returns (uint256 _yield) {
		require(stage != 0);
		// caching for gas
		uint256 _now = block.timestamp;
		_now = _now > end ? end : _now;

		// not sure if this is needed
		require(_now > cutOffTime);

		// caching for gas
		Position memory temp = positions[_position];
		require(temp.active);

		// stable only
		require(temp.stable);
//		console.log(10e18 * (_now - temp.sinceLast), duration);
		_yield = (10e18 * (_now - temp.sinceLast)) / duration; // 10^18 = 100% elapsed 10^17 = 10% etc.
//		console.log(_yield, yield);
		_yield = (_yield * yield) / 10e18;
//		console.log(_yield);
		_yield = (((10e18 * sharesStable) / temp.shares) * _yield)/(10e18); // number of tokens received
//		console.log(_yield);

		// updates since last
		positions[_position].sinceLast = _now;

		// sends alTokens to recipient
		IERC20(alToken).transfer(temp.receiver, _yield);
	}

	/// @notice ends the bond and closes it all down for the users
	function endBond() _stageCheck(1) public {
		require(block.timestamp >= end);
		// self liquidate
		// if there is debt self liqudidate
		(uint256 shares, ) = IAlchemistV2(alchemistV2).positions(address(this), token);
		///*todo*/		(int256 debt, ) = IAlchemistV2(alchemistV2).accounts(address(this));
		if (shares > 0) {
			IAlchemistV2(alchemistV2).liquidate(token, sharesStable, 1);
		} else {
			// if there is no debt ...
			IAlchemistV2(alchemistV2).withdraw(token, sharesStable, address(this));
		}
		stage = 2;
	}

	/// @notice allows users to redeem their principle once the bond has matured
	/// @param _position allows someone to collect the funds from a position
	function redeemPrinciple(uint256 _position) _stageCheck(2) public returns (uint256 amount){
		// caching for gas
		Position memory temp = positions[_position];

		require(temp.active);
		// return the principle to the stables
		if (temp.stable){
			// calculates original deposit
			sharesStable -= temp.shares;
			amount = temp.shares * shareScaler;
			// deletes position
			delete positions[_position];
			IERC20(token).transfer(temp.receiver, amount);
		} else { // split the rest
			// the profit that was made for the variable people, if this underflow's and reverts they didnt make any profit
			uint256 reserved = IERC20(token).balanceOf(address(this)) - (sharesStable * shareScaler);
			// split the profit proportionally
			amount = (reserved * sharesVariable) / temp.shares;
			sharesVariable -= temp.shares;
			// deletes position
			delete positions[_position];
			// profit sent to receiver
			IERC20(token).transfer(temp.receiver, amount);
		}
	}

	// checks which stage the bond is at
	// 0 - gather funds
	// 1 - bond running
	// 2 - end of bond, distribution of funds
	modifier _stageCheck(uint8 _stage){
		require(_stage == stage);
		_;
	}
}