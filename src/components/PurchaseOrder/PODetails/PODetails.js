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
import {getPO,updatePOByAm,updatePOByLogistics,getPONoLoading} from '../../../actions/purchaseOrders';
import {getCountOrderItemStatusOpen} from '../../../actions/orderitems';
import {getBuyers} from '../../../actions/buyers';
import {getDepartments} from '../../../actions/departments';
import {getStatus} from '../../../actions/status';



const PODetails = () =>{
    const {id} = useParams();

    const dispatch = useDispatch();

    const user = JSON.parse(localStorage.getItem('profile'));

    const {purchaseOrders,isLoading} = useSelector(state=> state.purchaseOrders); 
    const {buyers,isLoading:buyerLoading} = useSelector(state=> state.buyers);
    const {isLoading:orderItemLoading,departmentStatus} = useSelector(state=> state.orderItems);
    const {departments,isLoading:departmentLoading} = useSelector(state=> state.departments);
    const {status,isLoading:statusLoading} = useSelector(state=> state.status);


    useEffect(()=>{
        dispatch(getBuyers());
        dispatch(getDepartments());
        dispatch(getStatus());
        dispatch(getPO(id));
        dispatch(getCountOrderItemStatusOpen(id));
   },[dispatch]);


    // load that will not using loading ui
    useEffect(() => {
    // Create an interval that reloads the page every 30 seconds
    const intervalId = setInterval(() => {
        dispatch(getPONoLoading(id));
        dispatch(getCountOrderItemStatusOpen(id));
        console.log('page po details reload');
    }, 180000); // 3 minutes
    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
    }, [dispatch]);

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
    const [userEdited, setUserEdited] = useState({
        name:null,
        date:null,
        logisticsName:null,
        logisticsDate:null
    });
    const[currentDepartmentStatus,setCurrentDepartmentStatus] = useState(null);

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
            setUserEdited({
                ...userEdited,
                name: po.editedBy,
                date: po.updatedAt,
                logisticsName:po.logCom.editedBy,
                logisticsDate:po.logCom.updatedAt
            })

            setInputBuyer(buyers);
            setInputDepartment(departments);
            setInputStatus(status);
            
        }
    },[purchaseOrders]);

    useEffect(() => {
        if(departmentStatus?.department && !orderItemLoading ){
            setCurrentDepartmentStatus(departmentStatus?.department);
        }
    }, [departmentStatus,orderItemLoading]);


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

        if(user?.result?.department?.department !== 'AM'){
            setSnackbar({ children: `This section is only for AM Dept`, severity: 'error' });
            return;
        }


        const {dateIssued,buyer,poNumber,shipDate,reqAttDepts,status,remarks} = input;

         // trappings
        // input po number 
        let flag = true;

        const regexPattern = /^(?=.{1,15}$)[a-zA-Z0-9]*-?[a-zA-Z0-9\s]*$|^(?=.{1,15}$)[a-zA-Z0-9]*$/;
        if(!regexPattern.test(poNumber)) {
            console.log(`${poNumber} PO is not a valid string.`);
            setSnackbar({ children: `PO Number inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        // buyer I STOP HERE
        const findBuyer = inputBuyer.find(buy => buy?._id === buyer?._id);
        if(findBuyer === undefined || findBuyer === null){
            console.log(`${buyer} buyer is not a valid string.`);
            console.log(`${buyer} good`);
            setSnackbar({ children: `Buyer inputed is invalid`, severity: 'error' });
            flag = false;
        }
        // status I STOP HERE
        const findStatus = inputStatus.find(sta => sta?._id === status?._id);
        if(findStatus === undefined || findStatus === null){
            console.log(`${findStatus} status is not a valid string.`);
            setSnackbar({ children: `Status inputed is invalid`, severity: 'error' });
            flag = false;
        }

        // date cannot be back to history and empty
        const compDateIssued = moment(dateIssued).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
        if(!compDateIssued){
            console.log(`${dateIssued} date is invalid.`);
            setSnackbar({ children: `DateIssued Inputed is Invalid`, severity: 'error' });
            flag = false;
        }
        const compShipDate = moment(shipDate).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
        if(!compShipDate){
            console.log(`${dateIssued} date is invalid.`);
            setSnackbar({ children: `ShipDate Inputed is Invalid`, severity: 'error' });
            flag = false;
        }

        // departments
         // all set for department
        

        // remarks
        const maxLength = 300;
        const regex = new RegExp(`^[\\s\\S]{0,${maxLength}}$`);
        if(!regex.test(remarks)){
            console.log(`${remarks} remarks is not a valid string.`);
            setSnackbar({ children: ` remarks inputed is invalid, limit only 300 letters`, severity: 'error' });
            flag = false;
        }

        //alert(`${user?.result?.firstname} => ${moment().toDate()}`);
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;

        if(flag){
            dispatch(updatePOByAm(purchaseOrders[0]?._id,{dateIssued,buyer,poNumber:poNumber.toUpperCase(),shipDate,status,
                reqAttDepts,remarks,editedBy:newUser}));
            processRowUpdate()
        }
    }

    const handleSaveByLogistics = async () =>{
        const currentStatus = purchaseOrders[0].status.status;
        if(currentStatus !== 'OPEN'){
            setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
            return;
        }

        const comDepartment = user?.result?.department?.department;
        if(comDepartment !== 'LOGISTICS' && comDepartment !== 'AM'){
            setSnackbar({ children: `This section is only for LOGISTICS Dept`, severity: 'error' });
            return;
        }

        const {logRequiredShipDate, logRequestedShipDate} = input;

         // date cannot be back to history and empty
        let flag = true;

        if(logRequiredShipDate != null){
            const compLogRequiredShipDate= moment(logRequiredShipDate).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
            if(!compLogRequiredShipDate){
                console.log(`${logRequiredShipDate} date is invalid.`);
                setSnackbar({ children: `Required ShipDate Inputed is Invalid`, severity: 'error' });
                flag = false;
            }
        }
        
        if(logRequestedShipDate != null){
            const compLogRequestedShipDate = moment(logRequestedShipDate).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
            if(!compLogRequestedShipDate){
                console.log(`${logRequestedShipDate} date is invalid.`);
                setSnackbar({ children: `Requested ShipDate Inputed is Invalid`, severity: 'error' });
                flag = false;
            }
        }

        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;

        if(flag){
            await dispatch(updatePOByLogistics(purchaseOrders[0]?._id,{logRequiredShipDate,logRequestedShipDate,editedBy:newUser}));
            processRowUpdate()
            await dispatch(getCountOrderItemStatusOpen(id));
        }

        //TO DO
        // check dept status from order item if logs
        // 
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
                           </Grid>
                        </Grid>
                    <Grid xs={6} md={6} lg={6}>
                        <Box component="form" noValidate autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                        }}>
                            <DatePicker label="Date Issued" maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInput("dateIssued",e)} value={moment(input.dateIssued)}/>
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
                            <DatePicker label="Ship Date" maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInput("shipDate",e)} value={moment(input.shipDate)}/>

                           {userEdited.name &&
                            <Grid sx={{mt:3}}>
                                <Typography variant="p" color="error">Last edit : {userEdited.name} - {moment(userEdited.date).fromNow()} </Typography>
                            </Grid>
                            }
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
                            <DatePicker label="Required Ship Date" readOnly value={input.logRequiredShipDate ? moment(input.logRequiredShipDate) : null} />
                            <DatePicker label="Requested Ship Date" maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInput("logRequestedShipDate",e)} value={input.logRequestedShipDate ? moment(input.logRequestedShipDate) : null} /> 
                            <Button variant="contained" color="primary" size="large" fullWidth onClick={handleSaveByLogistics}  > Save Changes </Button>
                            { userEdited?.logisticsName &&
                            <Grid sx={{mt:3}}>
                                <Typography variant="p" color="error">Last edit : {userEdited.logisticsName} - {moment(userEdited.logisticsDate).fromNow()} </Typography>
                            </Grid>
                            }
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
            </div>
        </Box>
    )
}

export default PODetails;