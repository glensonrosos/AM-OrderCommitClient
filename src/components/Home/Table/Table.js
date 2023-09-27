import React,{useState,useEffect} from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box,Button,Snackbar,Alert,Autocomplete,TextField,Link,Chip,Tooltip,Typography,Pagination,PaginationItem,Stack} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import {Add,Search} from '@mui/icons-material';


import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import DeptBadge from './DeptBadge/DeptBadge'

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import {useNavigate,useLocation} from 'react-router-dom';

import {useDispatch,useSelector} from 'react-redux'
import {getBuyers} from '../../../actions/buyers';
import {getStatus} from '../../../actions/status';
import {createPO,getPOs,getPOBySearch} from '../../../actions/purchaseOrders';
import {AUTH_LOGOUT} from '../../../constant/actionTypes'


function useQuery(){
  return new URLSearchParams(useLocation().search);
}

export default function StickyHeadTable() {

  const user = JSON.parse(localStorage.getItem('profile'));

  const dispatch = useDispatch();
  const {buyers} = useSelector(state=> state.buyers);
  const {status} = useSelector(state=> state.status);
  const {isLoading,purchaseOrders,numberOfPages} = useSelector(state=> state.purchaseOrders);
  const navigate = useNavigate();

  const query = useQuery();
  const queryPage = query.get('page') || 1;
  const searchOption = query.get('option');
  const searchValue = query.get('value');
  

  const [input,setInput] = useState({
    poNumber:"",
    dateIssued:moment(),
    buyer:"",
    shipDate:moment(),
  });

  const [searchInput,setSearchInput] = useState({
      search:'',
      option:null
  });

  const handleOnChangeInput = (name,e,val=null) =>{

    if(name === "dateIssued" || name === "shipDate"){
      setInput({
        ...input,
        [name]: e
      });
      return;
    }
    setInput({
      ...input,
      [name]: name === 'buyer' ? val : e.target.value
    });

  }

  const handleOnChangeSearchInput = (name,e,val=null) =>{
    // remove all spaces trim
    console.log(val?.id);
    setSearchInput({
      ...searchInput,
      // [name]: name === 'option' ? val?.id : (e.target.value).replace(/ /g, '')
      [name]: name === 'option' ? {id:val?.id,label:val?.label} : e.target.value
    });
  }

  const onSearchEnter = (e) => {
    if(e.keyCode === 13 && (searchInput.option != undefined || searchInput.option != null)){
      // set trapping here...

      let flag = true;

      switch(searchInput?.option?.id){
        case 'poNumber':
        case 'buyer':
        case 'status':
          {
            const regexPattern = /^(?=.{1,15}$)[a-zA-Z0-9]*-?[a-zA-Z0-9\s]*$|^(?=.{1,15}$)[a-zA-Z0-9]*$/;
            if(regexPattern.test(searchInput.search)) {
              console.log(`${searchInput.search} buy status PO is a valid string.`);
            } else {
              console.log(`${searchInput.search} buy status PO is not a valid string.`);
              setSnackbar({ children: `In ${searchInput?.option?.label}, Search Inputed is Invalid`, severity: 'error' });
              flag = false;
            }
          } break;
        case 'dateIssued':
        case 'shipDate':
          {
            const regexPattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19\d\d|20\d\d)(-(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19\d\d|20\d\d))?$/;

            if(regexPattern.test(searchInput.search)) {
              console.log(`${searchInput.search} DATE is a valid string.`);
            } else {
              console.log(`${searchInput.search} DATE is not a valid string.`);
              setSnackbar({ children: `In ${searchInput?.option?.label}, Search Inputed is Invalid`, severity: 'error' });
              flag = false;
            } 
          }break;
        case 'reqAttDepts':
          {
            const regexPattern = /^[a-zA-Z,-]{0,50}$/;;

            if(regexPattern.test(searchInput.search)) {
              console.log(`${searchInput.search} Department is a valid string.`);
            } else {
              console.log(`${searchInput.search} Department is not a valid string.`);
              setSnackbar({ children: `In ${searchInput?.option?.label}, Search Inputed is Invalid`, severity: 'error' });
              flag = false;
            } 
          }break;
        default:
          return;
      }

      if(flag){
        setRows([]);
        dispatch(getPOBySearch({search: searchInput.search.trim().replace(/\s+/g, ' '),option: searchInput?.option?.id,page:1}));
        navigate(`/purchase-orders/search?option=${searchInput?.option?.id}&value=${searchInput.search}&page=1`);
        setRows([]);
      }
    }
  }

  const handleSavePO = () =>{
    // trappings
    // input po number 
    let flag = true;
    const regexPattern = /^(?=.{1,15}$)[a-zA-Z0-9]*-?[a-zA-Z0-9\s]*$|^(?=.{1,15}$)[a-zA-Z0-9]*$/;
    if(regexPattern.test(input?.poNumber)) {
      console.log(`${input?.poNumber} buy status PO is a valid string.`);
    } else {
      console.log(`${input.poNumber} buy status PO is not a valid string.`);
      setSnackbar({ children: `PO Number inputed is invalid, `, severity: 'error' });
      flag = false;
    }
    // buyer
    const findBuyer = buyers.find(buy => buy === input.buyer);
    if(findBuyer === undefined || findBuyer === null){
      console.log(`${input.buyer} buyer is not a valid string.`);
      setSnackbar({ children: `Buyer inputed is invalid`, severity: 'error' });
      flag = false;
    }
    
    // date cannot be back to history and empty
    const compDateIssued = moment(input.dateIssued).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
    if(!compDateIssued){
      console.log(`${input.dateIssued} date is invalid.`);
      setSnackbar({ children: `DateIssued Inputed is Invalid`, severity: 'error' });
      flag = false;
    }
    const compShipDate = moment(input.shipDate).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
    if(!compShipDate){
      console.log(`${input.dateIssued} date is invalid.`);
      setSnackbar({ children: `ShipDate Inputed is Invalid`, severity: 'error' });
      flag = false;
    }
    
    const user = JSON.parse(localStorage.getItem('profile'));

    const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
    

    if(flag){ 
      dispatch(createPO({...input,poNumber:input.poNumber.toUpperCase(),editedBy:newUser},navigate));
      handleCloseDialog();  
    }

  }

  //autocomplete
  //const buyerListSelection = [];

  useEffect(()=>{

    const user = JSON.parse(localStorage.getItem('profile'));
    if(!user)
      navigate('/login');

    dispatch(getBuyers());
    dispatch(getStatus());

      if(searchOption !== null && searchValue !== null){
        // populate search inputs
        setSearchInput({
          ...searchInput,
          option :  searchOptions.find(so => searchOption === so.id),
          search: searchValue
        });
        // dispatch search here..
        dispatch(getPOBySearch({option:searchOption,search:searchValue,page:queryPage}));
    }else{
      dispatch(getPOs(queryPage));
      navigate(`/purchase-orders?page=${queryPage}`);
    }

   // alert(`${searchOption} => ${searchValue}`)
  },[dispatch,queryPage,searchOption,queryPage]);

  // CALL EVERY 30 SECONDS
  useEffect(() => {
    const intervalId = setInterval(() => {
        dispatch(getPOs(queryPage));
        console.log('called getPOs table');
    }, 180000); // 3 minutes
    return () => clearInterval(intervalId);
}, [dispatch]);


  const searchOptions = [
    {id: 'poNumber', label: 'PO #'},
    {id: 'dateIssued', label: 'Date Issued'},
    {id: 'buyer', label: 'Buyer'},
    {id: 'shipDate', label: 'Ship Date'},
    {id: 'status', label: 'Status'},
    {id: 'reqAttDepts', label: 'Require Attention'},
  ];


  const columns = [
    { id: 'ponumber', label: 'PO Number', minWidth: 170 },
    { id: 'dateissued', label: 'Date Issued', minWidth: 100 },
    { id: 'buyer', label: 'Buyer', minWidth: 100 },
    { id: 'shipdate', label: 'Ship Date', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'requireatt', label: 'Require Attention', minWidth: 100 },
    
  ];
  
  function createData(ponumber, dateissued, buyer, shipdate,status,requireatt) {
    return { ponumber, dateissued, buyer, shipdate, status,requireatt };
  }

  const [rows,setRows] = useState([]);
  const rowsData=[];

  useEffect(()=>{

    const user = JSON.parse(localStorage.getItem('profile'));
    if(!user)
      navigate('/login');
  
    if(!isLoading && purchaseOrders?.length > 0 && buyers?.length > 0 && status?.length > 0){
      setRows([]);
      purchaseOrders?.map(po=>{

      let reqDepartments = '';  
      if(po?.reqAttDepts?.length > 0){
        reqDepartments = po?.reqAttDepts.map(dept=> dept.department).join(', ');
      }
      
      const link = `/../purchase-order-detail/${po._id}`;

      rowsData.push(createData(
        <Link variant="p" href={link}>{po?.poNumber}</Link>, 
        moment(po?.dateIssued).format('L'), po?.buyer?.buyer, 
        moment(po?.shipDate).format('L'),
        <Chip label={po?.status?.status} color={po?.status.color} size="large" />,
        po?.reqAttDepts.length > 0 ? reqDepartments : 'NA'));

        return null;
      });

      //alert(JSON.stringify(purchaseOrders));

      setRows([...rowsData]);
    }    
  },[purchaseOrders,isLoading,buyers,status])
     
  
  const [page, setPage] = React.useState(queryPage);

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(+event.target.value);
  //  // setPage(1);
  // };

  const handleChangePage = (newPage) =>{
    //alert('called');
    if(searchOption === null)
      navigate(`/purchase-orders?page=${newPage}`);
    else
      navigate(`/purchase-orders/search?option=${searchOption}&value=${searchValue}&page=${newPage}`);
  }

  const handleSearchClear = () =>{
    setSearchInput({
      option: {id: '', label: ''},
      search:''
    });
    navigate(`/purchase-orders?page=1`);
  }

  // dialog
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    if(user?.result?.department?.department === 'AM'){
      setOpenDialog(true);
    }else{
      setSnackbar({ children: `Only AM Dept. allow to add PO`, severity: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  // dialog

  // SNACKBAR
  const [snackbar, setSnackbar] = useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  return ( 
    <>
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
    </Backdrop>

    <Box mt={5}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid xs={6} md={5} lg={5}>
                <DeptBadge/>
                <Box mt={3}/>
                <Button variant="contained" size="large" color="secondary" onClick={handleOpenDialog} startIcon={<Add/>}>Add Purchase Order</Button>
            </Grid>
            <Grid xs={6} md={5} lg={5} direction="row">
                <Grid container rowSpacing={3} direction="row" justifyContent="end" alignItems="end">
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        getOptionLabel={(option) => option.label || ""}
                        options={searchOptions}
                        value={searchInput?.option}
                        sx={{ width: 250 }}
                        onChange={(e,v)=>handleOnChangeSearchInput("option",e,v)}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        renderInput={(params) => <TextField {...params} label="Search By" />}
                    />
                    <Box ml={2}></Box>
                    <Tooltip 
                    title={
                      <>
                        <Typography color="inherit">Date Range Ex:
                        <span style={{color:'#fab1a0'}} > 08/02/1984-08/02/2023 </span>
                        </Typography>
                        <Typography color="inherit"> Single Date Ex: 
                        <span style={{color:'#fab1a0'}} > 08/02/1984 </span> 
                        </Typography>
                        
                        <Typography color="inherit"> Require Attention Ex:  
                        <span style={{color:'#fab1a0'}} > AM , PD </span>
                        </Typography>
                      </>
                    }
                    placement="bottom"
                    >
                      <TextField id="outlined-basic" onKeyDown={(e)=>onSearchEnter(e)} onChange={(e,v)=>handleOnChangeSearchInput("search",e,v)} value={searchInput.search} label="Input Search Value" variant="outlined"  xs={{width:1500}} />
                    </Tooltip>
                </Grid>
            </Grid>

        <Grid md={1} lg={1}> 
        <Button variant="contained" size="small" color="error" onClick={handleSearchClear} startIcon={<Search/>}>Clear</Button>
        </Grid>
        <Grid xs={11} md={11} lg={11}>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                    {columns.map((column) => (
                        <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                        >
                        {column.label}
                        </TableCell>
                    ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows
                    .map((row,i) => {
                        return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                            {columns.map((column) => {
                            const value = row[column.id];
                            return (
                                <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number'
                                    ? column.format(value)
                                    : value}
                                </TableCell>
                            );
                            })}
                        </TableRow>
                        );
                    })}
                </TableBody>
                </Table>
            </TableContainer>
            </Paper>
            <Grid container spacing={2} alignItems="end" justifyContent="end">
              <Grid xs={12} md={11} lg={11}>
                <Box sx={{mt:3}}> </Box>
              <Stack spacing={2}>
                <Pagination 
                  count={numberOfPages} 
                  page={Number(queryPage) || 1}
                  variant="outlined" 
                  shape="rounded" 
                  color="secondary"
                  renderItem={(item)=>(
                    <PaginationItem 
                      { ...item }
                      component={Button}
                      onClick={()=>handleChangePage(item.page)}
                    />
                  )}
                  />
              </Stack>
                </Grid>
              </Grid>
              <Grid xs={12} md={1} lg={1}>
            </Grid>
            {!!snackbar && (
              <Snackbar
                open
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
              > 
                <Alert {...snackbar} onClose={handleCloseSnackbar} variant="filled" />
              </Snackbar>
            )}
        </Grid>
        </Grid>
            {/* dialog box */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add Purchase Order</DialogTitle>
            <DialogContent>
               {/* <Grid container spacing={2} justifyContent="center" alignItems="center">
                 <Grid sm={12} md={12} lg={12} > */}
                 <Box component="form" noValidate autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '50ch' },
                        }}>
                  <TextField id="poNumber" label="PO Number" onChange={(e)=>handleOnChangeInput("poNumber",e)} variant="outlined" fullWidth/>
                  <DatePicker label="Date Issued" maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} id="dateIssued" onChange={(e)=>handleOnChangeInput("dateIssued",e)} defaultValue={moment()} />
                    <Autocomplete
                    disablePortal
                    id="buyer"
                    options={buyers}
                    clearOnEscape 
                    onChange={(e,v)=>handleOnChangeInput("buyer",e,v)}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    getOptionLabel={(option) => option.buyer}
                    sx={{ width: 250 }}
                    renderInput={(params) => <TextField {...params} label="Buyer" />}
                    />
                  <DatePicker label="Ship Date" id="shipDate" maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInput("shipDate",e)} defaultValue={moment()} />
                  </Box>
                  {/* </Grid>
               </Grid> */}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained" color="warning">Cancel</Button>
              <Button onClick={handleSavePO} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
    </Box>
    </>
  );
}