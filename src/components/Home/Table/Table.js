import React,{useState,useEffect} from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box,Button,Autocomplete,TextField,Link,Chip,Tooltip,Typography,Pagination,PaginationItem,Stack} from '@mui/material';
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
import { onSpaceOrEnter } from '@mui/x-date-pickers/internals';


function useQuery(){
  return new URLSearchParams(useLocation().search);
}


export default function StickyHeadTable() {

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
    setSearchInput({
      ...searchInput,
      [name]: name === 'option' ? val?.id : (e.target.value).replace(/ /g, '')
    });
  }

  const onSearchEnter = (e) => {
    if(e.keyCode === 13 && (searchInput.option != undefined || searchInput.option != null)){
      setRows([]);
        dispatch(getPOBySearch(searchInput));
        navigate(`/purchase-orders/search?option=${searchInput.option}&value=${searchInput.search}`);
    }
  }

  const handleSavePO = () =>{
    // trappings
    //alert(JSON.stringify(input));
    dispatch(createPO(input,navigate));
    handleCloseDialog();
  }

  //autocomplete
  //const buyerListSelection = [];

  useEffect(()=>{
    dispatch(getBuyers());
    dispatch(getStatus());
    dispatch(getPOs(queryPage));
   // navigate(`/purchase-orders?page=${queryPage}`);
   // alert(`${searchOption} => ${searchValue}`)
  },[dispatch,queryPage]);

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
    if(!isLoading && purchaseOrders?.length > 0 && buyers?.length > 0 && status?.length > 0){

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
    navigate(`/purchase-orders?page=${newPage}`);
  }

  // dialog
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  // dialog

  const searchOptions = [
    {id: 'poNumber', label: 'PO #', year: 1994 },
    {id: 'dateIssued', label: 'Date Issued', year: 1972 },
    {id: 'buyer', label: 'Buyer', year: 1974 },
    {id: 'shipDate', label: 'Ship Date', year: 1974 },
    {id: 'status', label: 'Status', year: 1974 },
    {id: 'reqAttDepts', label: 'Require Attention', year: 1974 },
  ];

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
                        options={searchOptions}
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
                      <TextField id="outlined-basic" onKeyDown={(e)=>onSearchEnter(e)} onChange={(e,v)=>handleOnChangeSearchInput("search",e,v)} label="Input Search Value" variant="outlined"  xs={{width:1500}} />
                    </Tooltip>
                </Grid>
            </Grid>

        <Grid md={1} lg={1}> 
        <Button variant="contained" size="small" color="error" onClick={()=>{}} startIcon={<Search/>}>Clear</Button>
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
              { !searchValue && queryPage && <Stack spacing={2}>
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
              </Stack>}
                </Grid>
              </Grid>
              <Grid xs={12} md={1} lg={1}>
            </Grid>
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
                  <DatePicker label="Date Issued" id="dateIssued" onChange={(e)=>handleOnChangeInput("dateIssued",e)} defaultValue={moment()} />
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
                  <DatePicker label="Ship Date" id="shipDate" onChange={(e)=>handleOnChangeInput("shipDate",e)} defaultValue={moment()} />
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