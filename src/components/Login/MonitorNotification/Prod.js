import React, { useState, useRef, useEffect } from 'react';
import audio from '../../audio/alarm.mp3';
import { makeStyles } from '@mui/styles';
import { Container, Button, Typography,Badge } from '@mui/material';
import backgroundImage from '../../images/verse.jpg'; // Replace with your image path

import {getReqAttDepts,getReqAttDeptsNoLoading} from '../../../actions/purchaseOrders';
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from 'react-router';


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    left:0,
    
  },
  title: {
    fontSize: '3rem',
    marginBottom: 0,
    color: '#fff',
    textShadow: '3px 3px #FF0000'
  },
  button: {
    fontSize: '1.5rem',
    padding: 0,
    borderRadius: '50px', // Adjust as needed
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
  },
}));



function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const audioRef = useRef(null);
  const classes = useStyles();
  const navigate = useNavigate();

  const stopInterval = () => {
    clearInterval(intervalId);
    document.title = 'React App';
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIntervalId(null);
  };

  const playAudio = () => {
    audioRef.current.play();
  };

  useEffect(() => {
    // Cleanup when the component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);




  // GLENSON
  const [notReqAttDepts,setReqAttDepts] = useState();
    const {isLoading,reqAttDepts} = useSelector(state=> state.purchaseOrders);
    const dispatch = useDispatch();
    // ORIGINAL
    useEffect(()=>{
        dispatch(getReqAttDepts());
    },[]);

    // CALL EVERY 60 SECONDS
    useEffect(() => {
        const id = setInterval(() => {
          dispatch(getReqAttDeptsNoLoading());
          console.log('called getReqAttDepts table');
        }, 60000); // 15 seconds - ALARM
        setIntervalId(id);

    }, [dispatch]);

    useEffect(()=>{
        if(!isLoading && reqAttDepts){
            setReqAttDepts(reqAttDepts);
            if(reqAttDepts?.PROD > 0){
              playAudio();
              document.title = 'Alarm yow!';
            }else{
              stopInterval();
            }
          }
    },[isLoading,reqAttDepts]);

  //GLENSON

  

  return (
    <div className={classes.root}>
    <Container>
      <audio ref={audioRef} src={audio}></audio>
      <br/> <br/> <br/> <br/> <br/> <br/> <br/>
      <Badge color="error" badgeContent={notReqAttDepts?.PROD} sx={{ "& .MuiBadge-badge": { fontSize: 40, height: 50, minWidth: 50, borderRadius:50 } }}>
          <Typography variant="h2" className={classes.title} >PRODUCTION</Typography>  
      </Badge><br/> <br/> <br/>
      <Button variant="contained" onClick={()=>navigate(`/login`)} className={classes.button}>
          Take me to Login Page
      </Button> <br/> <br/> <br/> <br/>
      <Button variant="contained" size='large' onClick={stopInterval} className={classes.button}>
          Click Me to Stop the audio and I confirm that I am notified
      </Button><br/> <br/>
      <Typography>
        Note: Dont forget to allow audio permission on your browser
      </Typography>
    </Container>
    </div>
  );
}

export default AudioPlayer;
