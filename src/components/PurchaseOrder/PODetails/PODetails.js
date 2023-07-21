import React from 'react';
import {Box,TextField, Autocomplete,Paper, Typography,Button} from '@mui/material';
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

import POGrid from './POGrid';
import Stepper from './Stepper';


const PODetails = () =>{

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const top100Films = [
        { label: 'Open', year: 1994 },
        { label: 'On Hold', year: 1972 },
        { label: 'Canceled', year: 1974 },
        { label: 'Closed', year: 1974 },
      ];

      const top200Films = [
        { title: 'AM', year: 1994 },
        { title: 'PD', year: 1972 },
        { title: 'Purchasing', year: 1974 },
        { title: 'Production', year: 2008 },
        { title: 'QA', year: 1957 },
        { title: "Logistics", year: 1993 }
      ]

    return(
        <Box mt={5}>
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
                            <Typography variant="h5" sx={{ml:2}}> Account Management </Typography>
                        </Grid>
                    <Grid xs={6} md={6} lg={6}>
                        <Box component="form" noValidate autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                        }}>
                            <DatePicker label="Date Issued" defaultValue={moment('2014-06-01')} readOnly/>
                            <TextField id="outlined-basic" fullWidth value="FrontGate" readOnly label="Buyer" variant="outlined" />
                            <TextField id="outlined-basic" fullWidth label="PO Number" value="FG0015116065" variant="outlined" />
                            <DatePicker label="Date Issued" defaultValue={moment('2015-04-23')} readOnly/>
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
                            options={top100Films}
                            sx={{ width: 250 }}
                            renderInput={(params) => <TextField {...params} label="Status" />}
                            />
                            <Autocomplete
                                multiple
                                id="checkboxes-tags-demo"
                                options={top200Films}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.title}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option.title}
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
                                        multiline
                                        rows={3}
                                        />

                                <Button variant="contained" color="primary" size="large" fullWidth  > Save Changes </Button>
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
                            <DatePicker label="Required Ship Date" defaultValue={moment('2014-06-01')} />
                            <DatePicker label="Requested Ship Date" defaultValue={moment('2015-04-23')} />
                            <Button variant="contained" color="primary" size="large" fullWidth  > Save Changes </Button>
                        </Box>
                    </Grid>
                </Paper>
                </Grid>
            </Grid>
                </AccordionDetails>
            </Accordion>
            </div>
            <div>
                    {/* <Grid container spacing={5} alignItems="center" justifyContent="center">
                        <Grid sm={6} md={6} lg={6}>
                            <Stepper/>
                        </Grid>
                    </Grid> */}
                <POGrid/>
            </div>
        </Box>
    )
}

export default PODetails;