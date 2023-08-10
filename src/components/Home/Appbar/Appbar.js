import React,{useState,useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import {Link} from '@mui/material';
import {Navigate} from 'react-router-dom';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import {useDispatch} from 'react-redux';
import { AUTH_LOGOUT } from '../../../constant/actionTypes';
import { useNavigate,useLocation } from 'react-router';
import decode from 'jwt-decode';


export default function MenuAppBar() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location  = useLocation();

  const [user,setUser] = useState(JSON.parse(localStorage.getItem('profile')));

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () =>{
     dispatch({type: AUTH_LOGOUT});
     navigate(`/login`);
     setUser(null);
  }

  const handleCloseMenu = () => {
    setAnchorEl(null);
    handleOpenDialog();
  };


  useEffect(()=>{

    const token = user?.token;

    if(token){
      const decodedToken = decode(token);
      if(decodedToken.exp * 1000 < new Date().getTime())
        handleLogout();
    }else{
      handleLogout();
    }
    console.log(JSON.parse(localStorage.getItem('profile')));
  },[]);

  

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Link variant="h6" href="/purchase-orders/"  sx={{ flexGrow: 1,color:"#fff",textDecoration:"none" }}>
            AM - Order Commitment System
          </Link>
          {
            <div>
              <Grid container rowSpacing={1} direction="row" justifyContent="center" alignItems="center" columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Typography>{`${user?.result?.firstname} ${user?.result?.lastname}`}</Typography>  
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              </Grid>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={handleCloseMenu}>Change Password</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
            }
        </Toolbar>
      </AppBar>

{/* dialog box */}
<Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
        <Box component="form" noValidate autoComplete="off"
            sx={{
                '& .MuiTextField-root': { m: 1, width: '50ch' },
            }}>
          <TextField id="outlined-basic" label="Old Password" variant="outlined" fullWidth/>
          <TextField id="outlined-basic" label="New Password" variant="outlined" fullWidth/>
          <TextField id="outlined-basic" label="Retype Password" variant="outlined" fullWidth/>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="warning">Cancel</Button>
          <Button onClick={handleCloseDialog} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}