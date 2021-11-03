import getWeb3 from './getWeb3';

const getEthEnv = async () => {
  try {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();

    // Get the contract instance.
    const networkId = await web3.eth.net.getId();

    const userAccount = window.ethereum.selectedAddress;

    return { web3, accounts, networkId, userAccount };
  } catch (error) {
    console.log(error);
  }
};

export default getEthEnv;
