import React from 'react';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

import Preview from './Preview';

import '../App.css';

const DisplayPage = ({ idArray }) => {
  const displayComponents = idArray.map((id) => (
    <Grid item xs={6} md={3} key={id}>
      <Preview id={id} />
    </Grid>
  ));

  return (
    <Container class='display'>
      <Grid container spacing={3}>
        {displayComponents}
      </Grid>
    </Container>
  );
};

export default DisplayPage;
