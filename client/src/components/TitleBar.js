import React from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import '../App.css';

const TitleBar = ({ title }) => {
  return (
    <Container className='title'>
      <Typography variant='h4'>{title}</Typography>
    </Container>
  );
};

export default TitleBar;
