import React from 'react';
import { ethContext } from '../App';

const TestComponent = () => {
  const eth = React.useContext(ethContext);
  const [addr, setAddr] = React.useState('No addr');

  React.useEffect(() => {
    (async () => {
      setAddr(
        window.ethereum?.selectedAddress ?? 'no window.ethereum.selectedAddress'
      );
    })();
  }, [eth]);

  return <>{addr}</>;
};

export default TestComponent;
