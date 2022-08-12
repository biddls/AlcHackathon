pragma solidity ^0.8.11;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Manager {

	struct Position{
		bool stable;
		bool active;
		address receiver;
		uint256 shares;
	}
	uint256 public positionIndex = 1; // shows the index of the next available position to write to
	uint256 public immutable cutOffTime; // the unix time stamp when the contract will go into action
	uint256 public immutable yield; // the yield that will be generated over the course of the vault
	address public immutable token; // the address of the token that will be used
	uint256 public immutable shareScaler; // the address of the token that will be used
	uint256 public immutable duration; // the address of the token that will be used
	bool public started = false;

	mapping(uint256 => Position) public positions;

	// given a token, partisipents, and shares
	/// @notice Allows a user to join the bond
	/// @param _token address of the token
	/// @param _yield the yield the contract will generate for the stable party
	/// @param _duration the duration the bond is for
	/// @param _cutOff the time when the bond will go active
	/// @param _shareScalar the number of tokens per share (10^19 = 10 ETH or 10 DAI = 1 share etc.)
	constructor(address _token, uint256 _yield, uint256 _duration, uint256 _cutOff, uint8 _shareScalar){
		// makes sure that the contract is set to run in the future
		require(block.timestamp < _cutOff);
		token = _token;
		yield = _yield;
		duration = _duration;
		cutOffTime = _cutOff;
		shareScaler = uint256(10**_shareScalar);
		// todo: add a check to see if the address for the token given is accepted by Alchemix
	}

	function join(bool _stable, uint256 _shares, uint256 _position) cutOff public {
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
		if (_position == 0){
			positions[positionIndex] = Position(
				_stable,
				false,
				msg.sender,
				_shares
			); // writes the position to the next free slot
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

			// store new position and activate another position
			positions[positionIndex] = Position(
				_stable,
				true,
				msg.sender,
				_shares
			); // writes the position to the next free slot
			positionIndex++; // sets the pointer up for the next user for the next free slot

			positions[_position].active = true; // activates matched position
		}
	}

	/// @notice Allows someone to start the bond once the cut off time has been met
	function startBond() public {
		require(block.timestamp > cutOffTime);
		// todo: deposit
	}

	// makes sure that a function cant be called after the contract is due to start
	modifier cutOff(){
		if (block.timestamp < cutOffTime){
			_;
		} else {
			// trigger start for the bond
		}
	}
}
