import React,{useEffect,useState} from 'react';
import {Box,TextField, Autocomplete,Paper, Typography,Button,Backdrop,CircularProgress,Snackbar,Alert} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';


import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';


import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useParams } from 'react-router';

import POGrid from './POGrid';
import { useSelector,useDispatch } from 'react-redux';
import {getPO,updatePOByAm,updatePOByLogistics} from '../../../actions/purchaseOrders';
import {getBuyers} from '../../../actions/buyers';
import {getDepartments} from '../../../actions/departments';
import {getStatus} from '../../../actions/status';



const PODetails = () =>{
    const {id} = useParams();

    const dispatch = useDispatch();

    const {purchaseOrders,isLoading} = useSelector(state=> state.purchaseOrders); 
    const {buyers,isLoading:buyerLoading} = useSelector(state=> state.buyers);
    const {departments,isLoading:departmentLoading} = useSelector(state=> state.departments);
    const {status,isLoading:statusLoading} = useSelector(state=> state.status);


    useEffect(()=>{
        dispatch(getBuyers());
        dispatch(getDepartments());
        dispatch(getStatus());
        dispatch(getPO(id)); 
   },[dispatch]);

    const [input,setInput] = useState({
        dateIssued:null,
        buyer:null,
        poNumber:null,
        shipDate:null,
        status:null,
        reqAttDepts:[],
        remarks:null,
        logRequiredShipDate:null,
        logRequestedShipDate:null,
    });
    const [inputBuyer,setInputBuyer] = useState([]);
    const [inputDepartment,setInputDepartment] = useState([]);
    const [inputStatus,setInputStatus] = useState([]);

    const [snackbar, setSnackbar] = React.useState(null);
    const handleCloseSnackbar = () => setSnackbar(null);
    
    const processRowUpdate =  () =>{
        setSnackbar({ children: 'Successfully Saved', severity: 'success' });
    };

    const handleProcessRowUpdateError = () => {
        setSnackbar({ children: "error", severity: 'error' });
    };

    useEffect(()=>{
        if(purchaseOrders?.length > 0 && buyers?.length > 0 && status?.length > 0 && departments?.length > 0){

            const po = purchaseOrders[0];
            setInput({
                ...input,
                dateIssued:po.dateIssued,
                buyer:po.buyer,
                poNumber:po.poNumber,
                shipDate:po.shipDate,
                status:po.status,
                reqAttDepts:po.reqAttDepts,
                remarks:po.remarks,
                logRequiredShipDate:po.logCom.requiredShipDate,
                logRequestedShipDate:po.logCom.requestedShipDate
            });
            
            setInputBuyer(buyers);
            setInputDepartment(departments);
            setInputStatus(status);
        }
    },[purchaseOrders]);


    const handleOnChangeInput = (name,e,val=null) =>{
        if(name === "dateIssued" || name === "shipDate" || name === "logRequestedShipDate" || name === "logRequiredShipDate"){
            setInput({
            ...input,
            [name]: e
            });
        }else if(name === "reqAttDepts" || name === "buyer" || name === "status"){
            setInput({
                ...input,
                [name]: val 
            });
        }else
            setInput({
                ...input,
                [name]: e.target.value 
            });
        }

    const handleSaveByAM = () =>{
        const {dateIssued,buyer,poNumber,shipDate,status,reqAttDepts,remarks} = input;
        dispatch(updatePOByAm(purchaseOrders[0]?._id,{dateIssued,buyer,poNumber,shipDate,status,reqAttDepts,remarks}));
        processRowUpdate()
    }

    const handleSaveByLogistics = () =>{
        const {logRequiredShipDate, logRequestedShipDate} = input;
        dispatch(updatePOByLogistics(purchaseOrders[0]?._id,{logRequiredShipDate,logRequestedShipDate}));
        processRowUpdate()
    }

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return(
        <Box mt={5}>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading || departmentLoading || buyerLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <div>
                {/* defaultExpanded */}
                <Accordion  sx={{
                    backgroundColor: "#283c50ad",
                    color:"#fff"
                }}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <Typography>Purchase Order Info (Account Management / Logistics)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Grid container spacing={2} justifyContent="center" sx={{mb:2}}>  
                <Grid xs={6} md={8} lg={8}>  
                <Paper elevation={6}>
                    <Grid container spacing={4} justifyContent="center">
                    <Grid xs={6} md={12} lg={12}> 
                           <Grid spacing={2} container direction="row" alignItems="flex-end">
                            <Typography variant="h5" sx={{ml:2}}> Account Management </Typography>
                            {/* <Typography variant="p" color="error" sx={{ml:2}}>Last edit : Elecar Sabinay - 12-23-23 </Typography> */}
                           </Grid>
                        </Grid>
                    <Grid xs={6} md={6} lg={6}>
                        <Box component="form" noValidate autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                        }}>
                            <DatePicker label="Date Issued" onChange={(e)=>handleOnChangeInput("dateIssued",e)} value={moment(input.dateIssued)}/>
                            <Autocomplete
                                disablePortal
                                id="buyerssId"
                                options={inputBuyer}
                                clearOnEscape 
                                onChange={(e,v)=>handleOnChangeInput("buyer",e,v)}
                                getOptionLabel={(option) => option.buyer}
                                sx={{ width: 250 }}
                                value={input?.buyer}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                renderInput={(params) => <TextField {...params} label="Buyer" />}
                                />
                            <TextField onChange={(e)=>handleOnChangeInput("poNumber",e)} value={input.poNumber || ''} fullWidth label="PO Number" variant="outlined" />
                            <DatePicker label="Ship Date" onChange={(e)=>handleOnChangeInput("shipDate",e)} value={moment(input.shipDate)}/>    
                        </Box>
                    </Grid>
                    <Grid xs={6} md={6} lg={6}>
                        <Box component="form" noValidate autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                            '& .MuiButton-root': { m: 1, width: '40ch' },
                        }}>
                                <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={inputStatus}
                                getOptionLabel={(option) => option.status}
                                value={input?.status}
                                onChange={(e,v)=>handleOnChangeInput("status",e,v)}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                sx={{ width: 250 }}
                                renderInput={(params) => <TextField {...params} label="Status" />}
                                />
                                 <Autocomplete
                                multiple
                                id="checkboxes-tags-demo"
                                options={inputDepartment}
                                disableCloseOnSelect
                                value={input?.reqAttDepts}
                                getOptionLabel={(option) => option.department}
                                onChange={(e,v)=>handleOnChangeInput("reqAttDepts",e,v)}
                                isOptionEqualToValue={(option, value) => value === undefined || option?._id?.toString() === (value?._id ?? value)?.toString()}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option.department}
                                    </li>
                                )}
                                style={{ width: 500 }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Require Attention" placeholder="Favorites" />
                                )}
                                />

                                <TextField
                                        id="outlined-multiline-static"
                                        label="Remark"
                                        value={input.remarks || ''}
                                        multiline
                                        onChange={(e)=>handleOnChangeInput("remarks",e)}
                                        rows={3}
                                        />

                                <Button variant="contained" color="primary" size="large" fullWidth onClick={handleSaveByAM}  > Save Changes </Button>
                            </Box>
                        </Grid>



                    </Grid>
                </Paper>
                </Grid>
                
                <Grid xs={6} md={4} lg={4} justifyContent="center">  
                <Paper elevation={6}>
                    
                    <Grid xs={6} md={6} lg={6}>
                        <Box component="form" noValidate autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                            '& .MuiButton-root': { m: 1, width: '40ch' }
                        }}>
                            <Typography variant="h5" sx={{mb:2}}> Logistics </Typography>
                            <DatePicker label="Required Ship Date" onChange={(e)=>handleOnChangeInput("logRequiredShipDate",e)} value={input.logRequiredShipDate ? moment(input.logRequiredShipDate) : null} />
                            <DatePicker label="Requested Ship Date" onChange={(e)=>handleOnChangeInput("logRequestedShipDate",e)} value={input.logRequestedShipDate ? moment(input.logRequestedShipDate) : null} /> 
                            <Button variant="contained" color="primary" size="large" fullWidth onClick={handleSaveByLogistics}  > Save Changes </Button>
                        </Box>
                    </Grid>
                </Paper>
                </Grid>
            </Grid>
                </AccordionDetails>
            </Accordion>
            </div>
            <div>
                {!!snackbar && (
                    <Snackbar
                        open
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        onClose={handleCloseSnackbar}
                        autoHideDuration={4000}
                    > 
                        <Alert {...snackbar} onClose={handleCloseSnackbar} variant="filled" />
                    </Snackbar>
                )}
                    {/* <Grid container spacing={5} alignItems="center" justifyContent="center">
                        <Grid sm={6} md={6} lg={6}>
                            <Stepper/>
                        </Grid>
                    </Grid> */}

                {/* <POGrid/> */}
            </div>
        </Box>
    )
}

export default PODetails;