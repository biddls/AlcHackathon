pragma solidity ^0.8.0;

import  {YearnTokenAdapter} from "../v2-contracts-master/contracts/adapters/yearn/YearnTokenAdapter.sol";

contract Adapter is YearnTokenAdapter{

    uint256 public _price;

	constructor(uint256 __price) YearnTokenAdapter(
        address(0xa258C4606Ca8206D8aA700cE2143D7db854D168c),
        address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
    ){
        _price = __price;
    }

    function price() public override view returns (uint256){
        return _price;
    }

    function setPrice(uint256 __price) public {
        require(__price > _price);

        _price = __price;
    }
}
