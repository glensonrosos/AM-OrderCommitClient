import React,{} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import PurchaseOrder from './components/PurchaseOrder/PurchaseOrder';

// datetime
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

const App = () =>{
    return(
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterMoment}>
            <Routes>
                <Route index path="/" element={<Navigate to="/purchase-orders/"/>} />
                <Route index path="/purchase-orders" element={<Home/>} />
                <Route index path="/purchase-order-details/" element={<PurchaseOrder/>} />
                <Route path="/login" element={<Login/>}  />
                <Route path="*" element={<Navigate to="/purchase-orders/"/>} />
            </Routes>
            </LocalizationProvider>
        </BrowserRouter>
    )
}

export default App;