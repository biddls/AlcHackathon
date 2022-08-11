pragma solidity ^0.8.0;

contract Manager {

	struct Position{
		bool stable;
		address receiver;
		address token;
	}

	uint256 public immutable yield;
	address public immutable token;

	mapping(uint256 => Position) public positions;

	// given a token, partisipents, and shares
	constructor(address _token, uint256 _yield){
		yield = _yield;
		token = _token;
	}

	function join(){

	}
}
