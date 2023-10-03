import React,{useState,useEffect} from 'react';
import {Stack,Badge,Link,Typography} from '@mui/material';
import {getReqAttDepts,getReqAttDeptsNoLoading,getPOBySearch} from '../../../../actions/purchaseOrders';
import { useDispatch,useSelector } from 'react-redux';

const DeptBadge = () =>{

    const [notReqAttDepts,setReqAttDepts] = useState();
    const {isLoading,reqAttDepts} = useSelector(state=> state.purchaseOrders);
    const dispatch = useDispatch();
    // ORIGINAL
    useEffect(()=>{
        dispatch(getReqAttDepts());
    },[]);

    // CALL EVERY 60 SECONDS
    useEffect(() => {
        const intervalId = setInterval(() => {
            dispatch(getReqAttDeptsNoLoading());
            console.log('called getReqAttDepts table');
        }, 180000); // 3 minutes
        return () => clearInterval(intervalId);
    }, [dispatch]);

    useEffect(()=>{
        if(!isLoading && reqAttDepts)
            setReqAttDepts(reqAttDepts);
    },[isLoading,reqAttDepts])
    
    return (
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 5, sm: 5, md: 5 }} useFlexGap flexWrap="wrap">
            <Badge color="error" badgeContent={notReqAttDepts?.AM} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 20, borderRadius:50 } }}>
                <Link href="/purchase-orders/search?option=reqAttDepts&value=AM&page=1" variant="h5" >AM</Link>  
            </Badge>
            <Badge color="error" badgeContent={notReqAttDepts?.PD} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 20, borderRadius:50 } }}>
                <Link href="/purchase-orders/search?option=reqAttDepts&value=PD&page=1" variant="h5" >PD</Link>
            </Badge>
            <Badge color="error" badgeContent={notReqAttDepts?.PU} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
                <Link href="/purchase-orders/search?option=reqAttDepts&value=PURCHASING&page=1" variant="h5" >PURCH</Link>  
            </Badge>
            <Badge color="error" badgeContent={notReqAttDepts?.PROD} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
            <Link href="/purchase-orders/search?option=reqAttDepts&value=PRODUCTION&page=1" variant="h5" >PROD</Link>  
            </Badge>
            <Badge color="error" badgeContent={notReqAttDepts?.QA} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
                <Link href="/purchase-orders/search?option=reqAttDepts&value=QA&page=1" variant="h5" >QA</Link>  
            </Badge>
            <Badge color="error" badgeContent={notReqAttDepts?.LOGS} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
                <Link href="/purchase-orders/search?option=reqAttDepts&value=LOGISTICS&page=1" variant="h5" >LOGS</Link>  
            </Badge>
        </Stack>
    )
};

export default DeptBadge;