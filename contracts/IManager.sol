interface IManager {
  function alToken() external view returns (address);
  function alchemistV2() external view returns (address);
  function claim(uint256 _position) external returns (uint256 _yield);
  function cutOffTime() external view returns (uint256);
  function duration() external view returns (uint256);
  function end() external view returns (uint256);
  function endBond() external;
  function join(bool _stable, uint256 _shares, uint256 _position) external;
  function positionIndex() external view returns (uint256);
  function positions(uint256) external view returns (bool stable, bool active, address receiver, uint256 shares, uint256 sinceLast);
  function redeemPrinciple(uint256 _position) external returns (uint256 amount);
  function shareScaler() external view returns (uint256);
  function sharesStable() external view returns (uint256);
  function sharesVariable() external view returns (uint256);
  function stage() external view returns (uint8);
  function startBond() external;
  function token() external view returns (address);
  function yield() external view returns (uint256);
}
