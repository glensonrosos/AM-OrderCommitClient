import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box,Button,Autocomplete,TextField} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import {Add} from '@mui/icons-material';

import DeptBadge from './DeptBadge/DeptBadge'

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

const rows = [
  createData('FG0015140502', '02/07/2023', 'FrontGate', '02/09/2023','Open','Purchasing'),
  createData('FG0015140502', '02/07/2023', 'FrontGate', '02/09/2023','Open','Purchasing'),
  createData('FG0015140502', '02/07/2023', 'FrontGate', '02/09/2023','Open','Purchasing'),
  createData('FG0015140502', '02/07/2023', 'FrontGate', '02/09/2023','Open','Purchasing'),
  createData('FG0015140502', '02/07/2023', 'FrontGate', '02/09/2023','Open','Purchasing'),
  createData('FG0015140502', '02/07/2023', 'FrontGate', '02/09/2023','Open','Purchasing'),
  createData('FG0015140502', '02/07/2023', 'FrontGate', '02/09/2023','Open','Purchasing'),
];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const top100Films = [
    { label: 'PO #', year: 1994 },
    { label: 'Date Issued', year: 1972 },
    { label: 'Buyer', year: 1974 },
    { label: 'Ship Date', year: 1974 },
    { label: 'Status', year: 1974 },
    { label: 'Require Attention', year: 1974 },
  ];

  

  return (

    <Box mt={5}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid xs={6} md={5} lg={5}>
                <DeptBadge/>
                <Box mt={2}/>
                <Button variant="contained" size="large" color="secondary" startIcon={<Add/>}>Add Purchase Order</Button>
            </Grid>
            <Grid xs={6} md={5} lg={5} direction="row">
                <Grid container rowSpacing={3} direction="row" justifyContent="end" alignItems="end">
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={top100Films}
                        sx={{ width: 250 }}
                        renderInput={(params) => <TextField {...params} label="Search By" />}
                    />
                    <Box ml={2}></Box>
                    <TextField id="outlined-basic" label="Input Here" variant="outlined"  xs={{width:1500}} />
                </Grid>
            </Grid>
            <Grid md={1} lg={1}> </Grid>
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
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                        return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
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
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            </Paper>
        </Grid>

        </Grid>
    </Box>
  );
}