import React, { useState, useEffect, useContext } from 'react';

import DisplayPage from '../components/DisplayPage';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

import { ethContext } from '../App';

import '../App.css';
import TitleBar from '../components/TitleBar';

const Home = () => {
  const { contract, userAccount } = useContext(ethContext);

  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const getAuctioningCollections = async () => {
      try {
        const collections = await contract.methods.getCollection().call();
        const collectionEndTime = await Promise.all(
          collections.map(
            (collection) =>
              new Promise((resolve, reject) => {
                contract.methods
                  .getNFTEndTime(collection)
                  .call()
                  .then((data) => resolve(data))
                  .catch((err) => reject(err));
              })
          )
        );
        const curTime = new Date().valueOf();
        const onAuctionNFT = collections.filter(
          (_, id) => collectionEndTime[id] > curTime
        );
        setAuctions(onAuctionNFT);
      } catch (e) {
        console.log(e);
      }
    };
    getAuctioningCollections();
  }, [contract, userAccount]);

  return (
    <>
      <NavBar />
      <TitleBar title={'Auctioning'} />
      <DisplayPage idArray={auctions} />
      <Footer />
    </>
  );
};

export default Home;
