import React from 'react';
import Appbar from './Appbar/Appbar';
import Table from './Table/Table';
import { Box,Grow,Stack,Badge,Typography,Link,Autocomplete,TextField} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'

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

