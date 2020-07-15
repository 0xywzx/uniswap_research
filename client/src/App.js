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
    }
    this.runExample = this.runExample.bind(this)
    this.getEstimatedETHforDAI = this.getEstimatedETHforDAI.bind(this)
  } 

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(10).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  getEstimatedETHforDAI = async () => {
    const networkId = await this.state.web3.eth.net.getId();
    // const deployedNetwork = IUniswapV2Router02.networks[networkId];
    const IUniswapV2Router02Instance = new this.state.web3.eth.Contract(
      IUniswapV2Router02.abi,
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    );
    const path = ["0xc778417e063141139fce010982780140aa0cd5ab", "0xaD6D458402F60fD3Bd25163575031ACDce07538D"] // Mainnet Eth/Dai pair ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x6b175474e89094c44da98b954eedeac495271d0f"]
    const result = await IUniswapV2Router02Instance.methods.getAmountsIn(10, path).call()
    console.log(result)
    // await this.setState({
    //   joinedGames: joinedGamesArrey
    // })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
          <button
            onClick={this.getEstimatedETHforDAI}>
            Create Game
          </button>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}

export default App;
