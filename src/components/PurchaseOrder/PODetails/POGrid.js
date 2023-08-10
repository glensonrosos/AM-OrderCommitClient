import React,{useState,useEffect} from 'react';
import { DataGrid,GridToolbar } from '@mui/x-data-grid';
import {Snackbar,Alert,Button,Box,Switch,ImageList,Stack,Backdrop,CircularProgress, Typography} from '@mui/material';
import {Delete,Image,} from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';

import { useParams } from 'react-router';
import moment from 'moment';
import FileBase64 from 'react-file-base64';

import { useDispatch,useSelector } from 'react-redux';
import { getOrderItems,createOrderItem,updateCellOrderItem,deleteOrderItem,getOrderItemImage } from '../../../actions/orderitems';
import NoImage from '../../images/NoImage.jpeg'

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText'


const columnGroupingModel = [
  {
    groupId: 'Order Details',
    headerAlign:"center",
    description: 'Order Datails',
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
    description: 'PD Commitment',
    children: [
      { field: 'patternReleasing'},
      { field: 'productSpecs'},
      { field: 'packagingSpecs'},
    ],
  },
  {
    groupId: 'Purchasing Commited Dates',
    headerAlign:"center",
    description: 'Purchasing Commitment',
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
    description: 'Qa Commitment',
    children: [
      { field: 'poptDate'},
      { field: 'psiDate'}
    ],
  }
];


export default function ServerSidePersistence() {
  //const mutateRow = useFakeMutation();
  const [snackbar, setSnackbar] = React.useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);
  const [rows,setRows] = useState([]);

  const {id} = useParams();

  const dispatch = useDispatch();
  const {isLoading,orderItems} = useSelector(state=> state.orderItems);
  const [dataGridLoading,setDataGridLoading] = useState(false);


  const [openDialog, setOpenDialog] = useState(false);
  
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

  const handleUploadImage = () =>{
    if(imageData?.image === NoImage || imageData?.image === imageData.rowSelected.image ){
      alert('no image attached');
    }else{
      dispatch(updateCellOrderItem(imageData.rowSelected.id,{...imageData.rowSelected,image:imageData.image}));
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

  const handleDeleteRow = () =>{
      dispatch(deleteOrderItem(toBeDeleteRow?.rowSelected?._id));
      setSnackbar({ children: 'Successfully uploaded image', severity: 'success' });
      handleCloseDialogDeleteRow();
  }


  const RenderFirstOrder = (newRow) =>{
  
    const [checked, setChecked] = React.useState(newRow.firstOrder);

    const handleChange = (e) => {
      setChecked(e.target.checked);
      newRow.firstOrder = e.target.checked;
      dispatch(updateCellOrderItem(newRow?.id,newRow));
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
      dispatch(getOrderItems(id));
  }, [dispatch]);

  useEffect(()=>{
    if(!isLoading && orderItems){
      setRows(orderItems);  
    }
  },[orderItems]);

  useEffect(() => {
    setTimeout(() => {
      setDataGridLoading(false);  
    }, 2000);
  }, [rows]);


  const columns = [
    { 
      field: 'itemCode',
      headerName: 'Item Code',
      type:'string',
      editable: true,
      headerClassName: 'super-app-theme--header',
      width:130, maxWidth:200, minWidth:80, 
    },
    {
      field: 'image',
      headerName: 'Image',
      renderCell: (params) => RenderUpload(params.row),
    },
    {
      field: 'description',
      headerName: 'Description',
      type: 'string',
      editable: true,
      width: 200,minWidth: 80, maxWidth: 250,
    },
    {
      field: 'qty',
      headerName: 'Qty',
      type: 'number',
      editable: true,
      width: 80,minWidth: 30, maxWidth: 100,
    },
    {
      field: 'firstOrder',
      headerName: '1st Order?',
      width: 80,minWidth: 30, maxWidth: 100,
      renderCell: (params) => RenderFirstOrder(params.row),
    },
    {
      field: 'patternReleasing',
      headerName: 'Pattern Releasing',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'productSpecs',
      headerName: 'Product Specs',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'packagingSpecs',
      headerName: 'Packaging Specs',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'firstCarcass',
      headerName: 'First Carcass',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    ,
    {
      field: 'completionCarcass',
      headerName: 'Completion Carcass',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'firstArtwork',
      headerName: 'First Artwork',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'completionArtwork',
      headerName: 'Completion Artwork',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'firstPackagingMaterial',
      headerName: 'First Packaging Material',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'completionPackagingMaterial',
      headerName: 'Completion Packaging Material',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'carcass',
      headerName: 'Carcass',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'artwork',
      headerName: 'Artwork',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'packagingMaterial',
      headerName: 'Packaging Material',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'crd',
      headerName: 'CRD',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'poptDate',
      headerName: 'POPT Date',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    },
    {
      field: 'psiDate',
      headerName: 'PSI Date',
      type: 'date',
      width: 95,minWidth: 30, maxWidth: 100,
      editable: true,
      valueFormatter: (params) =>(params.value !== null ? moment(params?.value).format('L') : null)
    }
  ];


  const handleAddRow = () => {

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
      dispatch(updateCellOrderItem(oldRow.id,newRow));
      setSnackbar({ children: 'Successfully update cell', severity: 'success' });
      return await newRow;
  }

  const handleProcessRowUpdateError = async (error) =>{
      setSnackbar({ children: 'Error during update', severity: 'error' });
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
          <Button size="medium" variant="contained" color="primary" onClick={handleAddRow}>
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
            toolbar: GridToolbar,
          }}
          density="compact"
          
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

              <FileBase64
                multiple={ false }
                onDone={({base64})=> setImageData({
                  ...imageData,
                  image:base64
                })} />
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
            autoHideDuration={4000}
          > 
            <Alert {...snackbar} onClose={handleCloseSnackbar} variant="filled" />
          </Snackbar>
        )}
      </Grid>
    </Grid>
  );
}