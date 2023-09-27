import React,{} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Login from './components/Login/Login';

import Am from './components/Login/MonitorNotification/Am';
import Pd from './components/Login/MonitorNotification/Pd';
import Purch from './components/Login/MonitorNotification/Purch';
import Prod from './components/Login/MonitorNotification/Prod';
import Qa from './components/Login/MonitorNotification/Qa';
import Logs from './components/Login/MonitorNotification/Logs';

import Home from './components/Home/Home';
import Test from './components/test/test';
import PurchaseOrder from './components/PurchaseOrder/PurchaseOrder';

// datetime
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

const App = () =>{

    // const auth = JSON.parse(localStorage.getItem('profile'));
    // console.log(` app ${auth}`);

    return(
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterMoment}>
            <Routes>
                <Route index path="/" element={<Navigate to="/purchase-orders"/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/am" element={<Am/>} />
                <Route path="/pd" element={<Pd/>} />
                <Route path="/purchasing" element={<Purch/>} />
                <Route path="/production" element={<Prod/>} />
                <Route path="/qa" element={<Qa/>} />
                <Route path="/logistics" element={<Logs/>} />
                <Route path="/test" element={<Test/>} />
                <Route path="/purchase-orders" element={<Home/>} />
                <Route path="/purchase-orders/search" element={<Home/>} />
                <Route path="/purchase-order-detail/:id" element={<PurchaseOrder/>} />
                <Route path="*" element={<Navigate to="/purchase-orders"/>} />
            </Routes>
            </LocalizationProvider>
        </BrowserRouter>
    )
}

export default App;