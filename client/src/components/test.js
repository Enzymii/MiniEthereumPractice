import React from 'react';
import { ethContext } from '../App';

import PlatformContract from '../contracts/Platform.json';

const TestComponent = () => {
  const eth = React.useContext(ethContext);
  const [addr, setAddr] = React.useState('No addr');

  React.useEffect(() => {
    (async () => {
      const deployedNetwork = PlatformContract.networks[eth.networkId];
      const { contract } = eth;
      const p = await contract.methods.getCollection().call();
      console.log(p);
      if (p.toString().length) {
        setAddr(p);
      }
    })();
  }, [eth]);

  return <>{addr}</>;
};

export default TestComponent;
