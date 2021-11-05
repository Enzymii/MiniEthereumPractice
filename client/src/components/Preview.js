import React, { useState, useEffect, useContext } from 'react';

import Card from '@mui/material/Card';

import { Link } from 'react-router-dom';

import { ethContext } from '../App';

import '../App.css';

const Preview = ({ id }) => {
  const { contract, ipfs } = useContext(ethContext);

  const [nftContent, setNftContent] = useState(id);

  useEffect(() => {
    const getNftContent = async () => {
      try {
        const key = await contract.methods.getNFTId(id).call();
        /** @type {AsyncIterable<Uint8Array>} */
        const buffers = ipfs.cat(`/ipfs/${key}`);
        let data = '';
        for await (const buffer of buffers) {
          data += new TextDecoder().decode(buffer);
        }
        setNftContent(data);
      } catch (e) {
        console.log(e);
      }
    };
    getNftContent();
  }, [id, contract, ipfs]);

  return (
    <Card className='preview'>
      <Link to={`/detail/${id}`}>
        <img src={nftContent} alt={id} width='100%' />
      </Link>
    </Card>
  );
};

export default Preview;
