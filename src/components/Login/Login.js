import * as React from 'react';
import {Avatar,Button,CssBaseline,TextField,FormControlLabel,Checkbox,Link,
    Paper,Box,Grid,Typography,Badge,Stack} from '@mui/material'
import {LockOutlined} from '@mui/icons-material/';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PebaImage from '../images/PebaImage.jpeg';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://www.facebook.com/glenson.rosos">
        GlensonR
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignInSide() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${PebaImage})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Stack 
                direction={{ xs: 'row', sm: 'row' }}
                spacing={{ xs: 8, sm: 8, md: 8 }} useFlexGap flexWrap="wrap">
                    
                <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 40, height: 45, minWidth: 45, borderRadius:50 } }}>
                   <Typography variant="h3" >
                       AM
                    </Typography>  
                </Badge>
                <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 40, height: 45, minWidth: 45, borderRadius:50 } }}>
                   <Typography variant="h3">
                       PD
                    </Typography>  
                </Badge>
                <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 40, height: 45, minWidth: 45, borderRadius:50 } }}>
                   <Typography variant="h3">
                       PURCH
                    </Typography>  
                </Badge>
                <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 40, height: 45, minWidth: 45, borderRadius:50 } }}>
                   <Typography variant="h3" >
                       PROD
                    </Typography>  
                </Badge>
                <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 40, height: 45, minWidth: 45, borderRadius:50 } }}>
                   <Typography variant="h3">
                       QA
                    </Typography>  
                </Badge>
                <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 40, height: 45, minWidth: 45, borderRadius:50 } }}>
                   <Typography variant="h3">
                       LOGS
                    </Typography>  
                </Badge>
            </Stack>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main',mt:5 }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
            
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}