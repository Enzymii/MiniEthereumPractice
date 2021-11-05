import React, { useState, useEffect, useContext } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';

import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import TimePicker from '@material-ui/lab/TimePicker';
import DatePicker from '@material-ui/lab/DatePicker';

import { useParams } from 'react-router-dom';
import * as Web3 from 'web3';

import { ethContext } from '../App';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

import '../App.css';

const Detail = () => {
  const { id } = useParams();

  const { contract, userAccount, ipfs } = useContext(ethContext);

  const [data, setData] = useState('');
  const [creator, setCreator] = useState('');
  const [highestBid, setHighestBid] = useState(0);
  const [nftEndTime, setNftEndTime] = useState(0);
  const [highestBider, setHighestBider] = useState('');
  const [historyOwner, setHistoryOwner] = useState([]);
  const [buttonStatus, setButtonStatus] = useState(0);

  useEffect(() => {
    const getDetails = async () => {
      try {
        const nftPath = await contract.methods.getNFTId(id).call();

        /** @type {AsyncIterable<Uint8Array>} */
        const buffers = ipfs.cat(`/ipfs/${nftPath}`);
        let nftData = '';
        for await (const buffer of buffers) {
          nftData += new TextDecoder().decode(buffer);
        }
        setData(nftData);

        const creator = await contract.methods.getNFTCreator(id).call();
        setCreator(creator);
        const endT = await contract.methods.getNFTEndTime(id).call();
        setNftEndTime(endT);
        const { 0: highestBider, 1: highestBid } = await contract.methods
          .getHighestBid(id)
          .call();
        setHighestBider(highestBider);
        setHighestBid(highestBid);
        let stat = 0;
        if (new Date().valueOf() < endT) {
          stat = 1;
        } else if (highestBid > 0) {
          stat = 2;
        }
        const owners = await contract.methods.getNFTHistoryOwner(id).call();
        setHistoryOwner(owners);

        const owner = await contract.methods.getNFTOwner(id).call();
        if (stat === 2) {
          if (highestBider.toUpperCase() === userAccount.toUpperCase()) {
            setButtonStatus(4);
          } else {
            setButtonStatus(1);
          }
        } else if (stat === 1) {
          setButtonStatus(3);
        } else if (owner.toUpperCase() === userAccount.toUpperCase()) {
          setButtonStatus(2);
        } else {
          setButtonStatus(1);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getDetails();
  }, [contract, userAccount, id, ipfs]);

  const buttonText = ['Loading', 'Inactive', 'Sell', 'Bid', 'Claim'];

  const [dialogOn, setDialogOn] = useState(false);
  const [price, setPrice] = useState(0);
  const [endTime, setEndTime] = useState(new Date());

  const handleClick = async () => {
    switch (buttonStatus) {
      case 2:
      case 3:
        setDialogOn(true);
        break;
      case 4:
        confirmAction('claim');
        break;
      default:
        break;
    }
  };

  const confirmAction = async (action) => {
    try {
      switch (action) {
        case 'sell':
          await contract.methods
            .sell(userAccount, id, endTime.valueOf(), price)
            .send({ from: userAccount });
          break;
        case 'bid':
          await contract.methods
            .bid(userAccount, id, price)
            .send({ from: userAccount });
          break;
        case 'claim':
          await contract.methods
            .claim(userAccount, id)
            .send({ from: userAccount, value: highestBid });
          break;
        default:
          throw new Error('unsupported action');
      }
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };

  const historyOwnerList = historyOwner.map((owner) => (
    <>
      <Divider />
      <ListItem key={owner} className='detail-item'>
        {owner}
      </ListItem>
    </>
  ));

  return (
    <>
      <NavBar />
      <Container maxWidth={'1600px'} className='main-box'>
        <Typography variant='h4'>NFT Detail</Typography>
        <Grid container spacing={4} justifyContent='center' alignItems='center'>
          <Grid item xs={12} md={8}>
            <img
              src={data}
              alt={id}
              width='100%'
              style={{ maxHeight: '80vh' }}
            ></img>
          </Grid>
          <Grid container item xs={12} md={4}>
            <Grid item xs={12}>
              <Card className='detail-box'>
                <Typography variant='subtitle1'>Creator</Typography>
                <Typography className='detail-item' variant='body2'>
                  {creator}
                </Typography>
                {buttonStatus > 2 ? (
                  <>
                    <Divider />
                    <Typography variant='subtitle1'>Auction End</Typography>
                    <Typography className='detail-item' variant='body2'>
                      {new Date(parseInt(nftEndTime)).toLocaleString()}
                    </Typography>
                    <Typography variant='subtitle1'>Highest Now</Typography>
                    <Typography className='detail-item'>
                      {Web3.utils.fromWei(highestBid, 'ether')} ETH
                    </Typography>
                    <Typography variant='subtitle1'>From Bider</Typography>
                    <Typography className='detail-item'>
                      {highestBider}{' '}
                      {highestBider.toUpperCase() ===
                      userAccount.toUpperCase() ? (
                        <Chip label='You' color='primary' />
                      ) : null}
                    </Typography>
                  </>
                ) : null}
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card className='detail-box'>
                <Typography variant='h6'>History Owners</Typography>
                <List>{historyOwnerList}</List>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Button
                className='action-btn'
                variant='contained'
                color='primary'
                onClick={handleClick}
                disabled={buttonStatus < 2}
              >
                {buttonText[buttonStatus]}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Footer />
        <Dialog open={dialogOn}>
          <Card className='dialog-card'>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography className='dialog-title' variant='h4'>
                  {buttonText[buttonStatus].toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  className='dialog-input'
                  variant='outlined'
                  label={buttonStatus === 2 ? 'Start Price' : 'Bid Price'}
                  onChange={(e) => {
                    try {
                      setPrice(Web3.utils.toWei(e.target.value, 'ether'));
                    } catch {}
                  }}
                />
              </Grid>

              {buttonStatus === 2 ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid item xs={12}>
                    <DatePicker
                      label='End Date'
                      views={['year', 'month', 'day']}
                      value={endTime}
                      onChange={(e) => setEndTime(e)}
                      renderInput={(params) => (
                        <TextField className='dialog-input' {...params} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TimePicker
                      label='End Time'
                      views={['hours', 'minutes', 'seconds']}
                      inputFormat='hh:mm:ss'
                      mask='___:__:__'
                      value={endTime}
                      onChange={(e) => setEndTime(e)}
                      renderInput={(params) => (
                        <TextField className='dialog-input' {...params} />
                      )}
                    />
                  </Grid>
                </LocalizationProvider>
              ) : null}

              <Grid item xs={6}>
                <Button
                  className='dialog-btn'
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    confirmAction(buttonStatus === 2 ? 'sell' : 'bid');
                    setDialogOn(false);
                  }}
                >
                  Confirm
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  className='dialog-btn'
                  onClick={() => setDialogOn(false)}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Dialog>
      </Container>
    </>
  );
};

export default Detail;
