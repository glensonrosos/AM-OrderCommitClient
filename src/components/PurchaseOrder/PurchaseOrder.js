import React from 'react';
import Appbar from '../Home/Appbar/Appbar';
import {Grow} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'

import PODetails from './PODetails/PODetails';
import POGrid from './PODetails/POGrid';

const PurchaseOrder = () =>{

  return(
    <>
      <Appbar/>
      <Grow in>
        <div>
            <PODetails/> 
            <POGrid/>
        </div>
      </Grow>
    </>
    
  )
};

export default PurchaseOrder;

