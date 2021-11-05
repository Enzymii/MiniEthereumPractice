import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { deepPurple } from '@mui/material/colors';
import { Link as RouterLink } from 'react-router-dom';

import { ethContext } from '../App';

const NavBar = () => {
  const eth = useContext(ethContext);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
          >
            <Link
              component={RouterLink}
              color='inherit'
              underline='none'
              to='/'
            >
              Home
            </Link>
          </IconButton>
          <Typography sx={{ flexGrow: 1 }}></Typography>
          <Typography variant='h6' component='div' style={{ margin: '20px' }}>
            <Link
              component={RouterLink}
              color='inherit'
              underline='none'
              to='/my'
            >
              My Collection
            </Link>
          </Typography>
          <Avatar sx={{ bgcolor: deepPurple[500] }}>
            {eth.userAccount.slice(-2)}
          </Avatar>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
