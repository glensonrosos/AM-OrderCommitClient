import React from 'react';
import Appbar from './Appbar/Appbar';
import Table from './Table/Table';
import {Grow} from '@mui/material';

const Home = () =>{

  return(
    <>
      <Appbar/>
      <Grow in>
        <div>
        <Table/>    
        </div>
      </Grow>
    </>
  )
};

export default Home;

