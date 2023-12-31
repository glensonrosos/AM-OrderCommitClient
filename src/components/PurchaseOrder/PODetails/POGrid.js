import React,{useState,useEffect} from 'react';
import { DataGrid,GridToolbar,GridToolbarExport,GridToolbarContainer } from '@mui/x-data-grid';
import {Snackbar,Alert,Button,Box,Tooltip,Switch,ImageList,Stack,Backdrop,CircularProgress, Typography} from '@mui/material';
import {Delete,Image,Add} from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';

import { useParams } from 'react-router';
import moment from 'moment';
import FileBase64 from 'react-file-base64';

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
  const [currentRemarks,setCurrentRemarks] = useState(null);
  
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

    if(name == 'AM')
      dept = po?.amCom;
    if(name == 'PD')
      dept = po?.pdCom;
    if(name == 'PU')
      dept = po?.puCom;
    if(name == 'PROD')
      dept = po?.prodCom;
    if(name == 'QA')
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
    }, 60000); // 60 seconds in milliseconds
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

  // to change to CLosed
  // [
            //   {"_id":"64c76507789aa6953ef3d741","department":"PD"},
            //   {"_id":"64c76507789aa6953ef3d744","department":"QA"},
            //   {"_id":"64c764df789aa6953ef3d740","department":"AM"},
            //   {"_id":"64c76507789aa6953ef3d742","department":"PURCHASING"},
            //   {"_id":"64c76507789aa6953ef3d743","department":"PRODUCTION"},
            //   {"_id":"64c76507789aa6953ef3d745","department":"LOGISTICS"}
            // ]

            // [
            //   {"status":"OPEN","_id":"64cb742f6dec3a86e635ce26","color":"error","code":0},
            //   {"status":"ON HOLD","_id":"64cb742f6dec3a86e635ce27","color":"primary","code":1},
            //   {"status":"CANCELED","_id":"64cb742f6dec3a86e635ce28","color":"warning","code":2},
            //   {"status":"CLOSED","_id":"64cb742f6dec3a86e635ce29","color":"success","code":3}
            // ]
  useEffect(() => {

    if(currentDeptOpenStatus?.department === 'PD' && currentStatus === 'OPEN'){
      if(-1 == currentReqAttDepts.findIndex(dept => dept.department === 'PD'))
          dispatch(updatePOByAuto(id,{
          status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
          reqAttDepts:[{"_id":"64c76507789aa6953ef3d741","department":"PD"}],
          remarks:""}));
    }
    if(currentDeptOpenStatus?.department === 'PU' && currentStatus === 'OPEN'){
      if(-1 == currentReqAttDepts.findIndex(dept => dept.department === 'PURCHASING'))
          dispatch(updatePOByAuto(id,{
          status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
          reqAttDepts:[{"_id":"64c76507789aa6953ef3d742","department":"PURCHASING"}],
          remarks:""})); 
    }
    if(currentDeptOpenStatus?.department === 'PROD' && currentStatus === 'OPEN'){
      if(-1 == currentReqAttDepts.findIndex(dept => dept.department === 'PRODUCTION'))
      dispatch(updatePOByAuto(id,{
      status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
      reqAttDepts:[{"_id":"64c76507789aa6953ef3d743","department":"PRODUCTION"}],
      remarks:""})); 
    }
    if(currentDeptOpenStatus?.department === 'QA' && currentStatus === 'OPEN'){
      if(-1 == currentReqAttDepts.findIndex(dept => dept.department === 'QA'))
      dispatch(updatePOByAuto(id,{
      status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
      reqAttDepts:[{"_id":"64c76507789aa6953ef3d744","department":"QA"}],
      remarks:""})); 
    }

    if(currentDeptOpenStatus?.department === 'LOGS' && currentStatus === 'OPEN' && rows.length > 0){
        if(currentLogsDate.logRequired != null && currentLogsDate.logRequested != null){
          
          dispatch(updatePOByAuto(id,{
            status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
            reqAttDepts:[{_id:"64c764df789aa6953ef3d740",department:"AM"}],
            remarks:""}));
        }else{
          dispatch(updatePOByAuto(id,{
            status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
            reqAttDepts:[{"_id":"64c76507789aa6953ef3d745","department":"LOGISTICS"}],
            remarks:""}));
        }
    }
  },[currentDeptOpenStatus]);

  useEffect(() => {
    setTimeout(() => {
      setDataGridLoading(false);  
    }, 2000);
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
      firstCarcass: null,
      completionCarcass: null,
      firstArtwork: null,
      completionArtwork: null,
      firstPackagingMaterial: null,
      completionPackagingMaterial: null,
      carcass: null,
      artwork: null,
      packagingMaterial: null,
      crd: null,
      poptDate: null,
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
      else if(oldRow.patternReleasing !== newRow.patternReleasing || oldRow.productSpecs !== newRow.productSpecs || oldRow.packagingSpecs !== newRow.packagingSpecs){
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
        if(moment(newRow.crd) <= moment(currentPO.dateIssued) || moment(newRow.crd) >= moment(currentPO.shipDate)){
          setSnackbar({ children: `Invalid Date, `, severity: 'error' });
          return oldRow;
        }
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
        if(moment(newRow.poptDate) <= moment(currentPO.dateIssued) || moment(newRow.poptDate) >= moment(currentPO.shipDate)){
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

      // if(newRow.itemCode !== null && newRow.description !== null && newRow.qty > 0){
      //   await dispatch(getCountOrderItemStatusOpen(id));
      // }
      await dispatch(getCountOrderItemStatusOpen(id));

      setSnackbar({ children: 'Successfully update cell', severity: 'success' });
      return await newRow;
      
  } 

  const handleProcessRowUpdateError = async (error) =>{
      setSnackbar({ children: 'Error during update', severity: 'error' });
  }

  const CustomizeToolBar = ()=>(
    <GridToolbarContainer>
      <GridToolbarExport  
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{
            fileName: 'customerDataBase',
            utf8WithBom: true,
          }}
          />
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
          
          // getRowClassName={(params) => {
          //   return params.row.itemCode === 'MFP1553CHA' ? "highlight" : "";
          // }}

          getCellClassName={(params)=>{
            return params.field === "patternReleasing"
            || params.field === "productSpecs"  
            || params.field === "packagingSpecs"
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
              <ImageList sx={{ width: 400, height: 400 }}>
                 <img 
                  src={imageData.image}
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