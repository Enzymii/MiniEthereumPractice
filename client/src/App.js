import React, { Component } from 'react';
import PlatformContract from '../contracts/Platform.json';

import './App.css';
import getEthEnv from './utils';

import { BrowserRouter, Switch, Route } from 'react-router-dom';
import TestComponent from './components/test';

export const ethContext = React.createContext({
  web3: null,
  accounts: null,
  networkId: null,
  userAccount: null,
});

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    networkId: null,
    contract: null,
    userAccount: null,
  };

  componentDidMount = async () => {
    try {
      const ethEnv = await getEthEnv();

      const deployedNetwork = PlatformContract.networks[ethEnv.networkId];
      const contract = new ethEnv.web3.eth.Contract(
        PlatformContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const changedState = { ...ethEnv, contract };
      console.log(changedState);
      this.setState(changedState);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <ethContext.Provider value={{ ...this.state }}>
        {/* <BrowserRouter>
          <Switch>
            <Route exact path="/" component={} />
            <Route exact path="/my" component={} />
            <Route exact path="/bid" component={} />
            <Route path="/detail/:id" component={} />
          </Switch>
        </BrowserRouter> */}
        <TestComponent />
      </ethContext.Provider>
    );
  }
}

export default App;
