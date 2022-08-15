pragma solidity ^0.8.11;

contract util {
    function _now() public view returns (uint256){
        return block.timestamp;
    }
}
