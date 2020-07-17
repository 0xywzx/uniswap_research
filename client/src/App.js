import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import IUniswapV2Router02 from "./contracts/IUniswapV2Router02.json"
import getWeb3 from "./getWeb3";

import "./App.css";

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

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
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
      value: '',
    }
    this.getEstimatedETHforDAI = this.getEstimatedETHforDAI.bind(this)
  } 

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  getEstimatedETHforDAI = async () => {
    const networkId = await this.state.web3.eth.net.getId();
    // const deployedNetwork = IUniswapV2Router02.networks[networkId];
    const IUniswapV2Router02Instance = new this.state.web3.eth.Contract(
      IUniswapV2Router02.abi,
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    );
    const path = ["0xc778417e063141139fce010982780140aa0cd5ab", "0xaD6D458402F60fD3Bd25163575031ACDce07538D"] // Mainnet Eth/Dai pair ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x6b175474e89094c44da98b954eedeac495271d0f"]
    
    var amount = 1;
    var amountToGet = (amount * 1e18).toString()
    // var amount = new BN(amountToSend * 1e18).toString();
    // 0.000000000000000001 = 1000000000000000000
    // let decimals = this.state.web3.utils.toBN(18);
    // this.state.web3.utils.toBN(1).pow(decimals)
    
    const result = await IUniswapV2Router02Instance.methods.getAmountsIn(amountToGet, path).call()
    console.log(result)
    
    var date = new Date();
    var now = date.getTime();
    const swap = await IUniswapV2Router02Instance.methods.swapETHForExactTokens(amountToGet, path, this.state.accounts[0], now +15).send({ from: this.state.accounts[0], value: result[0].toString() })
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
          <input type="number" value={this.state.value} onChange={this.handleChange} />
          <button
            onClick={this.getEstimatedETHforDAI}>
            swap
          </button>
          <div>The stored value is: {this.state.storageValue}</div>
        </div>
      </div>
    );
  }
}

export default App;
