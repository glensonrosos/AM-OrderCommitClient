import * as React from 'react';
import { DataGrid,GridToolbar } from '@mui/x-data-grid';
import {Snackbar,Alert,Button,Box,Switch, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';


const useFakeMutation = () => {
  return React.useCallback(
    (user) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (user.name?.trim() === '') {
            reject(new Error("Error while saving user: name can't be empty."));
          } else {
            resolve({ ...user, name: user.name?.toUpperCase() });
          }
        }, 200);
      }),
    [],
  );
};

const RenderUpload = () =>{
  return(
  
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <Button variant="contained" color="primary" size="small" fullWidth  > Upload </Button>
      <Box sx={{mt:5}}/>
      <Button variant="contained" color="primary" size="small" fullWidth  > View </Button>
    </Grid>
  )
};

const RenderFirstOrder = () =>{
  return(
    <Switch />
  )  
}

export default function ServerSidePersistence() {
  const mutateRow = useFakeMutation();

  const [snackbar, setSnackbar] = React.useState(null);

  const handleCloseSnackbar = () => setSnackbar(null);

  const processRowUpdate = React.useCallback(
    async (newRow) => {
      // Make the HTTP request to save in the backend
      const response = await mutateRow(newRow);
      setSnackbar({ children: 'User successfully saved', severity: 'success' });
      return response;
    },
    [mutateRow],
  );

  const handleProcessRowUpdateError = React.useCallback((error) => {
    setSnackbar({ children: error.message, severity: 'error' });
  }, []);

  return (
    // <div style={{ height: 400, width: '100%' }}>
      
    // </div>
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid md={11} lg={11}>
        <Box sx={{ height: 600, width: '100%',mt:5 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          getRowHeight={() => 'auto'} getEstimatedRowHeight={() => 200} 
          pageSizeOptions={[]}
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
        {!!snackbar && (
          <Snackbar
            open
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            onClose={handleCloseSnackbar}
            autoHideDuration={6000}
          > 
            <Alert {...snackbar} onClose={handleCloseSnackbar} />
          </Snackbar>
        )}
      </Grid>
    </Grid>
  );
}

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
    renderCell: RenderUpload,
  },
  {
    field: 'description',
    headerName: 'Description',
    type: 'string',
    editable: true,
    width: 200,minWidth: 80, maxWidth: 250,
    // align: 'left',
    // headerAlign: 'left',
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
    renderCell: RenderFirstOrder,
  },
  {
    field: 'patternReleasing',
    headerName: 'Pattern Releasing',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'productSpecs',
    headerName: 'Product Specs',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'packagingSpecs',
    headerName: 'Packaging Specs',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'firstCarcass',
    headerName: 'First Carcass',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  ,
  {
    field: 'completionCarcass',
    headerName: 'Completion Carcass',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'firstArtwork',
    headerName: 'First Artwork',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'completionArtwork',
    headerName: 'Completion Artwork',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'firstPackagingMaterial',
    headerName: 'First Packaging Material',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'completionPackagingMaterial',
    headerName: 'Completion Packaging Material',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'carcass',
    headerName: 'Carcass',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'artwork',
    headerName: 'Artwork',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'packagingMaterial',
    headerName: 'Packaging Material',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'crd',
    headerName: 'CRD',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'poptDate',
    headerName: 'POPT Date',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  },
  {
    field: 'psiDate',
    headerName: 'PSI Date',
    type: 'date',
    width: 95,minWidth: 30, maxWidth: 100,
    editable: true,
  }
  // {
  //   field: 'lastLogin',
  //   headerName: 'Last Login',
  //   type: 'dateTime',
  //   width: 220,
  //   editable: true,
  // },
];

const rows = [
   //3/31/2023 
   {
    id: 1,
    itemCode: 'MFP1553CA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: null,
    productSpecs: null,
    packagingSpecs: null,
    firstCarcass: null,
    completionCarcass: null,
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 2,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 4,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 5,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 6,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 7,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 8,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 9,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  {
    id: 10,
    itemCode: 'MFP1553CHA',
    image: null,
    description:'Basketweave Hose Pot Grey Basketweave Hose Pot Grey',
    qty:100,
    firstOrder:null,
    patternReleasing: new Date('3/31/2023'),
    productSpecs: new Date('3/31/2023'),
    packagingSpecs: new Date('3/31/2023'),
    firstCarcass: new Date('3/31/2023'),
    completionCarcass: new Date('3/31/2023'),
    firstArtwork: new Date('3/31/2023'),
    completionArtwork: new Date('3/31/2023'),
    firstPackagingMaterial: new Date('3/31/2023'),
    completionPackagingMaterial: new Date('3/31/2023'),
    carcass: new Date('3/31/2023'),
    artwork: new Date('3/31/2023'),
    packagingMaterial: new Date('3/31/2023'),
    crd: new Date('3/31/2023'),
    poptDate: new Date('3/31/2023'),
    psiDate: new Date('3/31/2023')
  },
  // {
  //   id: 2,
  //   name: randomTraderName(),
  //   age: 36,
  //   dateCreated: randomCreatedDate(),
  //   lastLogin: randomUpdatedDate(),
  // },
  // {
  //   id: 3,
  //   name: randomTraderName(),
  //   age: 19,
  //   dateCreated: randomCreatedDate(),
  //   lastLogin: randomUpdatedDate(),
  // },
  // {
  //   id: 4,
  //   name: randomTraderName(),
  //   age: 28,
  //   dateCreated: randomCreatedDate(),
  //   lastLogin: randomUpdatedDate(),
  // },
  // {
  //   id: 5,
  //   name: randomTraderName(),
  //   age: 23,
  //   dateCreated: randomCreatedDate(),
  //   lastLogin: randomUpdatedDate(),
  // },
];