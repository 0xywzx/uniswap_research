// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router02.sol";

contract JcamUniswap {
  address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

  IUniswapV2Router02 public uniswapRouter;
  address private multiDaiRopsten = 0xaD6D458402F60fD3Bd25163575031ACDce07538D;

  constructor() public {
    uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
  }

  function convertEthToDai(uint daiAmount) public payable {
    uint deadline = now + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    uniswapRouter.swapETHForExactTokens.value(msg.value)(daiAmount, getPathForETHtoDAI(), address(this), deadline);
    
    // refund leftover ETH to user
    // msg.sender.call.value(address(this).balance)("");
  }
  
  function getEstimatedETHforDAI(uint daiAmount) public view returns (uint[] memory) {
    return uniswapRouter.getAmountsIn(daiAmount, getPathForETHtoDAI());
  }

  function getPathForETHtoDAI() private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = uniswapRouter.WETH();
    path[1] = multiDaiRopsten;
    
    return path;
  }
  
  // important to receive ETH
  receive() payable external {}
}