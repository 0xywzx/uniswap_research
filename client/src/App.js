import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import IUniswapV2Router02 from "./contracts/IUniswapV2Router02.json";
import IUniswapV2Pair from "./contracts/IUniswapV2Pair.json"
import getWeb3 from "./getWeb3";
import "./App.css";

const wethToDaiPath = ["0xc778417e063141139fce010982780140aa0cd5ab", "0xaD6D458402F60fD3Bd25163575031ACDce07538D"] // Mainnet Eth/Dai pair ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x6b175474e89094c44da98b954eedeac495271d0f"]
const daiToWethPath = ["0xaD6D458402F60fD3Bd25163575031ACDce07538D", "0xc778417e063141139fce010982780140aa0cd5ab"]
const date = new Date();
const now = date.getTime();

class App extends Component {

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      // UniswapV2Router02 のインスタンスの作成
      const IUniswapV2Router02Instance = new web3.eth.Contract(
        IUniswapV2Router02.abi,
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      );

      // UniswapV2Pair（Dai-Ethのペア） のインスタンスの作成
      const IUniswapV2PairInstance = new web3.eth.Contract(
        IUniswapV2Pair.abi,
        "0x1c5DEe94a34D795f9EEeF830B68B80e44868d316", // Dai-Eth Pair のコントラクトアドレス
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ 
        web3, 
        accounts, 
        contract: instance,
        IUniswapV2Router02Instance,
        IUniswapV2PairInstance
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  constructor(props) {
    super(props) 
    this.state= {
      web3: null, 
      accounts: null, 
      contract: null,
      uniswapContract: null,
      IUniswapV2Router02: null,
      IUniswapV2PairInstance: null,
      amountToGetDai: '',
      amountToGetEth: '',
      nessesaryAmountOfEth: '',
      nessesaryAmountOfDai: '',
      amountToAddLiquidityEth: '',
      amountToAddLiquidityDai: '',
    }
    this.handleChangeDaiInput = this.handleChangeDaiInput.bind(this)
    this.handleChangeEthInput = this.handleChangeEthInput.bind(this)
    this.handleCalculateDaiAmountToAddLiquidity = this.handleCalculateDaiAmountToAddLiquidity.bind(this)
    this.swapETHtoDai = this.swapETHtoDai.bind(this)
  } 

  handleChangeDaiInput = async (event) => {
    this.setState({ amountToGetDai: event.target.value });

    // 入力された数値をWeiに変更
    var amountToGetInWei = (event.target.value * 1e18 ).toString()

    const result = await this.state.IUniswapV2Router02Instance.methods.getAmountsIn(amountToGetInWei, wethToDaiPath).call()
    this.setState({
      nessesaryAmountOfEth: result[0]/1e18
    });
  }

  swapETHtoDai = async () => {
    var amountToGet = (this.state.amountToGetDai * 1e18).toString()
    // BigNumberとか使った方がいいのかなと思いつつ、、、
    // var amount = new BN(amountToSend * 1e18).toString();
    // 0.000000000000000001 = 1000000000000000000
    // let decimals = this.state.web3.utils.toBN(18);
    // this.state.web3.utils.toBN(1).pow(decimals)
    const result = await this.state.IUniswapV2Router02Instance.methods.getAmountsIn(amountToGet, wethToDaiPath).call()    
    await this.state.IUniswapV2Router02Instance.methods.swapETHForExactTokens(amountToGet, wethToDaiPath, this.state.accounts[0], now +15).send({ from: this.state.accounts[0], value: result[0].toString() })
    .once('receipt', async (receipt) => { 
      console.log(receipt)
    })
  }

  handleChangeEthInput = async (event) => {
    this.setState({ amountToGetEth: event.target.value });
    var amountToGetInWei = (event.target.value * 1e18 ).toString()

    const result = await this.state.IUniswapV2Router02Instance.methods.getAmountsIn(amountToGetInWei, daiToWethPath).call()
    console.log(result)
    this.setState({
      nessesaryAmountOfDai: result[0]/1e18
    });
  }

  swapDaitoETH = async () => {
    var amountToGet = (this.state.amountToGetEth * 1e18).toString()
    const result = await this.state.IUniswapV2Router02Instance.methods.getAmountsIn(amountToGet, daiToWethPath).call()
    await this.state.IUniswapV2Router02Instance.methods.swapTokensForExactETH(amountToGet, result[0].toString(), daiToWethPath, this.state.accounts[0], now +15).send({ from: this.state.accounts[0] })
    .once('receipt', async (receipt) => { 
      console.log(receipt)
    })
  }

  handleCalculateDaiAmountToAddLiquidity = async (event) => {
    this.setState({ amountToAddLiquidityEth: event.target.value });
    const result = await this.state.IUniswapV2PairInstance.methods.getReserves().call()
    this.setState({
      amountToAddLiquidityDai: (result[0]/result[1])*this.state.amountToAddLiquidityEth
    });
  }

  addLiquidityETH = async () => {
    const result = await this.state.IUniswapV2PairInstance.methods.getReserves().call()
    await this.state.IUniswapV2Router02Instance.methods.addLiquidityETH("0xaD6D458402F60fD3Bd25163575031ACDce07538D", ((result[0]/result[1]*1e18)*this.state.amountToAddLiquidityEth).toString(), ((result[0]/result[1]*1e18*0.99)*this.state.amountToAddLiquidityEth).toString(), (this.state.amountToAddLiquidityEth*1e18*0.99).toString(), this.state.accounts[0], now +15).send({ from: this.state.accounts[0], value: (this.state.amountToAddLiquidityEth * 1e18).toString() })
    .once('receipt', async (receipt) => { 
      console.log(receipt)
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>
          <h2>ETH → DAI</h2>
          <span>欲しいDAI</span>
          <input type="number" name="amountToGetDai" onChange={this.handleChangeDaiInput} value={this.state.amountToGetDai} />
          <span>必要なETH {this.state.nessesaryAmountOfEth}</span>
          <br />
          <button
            onClick={this.swapETHtoDai}>
            swap
          </button>
          <h2>DAI → ETH</h2>
          <p><a href="https://ropsten.etherscan.io/address/0xaD6D458402F60fD3Bd25163575031ACDce07538D#writeContract">ここで</a>必要になるDaiをapprove関数にてallowanceする（単位は 必要なDai x 1e18 ex. 1Dai = 1000000000000000000 ）</p>
          <p>spenderのアドレスは”0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D”</p>
          <span>欲しいETH</span>
          <input type="number" name="amountToGetEth" onChange={this.handleChangeEthInput} value={this.state.amountToGetEth} />
          <span>必要なDai {this.state.nessesaryAmountOfDai}</span>
          <br />
          <button
            onClick={this.swapDaitoETH}>
            swap
          </button>
          <br />
          <h2>流動性供給</h2>
          <div>
            <input type="number" name="amountToAddLiquidityEth" onChange={this.handleCalculateDaiAmountToAddLiquidity} value={this.state.amountToAddLiquidityEth} />ETH 
            <span> 必要なDai {this.state.amountToAddLiquidityDai}</span>
          </div>
          <button
            onClick={this.addLiquidityETH}>
            流動性供給
          </button>
        </div>
      </div>
    );
  }
}

export default App;
