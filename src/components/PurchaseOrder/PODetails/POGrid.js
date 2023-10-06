import React,{useState,useEffect} from 'react';
import { DataGrid,GridToolbarExport,GridToolbarContainer } from '@mui/x-data-grid';
import {Snackbar,Alert,Button,Box,Tooltip,Switch,ImageList,Stack,Backdrop,CircularProgress, Typography,Select,MenuItem} from '@mui/material';
import {Delete,Image,Add} from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';

// xlsx
import * as XLSX from 'xlsx';

import { useParams } from 'react-router';
import moment from 'moment';
import FileBase64 from 'react-file-base64';
import {triggerBase64Download} from 'react-base64-downloader';

import { useDispatch,useSelector } from 'react-redux';
import { getOrderItems,getOrderItemsNoLoading,createOrderItem,updateCellOrderItem,getCountOrderItemStatusOpen,deleteOrderItem,getOrderItemImage } from '../../../actions/orderitems';
import {updateCellEditedBy,updatePOByAuto} from '../../../actions/purchaseOrders';
import NoImage from '../../images/NoImage.jpeg'

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText'


export default function ServerSidePersistence() {
  //const mutateRow = useFakeMutation();

  const user = JSON.parse(localStorage.getItem('profile'));

  const [snackbar, setSnackbar] = React.useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);
  const [rows,setRows] = useState([]);

  const {id} = useParams();

  const dispatch = useDispatch();
  // I STOP HERE... department status
  const {isLoading,orderItems,departmentStatus} = useSelector(state=> state.orderItems);
  const {purchaseOrders} = useSelector(state => state.purchaseOrders);
  const [dataGridLoading,setDataGridLoading] = useState(false);


  const [openDialog, setOpenDialog] = useState(false);
  const [currentStatus,setCurrentStatus] = useState(null);
  const [currentPO,setCurrentPO] = useState(null);
  const [currentReqAttDepts, setCurrentReqAttDepts] = useState(null);
  const [currentDeptOpenStatus, setCurrentDeptOpenStatus] = useState(null);
  const [currentLogsDate,setCurrentLogsDate] = useState(null);
  
  const [imageData,setImageData] = useState({
      rowSelected:null,
      image: NoImage
  });

  // IMAGE UPLOAD 
  useEffect(() => {
    if(!isLoading && orderItems.length > 0 && imageData.rowSelected?._id){
      const selected = orderItems?.find(oi => oi._id === imageData?.rowSelected?._id);
      setImageData({
        ...imageData,
        image: selected?.image ?? NoImage
      });
      setOpenDialog(true);
      setDataGridLoading(false);
      setCurrentDeptOpenStatus(departmentStatus);
    }
  }, [isLoading,orderItems])

  const handleOpenDialog = (rowSelected) => {
      setDataGridLoading(true);
      dispatch(getOrderItemImage(rowSelected?._id));

      setImageData({
        rowSelected,
      });
  };
  const handleCloseDialog = () => {
    setImageData({
      itemCode:null,
      image: NoImage
    })
    setOpenDialog(false);
  };

  const headerLastEdit = (name,title) =>{

    const po = purchaseOrders?.find(po => po._id === id);
    let dept=null;

    if(name === 'AM')
      dept = po?.amCom;
    if(name === 'PD')
      dept = po?.pdCom;
    if(name === 'PU')
      dept = po?.puCom;
    if(name === 'PROD')
      dept = po?.prodCom;
    if(name === 'QA')
      dept = po?.qaCom;
          
    return (
      <Tooltip 
      title={
          <Typography color="inherit">
          <span style={{color:'#fab1a0'}}>
            Last edit : {dept?.editedBy || 'NA'} - {moment(dept?.updatedAt).fromNow()}
          </span>
          </Typography>
        }
        placement="bottom">     
          <Typography>{title}</Typography>
      </Tooltip>
    )
  }

  const columnGroupingModel = [
    {
      groupId: 'Order Details',
      headerAlign:"center",
      description:'',
      renderHeaderGroup: (params) => headerLastEdit('AM','Order Details'),
      children: [
        { field: 'itemCode'},
        { field: 'image'},
        { field: 'description'},
        { field: 'qty'},
        { field: 'firstOrder'},
      ],
    },
    {
      groupId: 'PD Commitment',
      headerAlign:"center",
      description: '',
      renderHeaderGroup: (params) => headerLastEdit('PD','PD Commitment'),
      children: [
        { field: 'patternReleasing'},
        { field: 'productSpecs'},
        { field: 'packagingSpecs'},
        { field: 'pdMoldAvailability'}, // glenson added updates
        { field: 'pdSampleReference'}, //
      ],
    },
    {
      groupId: 'Purchasing Commited Dates',
      headerAlign:"center",
      description: '',
      renderHeaderGroup: (params) => headerLastEdit('PU','Purchasing Commitment'),
      children: [
        { field: 'firstCarcass'},
        { field: 'completionCarcass'},
        { field: 'firstArtwork'},
        { field: 'completionArtwork'},
        { field: 'firstPackagingMaterial'},
        { field: 'completionPackagingMaterial'},
        { field: 'puMoldAvailability'},
      ],
    },
    {
      groupId: 'Production Requested Delivery Dates',
      headerAlign:"center",
      description: 'Production Requested Delivery Dates',
      renderHeaderGroup: (params) => headerLastEdit('PROD','Production Requested Delivery Dates'),
      children: [
        { field: 'carcass'},
        { field: 'artwork'},
        { field: 'packagingMaterial'},
        { field: 'crd'},
      ],
    },
    {
      groupId: 'QA Commitment',
      headerAlign:"center",
      description: 'QA Commitment',
      renderHeaderGroup: (params) => headerLastEdit('QA','QA Commitment'),
      children: [
        { field: 'poptDate'},
        { field: 'qaSampleReference'},
        { field: 'psiDate'}
      ],
    }
  ];

  const handleUploadImage = async () =>{

    const comDepartment = user?.result?.department?.department;
    if(comDepartment !== 'AM'){
        setSnackbar({ children: `Only AM Dept are allow to Upload Image`, severity: 'error' });
        return;
    }

    if(currentStatus !== 'OPEN'){
      setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
      return;
    }

    if(imageData?.image === NoImage || imageData?.image === imageData.rowSelected.image ){
      alert('no image attached');
    }else{

      // AMCOM
      const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
      const edit = {
        amCom:{
          editedBy: newUser,
          updatedAt: moment(),
        }
      }
      await dispatch(updateCellEditedBy(id,{edit}));

      //
      await dispatch(updateCellOrderItem(imageData.rowSelected._id,{image:imageData.image}));

      dispatch(getCountOrderItemStatusOpen(id));

      setSnackbar({ children: 'Successfully uploaded image', severity: 'success' });
      handleCloseDialog();
    }
  }

  const [toBeDeleteRow,setToBeDeleteRow] = useState({
      rowSelected:null,
  });
  const [openDialogDeleteRow, setOpenDialogDeleteRow] = useState(false);
  const handleOpenDialogDeleteRow = (rowSelected) => {
    
    setToBeDeleteRow({rowSelected});
    setOpenDialogDeleteRow(true);
  };
  const handleCloseDialogDeleteRow = () => {
    setToBeDeleteRow({rowSelected:null});
    setOpenDialogDeleteRow(false);
  };

  const handleDeleteRow = async () =>{

    const comDepartment = user?.result?.department?.department;
    if(comDepartment !== 'AM'){
        setSnackbar({ children: `Only AM Dept are allow to Delete Row`, severity: 'error' });
        handleCloseDialogDeleteRow();
        return;
    }
    // AMCOM
    const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
    const edit = {
      amCom:{
        editedBy: newUser,
        updatedAt: moment(),
      }
    }
    await dispatch(updateCellEditedBy(id,{edit}));
    //
    await dispatch(deleteOrderItem(toBeDeleteRow?.rowSelected?._id));
    setSnackbar({ children: 'Successfully uploaded image', severity: 'success' });
    handleCloseDialogDeleteRow();
  }

  const RenderFirstOrder = (newRow) => {
  
    const [checked, setChecked] = React.useState(newRow.firstOrder);

    const handleChange = (e) => {

      const comDepartment = user?.result?.department?.department;
      if(comDepartment !== 'AM'){
          setSnackbar({ children: `Only AM Dept are allow to edit 1st Order`, severity: 'error' });
          return;
      }

      if(currentStatus !== 'OPEN'){
        setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
        return;
      }

      setChecked(e.target.checked);
      newRow.firstOrder = e.target.checked;
      // AMCOM
      const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
      const edit = {
        amCom:{
          editedBy: newUser,
          updatedAt: moment(),
        }
      }
     
      const executeAwait = async () =>{
        await dispatch(updateCellEditedBy(id,{edit}));
        await dispatch(updateCellOrderItem(newRow?.id,newRow));
        await dispatch(getCountOrderItemStatusOpen(id));    
      }
      executeAwait();

      setSnackbar({ children: 'Successfully update cell', severity: 'success' });
    };
  
    return(    
      <Switch
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'controlled' }}
      />
    )  
  }

  

  const exportToExcel = () => {

    setDataGridLoading(true);

    console.log(currentPO);

    const data = {
      columns: [
        { field: 'poNumber', header: 'Po Number' },
        { field: 'buyer', header: 'Buyer' },
        { field: 'dateIssued', header: 'Date Issued', type: 'date' },
        { field: 'shipDate', header: 'Ship Date',type: 'date' },
        { field: 'requestedShipDate', header: 'LOGS Requested Ship Date',type: 'date'},
      ],
      rows: [
        {
          ...currentPO,
          buyer: currentPO.buyer.buyer,
          shipDate: moment(currentPO.shipDate).format('L'),
          dateIssued: moment(currentPO.dateIssued).format('L'),
          requiredShipDate: moment(currentPO.logCom.requiredShipDate).format('L'),
          requestedShipDate: moment(currentPO.logCom.requestedShipDate).format('L')
        }
      ],
    };

    const data2 = {
      columns: [
        { field: 'itemCode', header: 'Item Code' },
        { field: 'description', header: 'Description' },
        { field: 'qty', header: 'Qty' },
        { field: 'firstOrder', header: 'First Order' },
        { field: 'patternReleasing', header: 'PD Pattern Releasing', type: 'date'},
        { field: 'productSpecs', header: 'PD Product Specs', type: 'date'},
        { field: 'packagingSpecs', header: 'PD Packaging Specs', type: 'date'},
        { field: 'pdMoldAvailability', header: 'PD Mold Availability', type: 'date'},
        { field: 'pdSampleReference', header: 'PD Sample Reference', type: 'date'},
        { field: 'firstCarcass', header: 'PU First Carcass', type: 'date'},
        { field: 'completionCarcass', header: 'PU Completion Carcass', type: 'date'},
        { field: 'firstArtwork', header: 'PU First Artwork', type: 'date'},
        { field: 'completionArtwork', header: 'PU Completion Artwork', type: 'date'},
        { field: 'firstPackagingMaterial', header: 'PU First Packaging Material', type: 'date'},
        { field: 'completionPackagingMaterial', header: 'PU Completion Packaging Material', type: 'date'},
        { field: 'puMoldAvailability', header: 'PU Mold Availability'},
        { field: 'carcass', header: 'PROD Carcass', type: 'date'},
        { field: 'artwork', header: 'PROD Artwork', type: 'date'},
        { field: 'packagingMaterial', header: 'PROD Packaging Material', type: 'date'},
        { field: 'crd', header: 'PROD CRD', type: 'date'},
        { field: 'poptDate', header: 'QA POPT Date', type: 'date'},
        { field: 'qaSampleReference', header: 'QA Sample Reference'},
        { field: 'psiDate', header: 'QA PSI Date', type: 'date'},
      ],
      rows: orderItems.map(order=>{

        let puMoldAvail = 'None';
        let qaSampleRef = 'None';

        if(order.puMoldAvailability === 1) 
          puMoldAvail = 'Yes'
        else if(order.puMoldAvailability === 0)
          puMoldAvail = 'No'

        if(order.qaSampleRef === 1)
          qaSampleRef = 'Yes'
        else if(order.qaSampleRef === 0)
          qaSampleRef ='No';

        return{
          ...order,
          firstOrder: order.firstOrder ? 'YES' : 'NO',
          patternReleasing: moment(order.patternReleasing).format('L'),
          productSpecs: moment(order.productSpecs).format('L'),
          packagingSpecs: moment(order.packagingSpecs).format('L'),
          pdMoldAvailability: moment(order.pdMoldAvailability).format('L'),
          pdSampleReference: moment(order.pdSampleReference).format('L'),
          firstCarcass: moment(order.firstCarcass).format('L'),
          completionCarcass: moment(order.completionCarcass).format('L'),
          firstArtwork: moment(order.firstArtwork).format('L'),
          completionArtwork: moment(order.completionArtwork).format('L'),
          firstPackagingMaterial: moment(order.firstPackagingMaterial).format('L'),
          completionPackagingMaterial: moment(order.completionPackagingMaterial).format('L'),
          puMoldAvailability: puMoldAvail,
          carcass: moment(order.carcass).format('L'),
          artwork: moment(order.artwork).format('L'),
          packagingMaterial: moment(order.packagingMaterial).format('L'),
          crd: moment(order.crd).format('L'),
          poptDate: moment(order.poptDate).format('L'),
          qaSampleReference: qaSampleRef,
          psiDate: moment(order.psiDate).format('L'),
        }
      }),
    };

        // Extract data from MUI Data Grid
        const originalRows = data.rows.map((row) => {
          return data.columns.map((column) => {
            if (column.type === 'date') {
              // Try to parse the date and return formatted date or null if invalid
              const dateValue = new Date(row[column.field]);
              return isNaN(dateValue) ? null : dateValue.toLocaleDateString();
            }
            return row[column.field];
          });
        });
      

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet([data.columns.map((column) => column.header), ...originalRows]);

        // Add 5 blank rows
        for (let i = 0; i < 1; i++) {
          XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
        }

        // Use data2.rows as additionalRows
        const additionalRows = [
          data2.columns.map((column) => column.header), // Headers
          ...data2.rows.map((row) =>
            data2.columns.map((column) => {
              if (column.type === 'date') {
                // Format date to short date format if valid, otherwise return null
                const dateValue = new Date(row[column.field]);
                return isNaN(dateValue) ? null : dateValue.toLocaleDateString();
              }
              return row[column.field];
            })
          ),
        ];
        

        XLSX.utils.sheet_add_aoa(ws, additionalRows, { origin: -1 });

        // Create a workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // Save the file
        XLSX.writeFile(wb, 'exported_data.xlsx');

        setTimeout(() => {
          setDataGridLoading(false);  
        }, 2000);

  };

  const RenderPuMoldAvailability = (newRow) => {

    const [value,setValue] = React.useState(newRow.puMoldAvailability);

    const handleChange = (e) => {

      const comDepartment = user?.result?.department?.department;
      if(comDepartment !== 'PURCHASING' && comDepartment !== 'AM' ){
          setSnackbar({ children: `Only Purchasing or AM Dept are allow to edit Mold Availability`, severity: 'error' });
          return;
      }

      if(currentStatus !== 'OPEN'){
        setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
        return;
      }

      setValue(e.target.value);

      newRow.puMoldAvailability = e.target.value;
      // AMCOM
      const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
      const edit = {
        puCom:{
          editedBy: newUser,
          updatedAt: moment(),
        }
      }
     
      const executeAwait = async () =>{
        await dispatch(updateCellEditedBy(id,{edit}));
        await dispatch(updateCellOrderItem(newRow?.id,newRow));
        await dispatch(getCountOrderItemStatusOpen(id));    
      }
      executeAwait();

      setSnackbar({ children: 'Successfully update cell', severity: 'success' });
    };
  
    return(    
      <Select
          value={value}
          autoWidth
          onChange={(e)=>handleChange(e)}
          label="Mold Availability"
        >
          <MenuItem value={-1}>
            <em>None</em>
          </MenuItem>
          <MenuItem value={1}>Yes</MenuItem>
          <MenuItem value={0}>No</MenuItem>
      </Select>
    )  
  }

  const RenderQaSampleReference = (newRow) => {
    const [value,setValue] = React.useState(newRow.qaSampleReference);

    const handleChange = (e) => {

      const comDepartment = user?.result?.department?.department;
      if(comDepartment !== 'QA' && comDepartment !== 'AM' ){
          setSnackbar({ children: `Only QA or AM Dept are allow to edit Sample Reference`, severity: 'error' });
          return;
      }

      if(currentStatus !== 'OPEN'){
        setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
        return;
      }

      setValue(e.target.value);

      newRow.qaSampleReference = e.target.value;
      // AMCOM
      const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
      const edit = {
        qaCom:{
          editedBy: newUser,
          updatedAt: moment(),
        }
      }
     
      const executeAwait = async () =>{
        await dispatch(updateCellEditedBy(id,{edit}));
        await dispatch(updateCellOrderItem(newRow?.id,newRow));
        await dispatch(getCountOrderItemStatusOpen(id));    
      }
      executeAwait();

      setSnackbar({ children: 'Successfully update cell', severity: 'success' });
    };
  
    return(    
      <Select
          value={value}
          autoWidth
          onChange={(e)=>handleChange(e)}
        >
          <MenuItem value={-1}>
            <em>None</em>
          </MenuItem>
          <MenuItem value={1}>Yes</MenuItem>
          <MenuItem value={0}>No</MenuItem>
      </Select>
    )  
  }


  const RenderUpload = (rowSelected) =>{

    return(
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <Box sx={{mt:0.5}}/>
        <Button variant="outlined" color="secondary" onClick={()=>{handleOpenDialog(rowSelected)}} startIcon={<Image />}>
          <Typography variant="body1" sx={{fontSize:8}}>View Image</Typography>
        </Button>
        <Box sx={{mt:0.5}}/>
        <Button variant="outlined" color="error" onClick={()=>{handleOpenDialogDeleteRow(rowSelected)}} startIcon={<Delete />}>
          <Typography variant="body1" sx={{fontSize:8}}>Delete Row</Typography>
        </Button>
        <Box sx={{mt:0.5}}/>
      </Grid>
    )
  };

  useEffect(() => {
      setDataGridLoading(true);
      dispatch(getOrderItemsNoLoading(id));
      //dispatch(getCountOrderItemStatusOpen(id));
  }, [dispatch]);

  // load that will not using loading ui
  useEffect(() => {
    // Create an interval that reloads the page every 30 seconds
    const intervalId = setInterval(() => {
        dispatch(getOrderItems(id));
        console.log('page grid reload');
    }, 300000); // 5 minutes
    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
    }, [dispatch]);


  useEffect(()=>{
    if(!isLoading && orderItems && departmentStatus){
      setRows(orderItems);
      const po = purchaseOrders.find(po => po._id === id);
      setCurrentPO(po);
      setCurrentStatus(po?.status?.status);  
      setCurrentReqAttDepts(po?.reqAttDepts);
      setCurrentLogsDate({
        logRequired: po.logCom.requiredShipDate,
        logRequested: po.logCom.requestedShipDate
      });
      setCurrentDeptOpenStatus(departmentStatus);
      console.log(`department status ${JSON.stringify(departmentStatus)}`);
    }
  },[orderItems,purchaseOrders,departmentStatus]);


  useEffect(() => {

    if(currentDeptOpenStatus?.department === 'PD' && currentStatus === 'OPEN'){
      if(-1 === currentReqAttDepts.findIndex(dept => dept.department === 'PD'))
          dispatch(updatePOByAuto(id,{
          status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
          reqAttDepts:[{"_id":"64c76507789aa6953ef3d741","department":"PD"}],}));
    }
    if(currentDeptOpenStatus?.department === 'PU' && currentStatus === 'OPEN'){
      if(-1 === currentReqAttDepts.findIndex(dept => dept.department === 'PURCHASING'))
          dispatch(updatePOByAuto(id,{
          status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
          reqAttDepts:[{"_id":"64c76507789aa6953ef3d742","department":"PURCHASING"}],})); 
    }
    if(currentDeptOpenStatus?.department === 'PROD' && currentStatus === 'OPEN'){
      if(-1 === currentReqAttDepts.findIndex(dept => dept.department === 'PRODUCTION'))
      dispatch(updatePOByAuto(id,{
      status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
      reqAttDepts:[{"_id":"64c76507789aa6953ef3d743","department":"PRODUCTION"}],})); 
    }
    if(currentDeptOpenStatus?.department === 'QA' && currentStatus === 'OPEN'){
      if(-1 === currentReqAttDepts.findIndex(dept => dept.department === 'QA'))
      dispatch(updatePOByAuto(id,{
      status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
      reqAttDepts:[{"_id":"64c76507789aa6953ef3d744","department":"QA"}],})); 
    }

    if(currentDeptOpenStatus?.department === 'LOGS' && currentStatus === 'OPEN' && rows.length > 0){
        if(currentLogsDate.logRequired != null && currentLogsDate.logRequested != null){
          
          dispatch(updatePOByAuto(id,{
            status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
            reqAttDepts:[{_id:"64c764df789aa6953ef3d740",department:"AM"}],}));
        }else{
          dispatch(updatePOByAuto(id,{
            status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
            reqAttDepts:[{"_id":"64c76507789aa6953ef3d745","department":"LOGISTICS"}],}));
        }
    }
  },[currentDeptOpenStatus]);

  useEffect(() => {
    setTimeout(() => {
      setDataGridLoading(false);  
    }, 2500);
  }, [rows]);

  const comDepartment = user?.result?.department?.department;

  const columns = [
    
    { 
      field: 'itemCode',
      headerName: 'Item Code',
      type:'string',
      editable: comDepartment === 'AM' ? true : false,
      headerClassName: 'super-app-theme--header',
      width:130, maxWidth:200, minWidth:80, 
    },
    {
      field: 'image',
      headerName: 'Image',
      renderCell: (params) => RenderUpload(params.row),
      disableExport: true
    },
    {
      field: 'description',
      headerName: 'Description',
      type: 'string',
      editable: comDepartment === 'AM' ? true : false,
      width: 200,minWidth: 80, maxWidth: 250,
    },
    {
      field: 'qty',
      headerName: 'Qty',
      type: 'number',
      editable: comDepartment === 'AM' ? true : false,
      width: 80,minWidth: 30, maxWidth: 100,
    },
    {
      field: 'firstOrder',
      headerName: '1st Order?',
      valueFormatter: ({ value }) => value ? `Yes` : `No`,
      width: 80,minWidth: 30, maxWidth: 100,
      renderCell: (params) => RenderFirstOrder(params.row),
    },
    {
      field: 'patternReleasing',
      headerName: 'Pattern Releasing',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PD'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'productSpecs',
      headerName: 'Product Specs',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PD'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'packagingSpecs',
      headerName: 'Packaging Specs',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PD'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'pdMoldAvailability',
      headerName: 'Mold Availability',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PD'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'pdSampleReference',
      headerName: 'Sample Reference',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PD'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'firstCarcass',
      headerName: 'First Carcass',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PURCHASING'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    ,
    {
      field: 'completionCarcass',
      headerName: 'Completion Carcass',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PURCHASING'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'firstArtwork',
      headerName: 'First Artwork',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PURCHASING'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'completionArtwork',
      headerName: 'Completion Artwork',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PURCHASING'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'firstPackagingMaterial',
      headerName: 'First Packaging Material',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PURCHASING'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'completionPackagingMaterial',
      headerName: 'Completion Packaging Material',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PURCHASING'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'puMoldAvailability',
      headerName: 'Mold Availability',
      valueFormatter: ({ value }) => value ? `Yes` : `No`,
      width: 100,minWidth: 30, maxWidth: 100,
      renderCell: (params) => RenderPuMoldAvailability(params.row),
    },
    {
      field: 'carcass',
      headerName: 'Carcass',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PRODUCTION'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'artwork',
      headerName: 'Artwork',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PRODUCTION'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'packagingMaterial',
      headerName: 'Packaging Material',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PRODUCTION'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'crd',
      headerName: 'CRD',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'PRODUCTION'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'poptDate',
      headerName: 'POPT Date',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'QA'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'qaSampleReference',
      headerName: 'Sample Reference   ',
      valueFormatter: ({ value }) => value ? `Yes` : `No`,
      width: 100,minWidth: 30, maxWidth: 100,
      renderCell: (params) => RenderQaSampleReference(params.row),
    },
    {
      field: 'psiDate',
      headerName: 'PSI Date',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: comDepartment === 'AM' || comDepartment === 'QA'? true : false,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    }
  ];


  const handleAddRow = () => {

    if(currentStatus !== 'OPEN'){

      setSnackbar({ children: `disable from adding row, due to status ${currentStatus}`, severity: 'warning' });
      return;
    }

    const comDepartment = user?.result?.department?.department;
    if(comDepartment !== 'AM'){
        setSnackbar({ children: `Only AM Dept are allow to Add Rows`, severity: 'error' });
        return;
    }


    const emptyDataRow = {
      poNumberId:id,
      isRowComplete:0,
      itemCode:null,
      image:null,
      description:null,
      qty:0,
      firstOrder:false,
      patternReleasing: null,
      productSpecs: null,
      packagingSpecs: null,
      pdMoldAvailability: null,
      pdSampleReference: null,
      firstCarcass: null,
      completionCarcass: null,
      firstArtwork: null,
      completionArtwork: null,
      firstPackagingMaterial: null,
      completionPackagingMaterial: null,
      puMoldAvailability: -1,
      carcass: null,
      artwork: null,
      packagingMaterial: null,
      crd: null,
      poptDate: null,
      qaSampleReference: -1,
      psiDate: null
    }

    dispatch(createOrderItem(emptyDataRow));
    
    setSnackbar({ children: 'Added row successfully', severity: 'success' });
  };

  const processRowUpdate = async (newRow,oldRow) =>{
      //trapping here
      // status
      if(currentStatus !== 'OPEN'){
        setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
        return oldRow;
      }
      // no changes
      if(JSON.stringify(newRow)===JSON.stringify(oldRow)){
        return oldRow;
      }

      // disable edit once user inputed a value
      if(comDepartment !== 'AM'){
          // AM
          if(oldRow.patternReleasing !== null && newRow.patternReleasing !== oldRow.patternReleasing){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.productSpecs !== null && newRow.productSpecs !== oldRow.productSpecs){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.packagingSpecs !== null && newRow.packagingSpecs !== oldRow.packagingSpecs){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.pdMoldAvailability !== null && newRow.pdMoldAvailability !== oldRow.pdMoldAvailability){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.pdSampleReference !== null && newRow.pdSampleReference !== oldRow.pdSampleReference){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          // PU
          if(oldRow.firstCarcass !== null && newRow.firstCarcass !== oldRow.firstCarcass){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.completionCarcass !== null && newRow.completionCarcass !== oldRow.completionCarcass){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.firstArtwork !== null && newRow.firstArtwork !== oldRow.firstArtwork){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.completionArtwork !== null && newRow.completionArtwork !== oldRow.completionArtwork){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.firstPackagingMaterial !== null && newRow.firstPackagingMaterial !== oldRow.firstPackagingMaterial){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.completionPackagingMaterial !== null && newRow.completionPackagingMaterial !== oldRow.completionPackagingMaterial){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          // PROD
          if(oldRow.carcass !== null && newRow.carcass !== oldRow.carcass){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.artwork !== null && newRow.artwork !== oldRow.artwork){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.packagingMaterial !== null && newRow.packagingMaterial !== oldRow.packagingMaterial){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.crd !== null && newRow.crd !== oldRow.crd){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          //QA
          if(oldRow.poptDate !== null && newRow.poptDate !== oldRow.poptDate){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
          if(oldRow.psiDate !== null && newRow.psiDate !== oldRow.psiDate){
            alert('update is prohibited, please contact AM department to delete the date inputed');
            return oldRow;
          }
      }
      
      // disable edit once user inputed a value

      const regexPattern = /^(?=.{1,15}$)[a-zA-Z0-9]*-?[a-zA-Z0-9\s]*$|^(?=.{1,15}$)[a-zA-Z0-9]*$/;
        // for FIRST ORDER
        if(!newRow.firstOrder && (newRow.patternReleasing !== oldRow.patternReleasing ||
            newRow.productSpecs !== oldRow.productSpecs || newRow.packagingSpecs !== oldRow.packagingSpecs )){
          setSnackbar({ children: 'disable from edit due to not a First Order', severity: 'warning' });
          return oldRow;
        }

        // for PO NUMBER
        else if(!regexPattern.test(newRow.itemCode)) {
            console.log(`${newRow.itemCode} PO is not a valid string.`);
            setSnackbar({ children: `PO Number inputed is invalid, `, severity: 'error' });
            return oldRow;
        }

        // for QTY
        else if(newRow.qty < 0){
          console.log(`${newRow.qty} qty is not a valid string.`);
          setSnackbar({ children: `QTY inputed is invalid, `, severity: 'error' });
          return oldRow;
        }

      //
      if(oldRow.itemCode !== newRow.itemCode || oldRow.description !== newRow.description || oldRow.qty !== newRow.qty){
        // AM-COM
        console.log('AM-COM');
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
        const edit = {
          amCom:{
            editedBy: newUser,
            updatedAt: moment(),
          }
        }
        await dispatch(updateCellEditedBy(id,{edit}));
        //
      }
      else if(oldRow.patternReleasing !== newRow.patternReleasing || oldRow.productSpecs !== newRow.productSpecs || oldRow.packagingSpecs !== newRow.packagingSpecs ||
            oldRow.pdMoldAvailability !== newRow.pdMoldAvailability || oldRow.pdSampleReference !== newRow.pdSampleReference){
        if(moment(newRow.patternReleasing) <= moment(currentPO.dateIssued) || moment(newRow.patternReleasing) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.productSpecs) <= moment(currentPO.dateIssued) || moment(newRow.productSpecs) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.packagingSpecs) <= moment(currentPO.dateIssued) || moment(newRow.packagingSpecs) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.pdMoldAvailability) <= moment(currentPO.dateIssued) || moment(newRow.pdMoldAvailability) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.pdSampleReference) <= moment(currentPO.dateIssued) || moment(newRow.pdSampleReference) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        // PD-COM
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
        const edit = {
          pdCom:{
            editedBy: newUser,
            updatedAt: moment(),
          }
        }
       await dispatch(updateCellEditedBy(id,{edit}));
        //
      }
      else if(oldRow.carcass !== newRow.carcass || oldRow.artwork !== newRow.artwork || oldRow.packagingMaterial !== newRow.packagingMaterial || oldRow.crd !== newRow.crd){
        if(moment(newRow.carcass) <= moment(currentPO.dateIssued) || moment(newRow.carcass) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.artwork) <= moment(currentPO.dateIssued) || moment(newRow.artwork) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.packagingMaterial) <= moment(currentPO.dateIssued) || moment(newRow.packagingMaterial) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        // if(moment(newRow.crd) <= moment(currentPO.dateIssued) || moment(newRow.crd) >= moment(currentPO.shipDate)){
        //   setSnackbar({ children: `Invalid Date, `, severity: 'error' });
        //   return oldRow;
        // }
        // PROD-COM
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
        const edit = {
          prodCom:{
            editedBy: newUser,
            updatedAt: moment(),
          }
        }
        await dispatch(updateCellEditedBy(id,{edit}));
        //
      }
      else if(oldRow.poptDate !== newRow.poptDate || oldRow.psiDate !== newRow.psiDate){
        // if(moment(newRow.poptDate) <= moment(currentPO.dateIssued) || moment(newRow.poptDate) >= moment(currentPO.shipDate)){
        //   setSnackbar({ children: `Invalid Date, `, severity: 'error' });
        //   return oldRow;
        // }
        if(moment(newRow.psiDate) <= moment(currentPO.dateIssued) || moment(newRow.psiDate) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.psiDate) <= moment(currentPO.dateIssued) || moment(newRow.psiDate) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        // QA-COM
        console.log('QA-COM');
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
        const edit = {
          qaCom:{
            editedBy: newUser,
            updatedAt: moment(),
          }
        }
        await dispatch(updateCellEditedBy(id,{edit}));
        //
      }
      else if(oldRow.firstCarcass !== newRow.firstCarcass || oldRow.completionCarcass !== newRow.completionCarcass || oldRow.firstArtwork !== newRow.firstArtwork
        || oldRow.completionArtwork !== newRow.completionArtwork || oldRow.firstPackagingMaterial !== newRow.firstPackagingMaterial || oldRow.completionPackagingMaterial || newRow.completionPackagingMaterial){
        
        if(moment(newRow.firstCarcass) <= moment(currentPO.dateIssued) || moment(newRow.firstCarcass) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.completionCarcass) <= moment(currentPO.dateIssued) || moment(newRow.completionCarcass) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.firstArtwork) <= moment(currentPO.dateIssued) || moment(newRow.firstArtwork) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.completionArtwork) <= moment(currentPO.dateIssued) || moment(newRow.completionArtwork) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.firstPackagingMaterial) <= moment(currentPO.dateIssued) || moment(newRow.firstPackagingMaterial) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        if(moment(newRow.completionPackagingMaterial) <= moment(currentPO.dateIssued) || moment(newRow.completionPackagingMaterial) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
        // PU-COM
        console.log('PU-COM');
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
        const edit = {
          puCom:{
            editedBy: newUser,
            updatedAt: moment(),
          }
        }
        await dispatch(updateCellEditedBy(id,{edit}));
        //
      }
 
      //
      await dispatch(updateCellOrderItem(oldRow.id,newRow));

      await dispatch(getCountOrderItemStatusOpen(id));

      setSnackbar({ children: 'Successfully update cell', severity: 'success' });
      return await newRow;
      
  } 

  const handleProcessRowUpdateError = async (error) =>{
      setSnackbar({ children: 'Error during update', severity: 'error' });
  }

  const CustomizeToolBar = ()=>(
    <GridToolbarContainer>
      {/* <GridToolbarExport  
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{
            fileName: 'customerDataBase',
            utf8WithBom: true,
          }}
          /> */}
    </GridToolbarContainer>
  )

  function validateImageBase64(base64String) {
    try{
        // Remove data URL header (e.g., "data:image/png;base64,")
      const base64Data = base64String.replace(/^data:image\/(png|jpeg);base64,/, '');
    
      // Convert base64 to binary data
      const binaryData = atob(base64Data);
    
      // Check if the data length is within the limit (2MB)
      if (binaryData.length > 2 * 1024 * 1024) {
        return { valid: false, reason: 'Image size exceeds 5MB limit' };
      }
    
      // Determine image format by examining the magic number
      const magicNumber = binaryData.charCodeAt(0).toString(16) + binaryData.charCodeAt(1).toString(16);
      const validFormats = ['8950', 'ffd8']; // PNG magic number: 89 50, JPEG magic number: ff d8
    
      if (!validFormats.includes(magicNumber)) {
        return { valid: false, reason: 'Invalid image format' };
      }
    
      return { valid: true };
    }catch(e){
      alert('error')
    }
  }

 

  return (
    // <div style={{ height: 400, width: '100%' }}>
      
    // </div>
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading || dataGridLoading}>
          <CircularProgress color="inherit" />
      </Backdrop>
      <Grid md={11} lg={11}>
        <Box sx={{ width: '100%',mt:5 }}>
        <Stack direction="row" spacing={1}>
          <Button size="medium" variant="contained" color="secondary" onClick={handleAddRow} startIcon={<Add/>}>
            Add a row
          </Button>
          <Button size="medium" variant="contained" color="success" onClick={() => exportToExcel()} startIcon={<Add/>}>
            Export to excel
          </Button>
        </Stack>
        </Box>
        <Box sx={{ maxHeight: 600, width: '100%',mt:1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          getRowHeight={() => 'auto'} getEstimatedRowHeight={() => 200} 
          pageSizeOptions={[20]}
          showCellVerticalBorder
          showColumnVerticalBorder
          columnGroupingModel={columnGroupingModel}
          experimentalFeatures={{ columnGrouping: true }}
          slots={{
            toolbar: CustomizeToolBar,
          }}
          density="standard"
          
          getCellClassName={(params)=>{
            return params.field === "patternReleasing"
            || params.field === "productSpecs"  
            || params.field === "packagingSpecs"
            || params.field === "pdMoldAvailability"
            || params.field === "pdSampleReference"
            || params.field === "carcass"
            || params.field === "artwork"
            || params.field === "packagingMaterial"
            || params.field === "crd"  
            ? "highlight" : ""
          }}

          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
              whiteSpace: 'break-spaces',
              lineHeight: 1,
            },
            '&.MuiDataGrid-root .MuiDataGrid-columnHeader--alignRight .MuiDataGrid-columnHeaderTitleContainer': {
              pl: 1,
            },
            "& .MuiDataGrid-cell":{
              border: 1,
              borderRight: 1,
              borderTop: 0,
              borderLeft:0,
              borderBottom:1,
              borderColor: 'primary.light',
              // add more css for customization
              },
              boxShadow: 2,
              // border: 2,
              borderColor: 'primary.light',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
              '& .MuiDataGrid-columnHeader': {
                border: 1,
                borderColor: 'primary',
                backgroundColor:'primary.main',
                color:'#fff'
                // add more css for customization
              },
              ".highlight": {
                bgcolor: "#95a5a6",
                "&:hover": {
                  bgcolor: "#7f8c8d",
                },
              },
              overflow: "scroll"
          }}
        />
        </Box>
        {/* Dialog image upload */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>{imageData?.rowSelected?.itemCode}</DialogTitle>
            <DialogContent>
              <ImageList sx={{ width: 410, height: 410 }}>
                 <img 
                  src={imageData?.image}
                  width={400}
                  height={400}
                  loading="lazy"
                 />
              </ImageList>

              {user?.result?.department?.department === 'AM' &&
                <FileBase64
                  multiple={ false }
                  onDone={({base64})=> {
                    
                    const validationResult = validateImageBase64(base64.split(',')[1])

                    if (validationResult.valid) {
                        setImageData({
                          ...imageData,
                          image:base64
                        });
                    } else 
                        setSnackbar({ children: `Invalid Image or exceed to 2MB in size`, severity: 'error' });
                        return;
                  }
                } />
              }

            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained" color="warning">Cancel</Button>
              {imageData?.rowSelected?.itemCode != null ? 
                <Button onClick={()=>{
                  if(imageData?.image === NoImage){
                    alert('No Image to Download')
                  }else{
                    triggerBase64Download(imageData?.image, imageData?.rowSelected?.itemCode)
                  }
                }}
                  variant="contained" color="error">
                    DOWNLOAD 
              </Button>: null}
              <Button onClick={handleUploadImage} variant="contained">Upload Image</Button>
            </DialogActions>
          </Dialog>
          {/* Dialog for image upload */}

          {/* Dialog for delete row */}

          <Dialog
            open={openDialogDeleteRow}
            onClose={handleCloseDialogDeleteRow}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Are you sure, you want to delete this row ?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Note: once deleted it will never be retrieve.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="error" onClick={handleCloseDialogDeleteRow}>Cancel</Button>
              <Button variant="contained" color="info" onClick={handleDeleteRow} autoFocus>
                Proceed
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog for delete row */}
        {!!snackbar && (
          <Snackbar
            open
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
          > 
            <Alert {...snackbar} onClose={handleCloseSnackbar} variant="filled" />
          </Snackbar>
        )}
      </Grid>
    </Grid>
  );
}