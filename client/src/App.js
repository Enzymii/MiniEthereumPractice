import React, { Component } from 'react';
import PlatformContract from './contracts/Platform.json';

import { BrowserRouter, Switch, Route } from 'react-router-dom';
import * as IPFS from 'ipfs-core';

import getEthEnv from './utils';
import Detail from './pages/Detail';
import MyCollection from './pages/MyCollection';

import './App.css';
import Home from './pages/Home';

export const ethContext = React.createContext({
  web3: null,
  accounts: null,
  networkId: null,
  userAccount: null,
  contract: null,
  ipfs: null,
});

export const bMapping = React.createContext([]);

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    networkId: null,
    contract: null,
    userAccount: null,

    bMap: [],
  };

  componentDidMount = async () => {
    try {
      const ethEnv = await getEthEnv();

      const deployedNetwork = PlatformContract.networks[ethEnv.networkId];
      const contract = new ethEnv.web3.eth.Contract(
        PlatformContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      const ipfs = await IPFS.create();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ ...ethEnv, contract, ipfs });
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

    const { web3, accounts, networkId, contract, userAccount, ipfs } =
      this.state;

    return (
      <ethContext.Provider
        value={{ web3, accounts, networkId, contract, userAccount, ipfs }}
      >
        <bMapping.Provider value={[...this.state.bMap]}>
          <BrowserRouter>
            <Switch>
              <Route exact path='/'>
                <Home />
              </Route>
              <Route exact path='/my'>
                <MyCollection
                  insertMap={(k, v) =>
                    this.setState([...this.state.bMap, { [k]: v }])
                  }
                />
              </Route>
              <Route path='/detail/:id'>
                <Detail />
              </Route>
            </Switch>
          </BrowserRouter>
        </bMapping.Provider>
      </ethContext.Provider>
    );
  }
}

export default App;
