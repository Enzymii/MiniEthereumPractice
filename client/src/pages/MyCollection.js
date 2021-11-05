import React, { useState, useContext, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';
import Icon from '@mui/material/Icon';
import Grid from '@mui/material/Grid';

import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import DisplayPage from '../components/DisplayPage';
import TitleBar from '../components/TitleBar';
import { ethContext } from '../App';

import '../App.css';

const MyCollection = ({ insertMap }) => {
  const { contract, userAccount, ipfs } = useContext(ethContext);
  const [dialogOn, setDialogOn] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [creationArray, setCreationArray] = useState([]);
  const [collectionArray, setCollectionArray] = useState([]);

  useEffect(() => {
    const getCollectionAsync = async () => {
      try {
        const idArr = await contract.methods
          .getUserCollection(userAccount)
          .call();
        setCollectionArray([...idArr]);
      } catch (e) {
        console.log(e);
      }
    };

    const getCreationAsync = async () => {
      try {
        const collections = await contract.methods.getCollection().call();
        const creators = await Promise.all(
          collections.map(
            (collection) =>
              new Promise((resolve, reject) => {
                contract.methods
                  .getNFTCreator(collection)
                  .call()
                  .then((data) => resolve(data))
                  .catch((err) => reject(err));
              })
          )
        );
        console.log(creators, userAccount);
        const onAuctionNFT = collections.filter(
          (_, id) => creators[id].toUpperCase() === userAccount.toUpperCase()
        );
        setCreationArray(onAuctionNFT);
      } catch (e) {
        console.log(e);
      }
    };

    getCollectionAsync();
    getCreationAsync();
  }, [contract, userAccount]);

  const createNFT = async () => {
    setDialogOn(true);
  };

  const [fileName, setFileName] = useState('');

  const handleFileChange = async (e) => {
    return new Promise((resolve) => {
      // convert e.target.files[0] to base64
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      setFileName(e.target.files[0].name);
      reader.onload = () => {
        setFileData(reader.result);
        resolve();
      };
    });
  };

  const uploadNFT = async () => {
    if (!fileData) {
      return;
    }
    try {
      const { path } = await ipfs.add(fileData);

      await contract.methods
        .upload(userAccount, path)
        .send({ from: userAccount });
      window.location.reload();
    } catch (e) {
      console.log(e);
    } finally {
      setDialogOn(false);
    }
  };

  return (
    <>
      <div className='my-collection'>
        <NavBar />
        <TitleBar title='My Creation' />
        <DisplayPage idArray={creationArray} />
        <Button
          className='create-btn'
          variant='contained'
          color='primary'
          onClick={createNFT}
        >
          <Icon>add</Icon>
        </Button>
        <TitleBar title='My Possessions' />
        <DisplayPage idArray={collectionArray} />
        <Footer />
      </div>
      <Dialog open={dialogOn}>
        <Card className='dialog-card-upload'>
          <Grid container>
            <Grid item xs={6}>
              <input
                accept='image/*'
                style={{ display: 'none' }}
                id='raised-button-file'
                multiple
                type='file'
                onChange={handleFileChange}
              />
              <label htmlFor='raised-button-file'>
                <Button variant='raised' component='span'>
                  Select a file...
                </Button>
              </label>
            </Grid>
            <Grid item xs={6}>
              {fileName}
            </Grid>
            <Grid item xs={6}>
              <Button variant='contained' color='primary' onClick={uploadNFT}>
                Confirm
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant='raised'
                color='primary'
                onClick={() => setDialogOn(false)}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Dialog>
    </>
  );
};

export default MyCollection;
