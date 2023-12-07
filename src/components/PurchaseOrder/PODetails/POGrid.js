import React,{useState,useEffect} from 'react';
import { DataGrid,GridToolbarExport,GridToolbarContainer,GridToolbarColumnsButton } from '@mui/x-data-grid';
import {Snackbar,Alert,Button,Box,Tooltip,Switch,ImageList,Stack,Backdrop,CircularProgress, Typography,Select,
        MenuItem,Table,TableHead,TableRow,TableCell,TableBody,Paper,TableContainer, Checkbox,FormControl,InputLabel,Chip,FormControlLabel} from '@mui/material';
import {Delete,Image,Add,FileDownload, DeleteSweep, DeleteForever, CancelPresentation, Download, Upload, EditCalendar, Save} from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Unstable_Grid2';

// xlsx
import * as XLSX from 'xlsx';
// images pdf
import jsPDF from 'jspdf';

import { useParams } from 'react-router';
import FileBase64 from 'react-file-base64';
import {triggerBase64Download} from 'react-base64-downloader';

import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import { useDispatch,useSelector } from 'react-redux';
import { getOrderItems,getOrderItemsNoLoading,createOrderItem,updateCellOrderItem,getCountOrderItemStatusOpen,deleteOrderItem,
  getOrderItemImage,updateCellOrderItemInBulk,clearDateOrderItemInBulk,updateCellOrderItemWithItemCode,getOrderItemsImages } from '../../../actions/orderitems';
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
  const {isLoading,orderItems,departmentStatus,message,images} = useSelector(state=> state.orderItems);
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
  }, [isLoading,orderItems]);

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
        { field: 'headerRowNumber'},
        { field: 'itemCode'},
        { field: 'image'},
        { field: 'description'},
        { field: 'qty'},
        { field: 'firstOrder'},
        { field: 'amArtwork'}, // glenson added updates
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
        { field: 'puPatternAvailability'},
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
    // disable if closed
    if(currentStatus !== 'OPEN'){
      setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
      return;
    }
    setToBeDeleteRow({rowSelected});
    setOpenDialogDeleteRow(true);
  };

  const [openDialogClearDate, setOpenDialogClearDate] = useState(false);
  const handleOpenDialogClearDate = (rowSelected) => {
    setOpenDialogClearDate(true);
  };

  const handleCloseDialogDeleteRow = () => {
    setToBeDeleteRow({rowSelected:null});
    setOpenDialogDeleteRow(false);
  };

  const handleCloseDialogClearDate = () => {
    setOpenDialogClearDate(false);
  };

  const [openDialogEditBulk, setOpenDialogEditBulk] = useState(false);
  const handleOpenDialogEditBulk = () => {
    setOpenDialogEditBulk(true);
  };
  const handleCloseDialogEditBulk = () => {
    setOpenDialogEditBulk(false);
  };

  const handleDeleteCommitedDates = async () =>{
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
      },
      pdCom:{
        editedBy: newUser,
        updatedAt: moment(),
      },
      puCom:{
        editedBy: newUser,
        updatedAt: moment(),
      },
      prodCom:{
        editedBy: newUser,
        updatedAt: moment(),
      },
      qaCom:{
        editedBy: newUser,
        updatedAt: moment(),
      }
    }

    await dispatch(updateCellEditedBy(id,{edit}));

    await dispatch(updateCellOrderItem(toBeDeleteRow?.rowSelected?._id,{
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
      carcass: null,
      artwork: null,
      packagingMaterial: null,
      crd: null,
      poptDate: null,
      psiDate: null
    }));
    //
    await dispatch(getCountOrderItemStatusOpen(id));
    setSnackbar({ children: 'Clear Dates Successfully ', severity: 'success' });
    handleCloseDialogDeleteRow();
  }


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
    //
    await dispatch(getCountOrderItemStatusOpen(id));
    setSnackbar({ children: 'Deleted Successfully', severity: 'success' });
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
        { field: 'amArtwork', header: 'with Artwork'},
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
        { field: 'puPatternAvailability', header: 'PU Pattern Availability'},
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

        let puPatternAvail = 'Yes';
        let puMoldAvail = 'Yes';
        let qaSampleRef = 'Yes';
        let amArtworkRef = 'Yes';

        if(order.puMoldAvailability === 1) 
          puMoldAvail = 'Yes'
        else if(order.puMoldAvailability === 0)
          puMoldAvail = 'No'

        if(order.puPatternAvailability === 1) 
          puPatternAvail = 'Yes'
        else if(order.puPatternAvailability === 0)
          puPatternAvail = 'No'
        
        if(order.qaSampleReference === 1)
          qaSampleRef = 'Yes'
        else if(order.qaSampleReference === 0)
          qaSampleRef ='No';

        if(order.amArtwork === 1) 
          amArtworkRef = 'Yes'
        else if(order.amArtwork === 0)
          amArtworkRef = 'No'

        return{
          ...order,
          firstOrder: order.firstOrder ? 'YES' : 'NO',
          amArtwork: amArtworkRef,
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
          puPatternAvailability: puPatternAvail,
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

  useEffect(()=>{
    if(images.length > 0){
      exportToPDF();
    }
  },[images])


  const exportToPDF = () => {

    if(images.length === 0)
      return;

    const pdf = new jsPDF();
  
    images.forEach((image, index) => {
      if (index !== 0) {
        pdf.addPage();
      }
      pdf.text(10, 10, image.itemCode);
      pdf.addImage(image.image, 'PNG', 10, 10, 200, 200);
    });
  
    pdf.save(`Glenson-Gwapo.pdf`);

    //stop loading
    setDataGridLoading(false);
  };

  const RenderPuPatternAvailability = (newRow) => {

    const [value,setValue] = useState(newRow.puPatternAvailability);

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

      newRow.puPatternAvailability = e.target.value;
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
          label="Pattern Availability"
          error={!value}
        >
          <MenuItem value={1}>Yes</MenuItem>
          <MenuItem value={0}>No</MenuItem>
      </Select>
    )  
  }

  const RenderPuMoldAvailability = (newRow) => {

    const [value,setValue] = useState(newRow.puMoldAvailability);

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
          error={!value}
        >
          <MenuItem value={1}>Yes</MenuItem>
          <MenuItem value={0}>No</MenuItem>
      </Select>
    )  
  }

  const RenderAmArtwork = (newRow) => {

    const [value,setValue] = React.useState(newRow.amArtwork);

    const handleChange = (e) => {

      const comDepartment = user?.result?.department?.department;
      if(comDepartment !== 'AM' ){
          setSnackbar({ children: `Only AM Dept are allow to edit With Artwork`, severity: 'error' });
          return;
      }

      if(currentStatus !== 'OPEN'){
        setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
        return;
      }

      setValue(e.target.value);

      newRow.amArtwork = e.target.value;
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
      <Select
          value={value}
          autoWidth
          onChange={(e)=>handleChange(e)}
          label="With Artwork"
          error={!value}
        >
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
          error={!value}
        >
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
    }
  },[orderItems,purchaseOrders,departmentStatus,isLoading]);


  useEffect(() => {

    if(currentStatus === null || currentStatus === undefined)
      return;

    if(rows?.length === 0){
      dispatch(updatePOByAuto(id,{
        status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
        reqAttDepts:[{_id:"64c764df789aa6953ef3d740",department:"AM"}],}));
    }

    if(currentDeptOpenStatus?.department === 'AM' && currentStatus === 'OPEN'){
      if(-1 === currentReqAttDepts.findIndex(dept => dept.department === 'AM'))
      dispatch(updatePOByAuto(id,{
        status:{status:"OPEN",_id:"64cb742f6dec3a86e635ce26",color:"error",code:0},
        reqAttDepts:[{_id:"64c764df789aa6953ef3d740",department:"AM"}],}));
    }
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
        console.log('glenson gwapo');
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
  },[currentDeptOpenStatus,currentStatus]);

  useEffect(() => {
    setTimeout(() => {
      setDataGridLoading(false);  
    }, 2500);
  }, [rows]);

  const comDepartment = user?.result?.department?.department;

  const columns = [
    { 
      field: 'headerRowNumber',
      headerName: '#',
      type:'number',
      editable: false,
      headerClassName: 'super-app-theme--header',
      width:55, maxWidth:70, minWidth:40, 
      pinned: true
    },
    { 
      field: 'itemCode',
      headerName: 'Item Code',
      type:'string',
      editable: comDepartment === 'AM' ? true : false,
      headerClassName: 'super-app-theme--header',
      width:130, maxWidth:200, minWidth:80, 
      pinned: true
    },
    {
      field: 'image',
      headerName: 'Image',
      renderCell: (params) => RenderUpload(params.row),
      disableExport: true,
      pinned: true
    },
    {
      field: 'description',
      headerName: 'Description',
      type: 'string',
      editable: comDepartment === 'AM' ? true : false,
      width: 200,minWidth: 80, maxWidth: 250,
      pinned: true
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
      field: 'amArtwork',
      headerName: 'With Artwork',
      valueFormatter: ({ value }) => value ? `Yes` : `No`,
      width: 100,minWidth: 30, maxWidth: 100,
      renderCell: (params) => RenderAmArtwork(params.row),
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
      field: 'puPatternAvailability',
      headerName: 'Pattern Availability',
      valueFormatter: ({ value }) => value ? `Yes` : `No`,
      width: 100,minWidth: 30, maxWidth: 100,
      renderCell: (params) => RenderPuPatternAvailability(params.row),
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

  // DATA TABLE FOR BULK EDIT --START
  const columnsTable = [
    { id: 'headerRowNumber', label: '#', minWidth: 30,group: 'AM Department' },
    { id: 'itemCode', label: 'Item Code', minWidth: 90,group: 'AM Department' },
    { id: 'description', label: 'Description', minWidth: 150,group: 'AM Department' },
    { id: 'qty', label: 'Qty', minWidth: 50 ,type: 'number',group: 'AM Department'},
    { id: 'firstOrder', label: '1st Order', minWidth: 20 ,type: 'boolean',group: 'AM Department'},
    { id: 'amArtwork', label: 'With Artwork', minWidth: 20,type: 'boolean',group: 'AM Department' },
    { id: 'patternReleasing', label: 'Pattern Releasing',minWidth: 50, type: 'date',group: 'PD Department'},
    { id: 'productSpecs', label: 'Product Specs', minWidth: 50, type: 'date',group: 'PD Department'},
    { id: 'packagingSpecs', label: 'Packaging Specs', minWidth: 50, type: 'date',group: 'PD Department'},
    { id: 'pdMoldAvailability', label: 'Mold Availability', minWidth: 20,type: 'date',group: 'PD Department'},
    { id: 'pdSampleReference', label: 'Sample Reference', minWidth: 50, type: 'date',group: 'PD Department'},
    { id: 'firstCarcass', label: 'First Carcass', minWidth: 50, type: 'date',group: 'Purchasing Department'},
    { id: 'completionCarcass', label: 'Completion Carcass',minWidth: 50, type: 'date',group: 'Purchasing Department'},
    { id: 'firstArtwork', label: 'First Artwork',minWidth: 50, type: 'date',group: 'Purchasing Department'},
    { id: 'completionArtwork', label: 'Completion Artwork', minWidth: 50, type: 'date',group: 'Purchasing Department'},
    { id: 'firstPackagingMaterial', label: 'First Packaging Material', minWidth: 50, type: 'date',group: 'Purchasing Department'},
    { id: 'completionPackagingMaterial', label: 'Completion Packaging Material',minWidth: 50, type: 'date',group: 'Purchasing Department'},
    { id: 'puPatternAvailability', label: 'Pattern Availability',minWidth: 50,type: 'boolean',group: 'Purchasing Department'},
    { id: 'puMoldAvailability', label: 'Mold Availability',minWidth: 50,type: 'boolean',group: 'Purchasing Department'},
    { id: 'carcass', label: 'Carcass', minWidth: 50, type: 'date',group: 'Production Department'},
    { id: 'artwork', label: 'Artwork', minWidth: 50, type: 'date',group: 'Production Department'},
    { id: 'packagingMaterial', label: 'Packaging Material', minWidth: 50, type: 'date',group: 'Production Department'},
    { id: 'crd', label: 'CRD', minWidth: 50, type: 'date',group: 'Production Department'},
    { id: 'poptDate', label: 'POPT Date', minWidth: 50, type: 'date',group: 'QA Department'},
    { id: 'qaSampleReference', label: 'Sample Reference',minWidth: 50, type: 'boolean',group: 'QA Department'},
    { id: 'psiDate', label: 'PSI Date', minWidth: 50, type: 'date',group: 'QA Department'},
    { id: '_id', label: 'Select All', minWidth: 20 },
  ];

  const [groupHeaderCol,setGroupHeaderCol] = useState({
    am:6,
    pd:5,
    pu:8,
    prod:4,
    qa:3
  })

  const CustomGroupHeader = ({ colSpan, label, show }) => (
 
    <TableCell align="left" colSpan={colSpan} style={{fontWeight: 'bold', textAlign: 'center', display: show ? '-moz-initial' : 'none'}} >
      {label}
    </TableCell>
    
  );

  const [visibleColumns, setVisibleColumns] = useState(columnsTable.map((columnT) => columnT.id));

  const handleCheckboxChange = (columnId) => {
    setVisibleColumns((prevVisibleColumns) => {
      if (prevVisibleColumns.includes(columnId)) {
        
        switch(columnId){
          case 'description':
          case 'qty':
          case 'firstOrder':  
          case 'amArtwork': 
            setGroupHeaderCol({
              ...groupHeaderCol,
              am: (groupHeaderCol.am-1)
            }); break;  
          case 'patternReleasing':
          case 'productSpecs':
          case 'packagingSpecs':
          case 'pdMoldAvailability':
          case 'pdSampleReference': 
            setGroupHeaderCol({
              ...groupHeaderCol,
              pd: (groupHeaderCol.pd-1)
            }); break;
          case 'firstCarcass':
          case 'completionCarcass':
          case 'firstArtwork':
          case 'completionArtwork':
          case 'firstPackagingMaterial':
          case 'completionPackagingMaterial':
          case 'puPatternAvailability':
          case 'puMoldAvailability':
            setGroupHeaderCol({
              ...groupHeaderCol,
              pu: (groupHeaderCol.pu-1)
            }); break;
          case 'carcass':
          case 'artwork':
          case 'packagingMaterial':
          case 'crd':
            setGroupHeaderCol({
              ...groupHeaderCol,
              prod: (groupHeaderCol.prod-1)
            }); break;
          case 'poptDate':
          case 'qaSampleReference':
          case 'psiDate':
            setGroupHeaderCol({
              ...groupHeaderCol,
              qa: (groupHeaderCol.qa-1)
            }); break;
          default: break;
        }


        return prevVisibleColumns.filter((col) => col !== columnId);
      } else {

        switch(columnId){
          case 'description':
          case 'qty':
          case 'firstOrder':   
          case 'amArtwork': 
            setGroupHeaderCol({
              ...groupHeaderCol,
              am: (groupHeaderCol.am+1)
            }); break;  
          case 'patternReleasing':
          case 'productSpecs':
          case 'packagingSpecs':
          case 'pdMoldAvailability':
          case 'pdSampleReference': 
            setGroupHeaderCol({
              ...groupHeaderCol,
              pd: (groupHeaderCol.pd+1)
            }); break;
          case 'firstCarcass':
          case 'completionCarcass':
          case 'firstArtwork':
          case 'completionArtwork':
          case 'firstPackagingMaterial':
          case 'completionPackagingMaterial':
          case 'puPatternAvailability':
          case 'puMoldAvailability':
            setGroupHeaderCol({
              ...groupHeaderCol,
              pu: (groupHeaderCol.pu+1)
            }); break;
          case 'carcass':
          case 'artwork':
          case 'packagingMaterial':
          case 'crd':
            setGroupHeaderCol({
              ...groupHeaderCol,
              prod: (groupHeaderCol.prod+1)
            }); break;
          case 'poptDate':
          case 'qaSampleReference':
          case 'psiDate':
            setGroupHeaderCol({
              ...groupHeaderCol,
              qa: (groupHeaderCol.qa+1)
            }); break;
          default: break;
        }

        return [...prevVisibleColumns, columnId];
      }
    });
  };

  // DATA TABLE FOR BULK EDIT --END

  const handleAddRow = async () => {

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
      amArtwork: 1,
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
      puPatternAvailability: 1,
      puMoldAvailability: 1,
      carcass: null,
      artwork: null,
      packagingMaterial: null,
      crd: null,
      poptDate: null,
      qaSampleReference: 1,
      psiDate: null
    }

    await dispatch(createOrderItem(emptyDataRow));

    await dispatch(getCountOrderItemStatusOpen(id));
    
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
      
      if(newRow.itemCode !== oldRow.itemCode){

        //setRows([]);

        await dispatch(updateCellOrderItemWithItemCode(oldRow.id,{itemCode:newRow.itemCode.toUpperCase()}));

        await dispatch(getCountOrderItemStatusOpen(id));
      
        setSnackbar({ children: 'Successfully update cell', severity: 'success' });

        await dispatch(getOrderItems(id));
        //
        return await newRow;
         
      }
      else{
        await dispatch(updateCellOrderItem(oldRow.id,newRow));

        await dispatch(getCountOrderItemStatusOpen(id));
      
        setSnackbar({ children: 'Successfully update cell', severity: 'success' });
        return await newRow;
      }
      
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
          <GridToolbarColumnsButton />
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

  // Edit Cell in Bulk Start
  const [valueEditCellInBulk,setValueEditCellInBulk] = useState(null);
  const [valueColumnEditCellInBulk,setValueColumnEditCellInBulk] = useState(null);
  const [pdYesNo,setPdYesNo] = useState(1);
  const [selectedRowsEditCellInBulk, setSelectedRowsEditCellInBulk] = useState([]);

  const [dateBulk,setDateBulk] = useState(null);
  
  const [selectAllEditCellInBulk, setSelectAllEditCellInBulk] = useState(false);
  const columnsDate = [
    {
      department:'pd',
      children:[
        {id:'patternReleasing',name:'Pattern Releasing'},
        {id:'productSpecs',name:'Product Specs'},
        {id:'packagingSpecs',name:'Packaging Specs'},
        {id:'pdMoldAvailability',name:'Mold Availability'},
        {id:'pdSampleReference',name:'Sample Reference'},
      ]
    },
    {
      department:'pu',
      children:[
        {id:'firstCarcass',name:'First Carcass'},
        {id:'completionCarcass',name:'Completion Carcass'},
        {id:'firstArtwork',name:'First Artwork'},
        {id:'completionArtwork',name:'Completion Artwork'},
        {id:'firstPackagingMaterial',name:'First Packaging Material'},
        {id:'completionPackagingMaterial',name:'Completion Packaging Material'},
        {id:'puPatternAvailability',name:'Pattern Availability'},
        {id:'puMoldAvailability',name:'Mold Availability'},
      ]
    },
    {
      department:'prod',
      children:[
        {id:'carcass',name:'Carcass'},
        {id:'artwork',name:'Artwork'},
        {id:'packagingMaterial',name:'Packaging Material'},
        {id:'crd',name:'CRD'},
      ]
    },
    {
      department:'qa',
      children:[
        {id:'poptDate',name:'POPT Date'},
        {id:'qaSampleReference',name:'Sample Reference'},
        {id:'psiDate',name:'PSI Date'},
      ]
    },
  ];

  const dateColumns = () => {
    if(valueEditCellInBulk !== null){
      return columnsDate.map(col => {
        if(col?.department === valueEditCellInBulk){
            return col?.children.map(row => {
               return <MenuItem value={row.id}>{row?.name}</MenuItem>
            })
        }
      }) 
    }
  }
    

  const handleChangeEditCellInBulkDepartment = (e) => {


    /*
     <MenuItem value='pd'>PD Commitment</MenuItem>
      <MenuItem value='pu'>Purchasing Commitment</MenuItem>
      <MenuItem value='prod'>Production Commitment</MenuItem>
      <MenuItem value='qa'>QA Commitment</MenuItem>
    */

    setSelectedRowsEditCellInBulk([])
    setValueEditCellInBulk(e.target.value);
    setDateBulk(null)
    //setSnackbar({ children: 'Successfully update cell', severity: 'success' });
  };

  const handleChangeColumnEditCellInBulkDepartment = (e) => {
    setValueColumnEditCellInBulk(e.target.value);
    //setSnackbar({ children: 'Successfully update cell', severity: 'success' });
  };

  const handleMasterCheckboxChange = () => {
    const allIds = rows.map((row) => row.id);
    if (selectAllEditCellInBulk) {
      // If master checkbox is unchecked, clear all selected rows
      setSelectedRowsEditCellInBulk([]);
    } else {
      // If master checkbox is checked, select all rows
      setSelectedRowsEditCellInBulk(allIds);
    }
    setSelectAllEditCellInBulk(!selectAllEditCellInBulk);
  };

  const handleCheckboxChangeEditCellInBulk = (id) => {
    // Check if the row is already selected
    const isSelected = selectedRowsEditCellInBulk.includes(id);

    // If selected, remove from the array; otherwise, add to the array
    setSelectedRowsEditCellInBulk((prevSelected) =>
      isSelected
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };


  const handleSaveEditCellInBulk = async () =>{

    setDataGridLoading(true);

    if(currentStatus !== 'OPEN'){
      setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }

    //check dept
    const comDepartment = user?.result?.department?.department;
    let newVal = 'AM';

    if(comDepartment === 'PD'){
      newVal = 'pd'
    }else if(comDepartment === 'PURCHASING'){
      newVal = 'pu'
    }else if(comDepartment === 'PRODUCTION'){
      newVal = 'prod'
    }else if(comDepartment === 'QA'){
      newVal = 'qa'
    }

    if(comDepartment !== 'AM' && (newVal !== valueEditCellInBulk)){
      setSnackbar({ children: `you are not allowed to edit others department commitment`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }

    // no selection
    if(selectedRowsEditCellInBulk.length === 0){
      setSnackbar({ children: `no selected rows`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }
    else if(!valueColumnEditCellInBulk){
      setSnackbar({ children: `no Column selectted to edit`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }else if(moment(dateBulk) <= moment(currentPO.dateIssued) || moment(dateBulk) >= moment(currentPO.shipDate)){ //glensongwapo
      setSnackbar({ children: `date inputed is invalid`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }

    // success
    if(valueColumnEditCellInBulk === 'puPatternAvailability'  || valueColumnEditCellInBulk === 'puMoldAvailability' || valueColumnEditCellInBulk === 'qaSampleReference'){
      await dispatch(updateCellOrderItemInBulk({ids:selectedRowsEditCellInBulk,column:valueColumnEditCellInBulk,val:pdYesNo}));
      
    }else{
      await dispatch(updateCellOrderItemInBulk({ids:selectedRowsEditCellInBulk,column:valueColumnEditCellInBulk,val:dateBulk}));                                                                                                                    
    }
    

    const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
    const edit = {
      [valueEditCellInBulk+"Com"]:{
        editedBy: newUser,
        updatedAt: moment(),
      }
    }
    await dispatch(getOrderItemsNoLoading(id));

   await dispatch(updateCellEditedBy(id,{edit}));
   //action to update
   await dispatch(getCountOrderItemStatusOpen(id));

    setSnackbar({ children: 'Successfully edit selected rows', severity: 'success' });
    //close and clear

    // clear
    setValueEditCellInBulk(null);
    setValueColumnEditCellInBulk(null);
    setPdYesNo(1);
    setDateBulk(null);
    setSelectAllEditCellInBulk(false);

    setDataGridLoading(false);
  }

  const handleClearDateOrderItemInBulk = async () =>{

    setDataGridLoading(true);
  
    if(currentStatus !== 'OPEN'){
      setSnackbar({ children: `disable from edit due to status ${currentStatus}`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }

    // no selection
    if(selectedRowsEditCellInBulk.length === 0){
      setSnackbar({ children: `no selection selection`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }
    else if(!valueColumnEditCellInBulk){
      setSnackbar({ children: `no column selected to edit`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }

    // success
    if(valueColumnEditCellInBulk === 'puPatternAvailability' || valueColumnEditCellInBulk === 'puMoldAvailability' || valueColumnEditCellInBulk === 'qaSampleReference'){
      setSnackbar({ children: `column selected is dont have a date values`, severity: 'warning' });
      setDataGridLoading(false);
      return;
    }else{
      await dispatch(clearDateOrderItemInBulk({ids:selectedRowsEditCellInBulk,column:valueColumnEditCellInBulk}));                                                                                                                    
    }
    

    const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
    const edit = {
      [valueEditCellInBulk+"Com"]:{
        editedBy: newUser,
        updatedAt: moment(),
      }
    }
    await dispatch(getOrderItemsNoLoading(id));

    await dispatch(updateCellEditedBy(id,{edit}));
   //action to update
    await dispatch(getCountOrderItemStatusOpen(id));

    setSnackbar({ children: 'Successfully clear date of selected row', severity: 'success' });
    //close and clear

    // clear
    setValueEditCellInBulk(null);
    setValueColumnEditCellInBulk(null);
    setPdYesNo(1);
    setDateBulk(null);
    setSelectAllEditCellInBulk(false);
    //close diaglog clear date
    handleCloseDialogClearDate();

    setDataGridLoading(false);
  }

  // Edit Cell in Bulk End
  const rowsWithRowNumber = rows.map((row, index) => ({ ...row, headerRowNumber: index + 1 }));
 

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
          <Button size="medium" variant="contained" color="info" onClick={() => { setDataGridLoading(true); dispatch(getOrderItemsImages(id));}} startIcon={<FileDownload/>}>
            Export All Images
          </Button>
          <Button size="medium" variant="contained" color="success" onClick={() => exportToExcel()} startIcon={<FileDownload/>}>
            Export to excel
          </Button>
          <Button size="medium" variant="contained" color="warning" onClick={handleOpenDialogEditBulk} startIcon={<EditCalendar/>}>
            Edit Cell in Bulk
          </Button>
        </Stack>
        </Box>
        <Box sx={{ maxHeight: 600, width: '100%',mt:1 }}>
        <div style={{ height: 700, width: '100%' }}>
          <Typography>
            Total Rows : {rows.length}
          </Typography>
        <DataGrid
          rows={rowsWithRowNumber}
          columns={columns}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 200} 
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
        </div>
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
              <Button onClick={handleCloseDialog} startIcon={<CancelPresentation/>} variant="contained" color="warning">Cancel</Button>
              {imageData?.rowSelected?.itemCode != null ? 
                <Button onClick={()=>{
                  if(imageData?.image === NoImage){
                    alert('No Image to Download')
                  }else{
                    triggerBase64Download(imageData?.image, imageData?.rowSelected?.itemCode)
                  }
                }}
                  variant="contained" color="error" startIcon={<Download/>}>
                    DOWNLOAD 
              </Button>: null}
              {user?.result?.department?.department === 'AM' &&
                <Button onClick={handleUploadImage} startIcon={<Upload/>} variant="contained">Upload Image</Button>
              }
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
              <Button variant="contained" color="error" startIcon={<CancelPresentation/>} onClick={handleCloseDialogDeleteRow}>Cancel</Button>
              <Button variant="contained" color="info" startIcon={<DeleteForever/>} onClick={handleDeleteRow} autoFocus>
                Delete Row
              </Button>
            </DialogActions>
            <DialogActions>
              <Button variant="contained" color="warning" startIcon={<DeleteSweep/>} onClick={handleDeleteCommitedDates}>Delete Commited Dates Only</Button>
            </DialogActions>
          </Dialog>
          {/* Dialog for delete row */}

          {/* Dialog for delete row */}
          <Dialog
            open={openDialogClearDate}
            onClose={handleCloseDialogClearDate}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Are you sure, you want to clear Dates of selected rows ?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Note: once deleted it will never be undo.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="error" startIcon={<CancelPresentation/>} onClick={handleCloseDialogClearDate}>Cancel</Button>
              <Button variant="contained" color="info" startIcon={<DeleteForever/>} onClick={handleClearDateOrderItemInBulk} autoFocus>
                Clear Date
              </Button>
            </DialogActions>
          </Dialog>
          {/* Dialog for delete row */}

          {/* Dialog bulk edit */}
          <Dialog
            open={openDialogEditBulk}
            onClose={handleCloseDialogEditBulk}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth={true}
            maxWidth={'xl'}
            fullScreen
          >
            <DialogTitle id="alert-dialog-title">
              Edit Cell in Bulk
            </DialogTitle>
            <DialogContent>
              <Box sx={{ maxHeight: 1200, width: '100%',mt:1 }}>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <div style={{marginBlock:10}}>
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
                      <Typography>Show / Hide Columns</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                   {/* hide show column */}
                  <Grid container spacing={2} justifyContent="flex-start" direction='row' sx={{mb:2}}>
                    {/* AM */}
                    <Grid >  
                      <Typography>AM Department</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                          <FormControlLabel
                            label="Description"
                            control={<Checkbox
                            checked={visibleColumns.includes('description')}
                            onChange={() => handleCheckboxChange('description')} />}
                          />
                          <FormControlLabel
                            label="Qty"
                            control={<Checkbox
                              checked={visibleColumns.includes('qty')}
                              onChange={() => handleCheckboxChange('qty')} />}
                          />
                           <FormControlLabel
                            label="1st Order"
                            control={<Checkbox
                              checked={visibleColumns.includes('firstOrder')}
                              onChange={() => handleCheckboxChange('firstOrder')} />}
                          />
                           <FormControlLabel
                            label="With Artwork"
                            control={<Checkbox
                              checked={visibleColumns.includes('amArtwork')}
                              onChange={() => handleCheckboxChange('amArtwork')} />}
                          />
                        </Box>
                    </Grid>
                    {/* PD */}
                    <Grid >  
                      <Typography>PD Department</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                          <FormControlLabel
                            label="Pattern Releasing"
                            control={<Checkbox
                            checked={visibleColumns.includes('patternReleasing')}
                            onChange={() => handleCheckboxChange('patternReleasing')} />}
                          />
                          <FormControlLabel
                            label="Product Specs"
                            control={<Checkbox
                              checked={visibleColumns.includes('productSpecs')}
                              onChange={() => handleCheckboxChange('productSpecs')} />}
                          />
                           <FormControlLabel
                            label="Packaging Specs"
                            control={<Checkbox
                              checked={visibleColumns.includes('packagingSpecs')}
                              onChange={() => handleCheckboxChange('packagingSpecs')} />}
                          />
                          <FormControlLabel
                            label="Mold Availability"
                            control={<Checkbox
                              checked={visibleColumns.includes('pdMoldAvailability')}
                              onChange={() => handleCheckboxChange('pdMoldAvailability')} />}
                          />
                          <FormControlLabel
                            label="Sample Reference"
                            control={<Checkbox
                              checked={visibleColumns.includes('pdSampleReference')}
                              onChange={() => handleCheckboxChange('pdSampleReference')} />}
                          />
                        </Box>
                    </Grid>
                    {/* PU */}
                    <Grid >  
                      <Typography>Purchasing Department</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                          <FormControlLabel
                            label="First Carcass"
                            control={<Checkbox
                            checked={visibleColumns.includes('firstCarcass')}
                            onChange={() => handleCheckboxChange('firstCarcass')} />}
                          />
                          <FormControlLabel
                            label="Completion Carcass"
                            control={<Checkbox
                              checked={visibleColumns.includes('completionCarcass')}
                              onChange={() => handleCheckboxChange('completionCarcass')} />}
                          />
                           <FormControlLabel
                            label="First Artwork"
                            control={<Checkbox
                              checked={visibleColumns.includes('firstArtwork')}
                              onChange={() => handleCheckboxChange('firstArtwork')} />}
                          />
                          <FormControlLabel
                            label="Completion Artwork"
                            control={<Checkbox
                              checked={visibleColumns.includes('completionArtwork')}
                              onChange={() => handleCheckboxChange('completionArtwork')} />}
                          />
                          <FormControlLabel
                            label="First Packaging Material"
                            control={<Checkbox
                              checked={visibleColumns.includes('firstPackagingMaterial')}
                              onChange={() => handleCheckboxChange('firstPackagingMaterial')} />}
                          />
                           <FormControlLabel
                            label="Completion Packaging Material"
                            control={<Checkbox
                              checked={visibleColumns.includes('completionPackagingMaterial')}
                              onChange={() => handleCheckboxChange('completionPackagingMaterial')} />}
                          />
                           <FormControlLabel
                            label="Pattern Availabilty"
                            control={<Checkbox
                              checked={visibleColumns.includes('puPatternAvailability')}
                              onChange={() => handleCheckboxChange('puPatternAvailability')} />}
                          />
                          <FormControlLabel
                            label="Mold Availabilty"
                            control={<Checkbox
                              checked={visibleColumns.includes('puMoldAvailability')}
                              onChange={() => handleCheckboxChange('puMoldAvailability')} />}
                          />
                        </Box>
                    </Grid>
                    {/* PROD */}
                    <Grid >  
                      <Typography>Production Department</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                          <FormControlLabel
                            label="Carcass"
                            control={<Checkbox
                            checked={visibleColumns.includes('carcass')}
                            onChange={() => handleCheckboxChange('carcass')} />}
                          />
                          <FormControlLabel
                            label="Artwork"
                            control={<Checkbox
                              checked={visibleColumns.includes('artwork')}
                              onChange={() => handleCheckboxChange('artwork')} />}
                          />
                           <FormControlLabel
                            label="Packaging Material"
                            control={<Checkbox
                              checked={visibleColumns.includes('packagingMaterial')}
                              onChange={() => handleCheckboxChange('packagingMaterial')} />}
                          />
                          <FormControlLabel
                            label="CRD"
                            control={<Checkbox
                              checked={visibleColumns.includes('crd')}
                              onChange={() => handleCheckboxChange('crd')} />}
                          />
                        </Box>
                    </Grid>
                    {/* QA */}
                    <Grid >  
                        <Typography>QA Department</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                          <FormControlLabel
                            label="POPT Date"
                            control={<Checkbox
                            checked={visibleColumns.includes('poptDate')}
                            onChange={() => handleCheckboxChange('poptDate')} />}
                          />
                          <FormControlLabel
                            label="Sample Reference"
                            control={<Checkbox
                              checked={visibleColumns.includes('qaSampleReference')}
                              onChange={() => handleCheckboxChange('qaSampleReference')} />}
                          />
                           <FormControlLabel
                            label="PSI Date"
                            control={<Checkbox
                              checked={visibleColumns.includes('psiDate')}
                              onChange={() => handleCheckboxChange('psiDate')} />}
                          />
                        </Box>
                    </Grid>
                  </Grid>
                      {/* hide show column */}
                  </AccordionDetails>
                  </Accordion>
                  </div>

                  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={dataGridLoading}>
                    <CircularProgress color="inherit" />
                  </Backdrop>
                  
                  <TableContainer sx={{ maxHeight: 500 }}>
                      <Table stickyHeader aria-label="sticky table" size='small'>
                        <TableHead>
                          <TableRow 
                          sx={{"& .MuiTableCell-head": {
                                color: "white",
                                backgroundColor: "#6F1E51",
                                border: '1px solid #e0e0e0',
                                zIndex:900
                            }}}
                            >
                            <CustomGroupHeader colSpan={groupHeaderCol.am} show={groupHeaderCol.am} label="AM Department" />
                            <CustomGroupHeader colSpan={groupHeaderCol.pd} show={groupHeaderCol.pd} label="PD Department" />
                            <CustomGroupHeader colSpan={groupHeaderCol.pu} show={groupHeaderCol.pu}label="Purchasing Department" />
                            <CustomGroupHeader colSpan={groupHeaderCol.prod} show={groupHeaderCol.prod} label="Production Department" /> 
                            <CustomGroupHeader colSpan={groupHeaderCol.qa} show={groupHeaderCol.qa} label="QA Department" /> 
                         </TableRow>
                          <TableRow  sx={{"& .MuiTableCell-head": {
                                color: "white",
                                backgroundColor: "#6F1E51",
                                border: '1px solid #e0e0e0',
                                paddingTop:5
                            }}}>
                          {

                            columnsTable
                            .filter((column) => visibleColumns.includes(column.id))
                            .map((columnTable) => (
                              columnTable.label === 'Select All' ?
                                <TableCell
                                  key={columnTable.id}
                                  align={columnTable.align}
                                  style={{ minWidth: columnTable.minWidth }}
                                >
                                  {columnTable.label}
                                  <Checkbox
                                    checked={selectAllEditCellInBulk}
                                    onChange={handleMasterCheckboxChange}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                  />
                                </TableCell> 
                                :
                                 <TableCell
                                  key={columnTable.id}
                                  align={columnTable.align}
                                  style={{ minWidth: columnTable.minWidth }}
                                >
                                  {columnTable.label}
                                </TableCell>
                          ))
                            }
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {
                          rowsWithRowNumber.map((row, i) => (
                            <TableRow  hover role="checkbox" tabIndex={-1} key={i}>
                              {columnsTable
                                .filter((columnTable) => visibleColumns.includes(columnTable.id))
                                .map((columnTable) => {
                                  const value = row[columnTable.id];
                                    const tableCellData = () => {
                                      if(columnTable.id === '_id')
                                        return <Checkbox
                                          checked={selectedRowsEditCellInBulk.includes(row.id)}
                                          onChange={() => handleCheckboxChangeEditCellInBulk(row.id)}
                                          inputProps={{ 'aria-label': 'controlled' }}
                                        />
                                      else if(columnTable.id === 'firstOrder')
                                        return value == 1 ? <Chip label="YES" color="success" /> : <Chip label="NO" color="error" variant="outlined" />
                                      else if(columnTable.type === 'boolean')
                                        return value === 0 ? <Chip label="NO" color="warning" variant="outlined" /> : <Chip label="YES" color="info" /> 
                                      else if(columnTable.type === 'number')
                                        return Number(value)
                                      else if(columnTable.type === 'date')
                                        return value ? moment(new Date(value)).format('L') : null
                                      else
                                        return value
                                    }

                                    return (
                                      <TableCell key={columnTable.id} align={columnTable.align} style={{ border: '1px solid #e0e0e0' }}>
                                      {/* {columnTable.format && typeof value === 'number'
                                          ? columnTable.format(value)
                                          : value} */}
                                          {tableCellData()}
                                      </TableCell>
                                    );

                                  })}
                            </TableRow>
                          ))}
                      </TableBody>
                      </Table>
                  </TableContainer>
                  </Paper>
              </Box>
              <Box sx={{ width: '100%',mt:5}}>
              <Grid container spacing={2} justifyContent="center" >  
                <Grid xs={6} md={3} lg={3}>
                  <Grid container spacing={4} justifyContent="flex-start">
                    <FormControl component='div' variant='outlined' sx={{width:'70%',ml:5}}>
                      <InputLabel id='test-select-label'>Department Commitment</InputLabel>
                        <Select
                            value={valueEditCellInBulk}
                            autoWidth
                            onChange={(e)=>handleChangeEditCellInBulkDepartment(e)}
                            label="Department Commitment"
                          >
                            <MenuItem value='pd'>PD Commitment</MenuItem>
                            <MenuItem value='pu'>Purchasing Commitment</MenuItem>
                            <MenuItem value='prod'>Production Commitment</MenuItem>
                            <MenuItem value='qa'>QA Commitment</MenuItem>
                        </Select>
                       
                      </FormControl>
                   </Grid>
                </Grid>
                <Grid xs={6} md={2} lg={2 }>
                    
                </Grid>
                <Grid xs={6} md={5} lg={5}>
                  <Grid container spacing={4} justifyContent="flex-start">
                    <FormControl component='div' variant='outlined' sx={{width:'50%',mr:3}}>
                      <InputLabel id='pd column'>Date Column</InputLabel>
                        <Select
                            value={valueColumnEditCellInBulk}
                            autoWidth
                            defaultValue={null}
                            onChange={(e)=>handleChangeColumnEditCellInBulkDepartment(e)}
                            label="Date Column"
                          >
                            {
                              dateColumns()
                            }
                            
                        </Select>
                        <Typography sx={{mt:3}}>
                          Note: If the selected row already have a date commited, it will skip this edit action.
                        </Typography>
                        {/* CLEAR BUTTON */}
                        { comDepartment === 'AM' && 
                          <Button variant="contained" color="warning" startIcon={<CancelPresentation/>} onClick={handleOpenDialogClearDate}>CLEAR DATES</Button>
                        }
                      </FormControl>
                      <div style={{display: 
                        valueColumnEditCellInBulk === 'puPatternAvailability'|| valueColumnEditCellInBulk === 'puMoldAvailability' || valueColumnEditCellInBulk === 'qaSampleReference' 
                        ? 'none' : 'block'}}>
                        <DatePicker label="Date Bulk Edit" maxDate={moment().add(2,'y')} minDate={moment().add(-1,'y')}  onChange={(e)=>setDateBulk(e)} value={moment(dateBulk)}/>
                      </div>
                      <div style={{display: 
                        valueColumnEditCellInBulk === 'puPatternAvailability' || valueColumnEditCellInBulk === 'puMoldAvailability' || valueColumnEditCellInBulk === 'qaSampleReference' 
                        ? 'block' : 'none'}}>
                        <Select
                              value={pdYesNo}
                              autoWidth
                              defaultValue={null}
                              onChange={(e)=>setPdYesNo(e.target.value)}
                              label="Value"
                            >
                            <MenuItem value={1}>Yes</MenuItem>
                            <MenuItem value={0}>No</MenuItem>
                        </Select>
                      </div>
                   </Grid>
                </Grid>
                
              </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="error" startIcon={<CancelPresentation/>} onClick={handleCloseDialogEditBulk}>Close Dialog</Button>
              <Button variant="contained" color="info" startIcon={<Save/>} onClick={handleSaveEditCellInBulk} autoFocus>
                Execute Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog for bulk edit */}

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