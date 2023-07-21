import React from 'react';
import Appbar from '../Home/Appbar/Appbar';
import {Grow} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'

import PODetails from './PODetails/PODetails';

const PurchaseOrder = () =>{

  return(
    <>
      <Appbar/>
      <Grow in>
        <div>
            <PODetails/> 
        </div>
      </Grow>
    </>
    
  )
};

export default PurchaseOrder;

