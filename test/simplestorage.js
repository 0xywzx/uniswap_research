const JcamUniswap = artifacts.require("./JcamUniswap.sol");

contract("JcamUniswap", accounts => {
  it("", async () => {
    const jcamUniswapInstance = await JcamUniswap.deployed();
    const result = await jcamUniswapInstance.getEstimatedETHforDAI(1, { from: accounts[0] });
    console.log(result)
  });
});
