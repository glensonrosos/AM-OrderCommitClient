import React from 'react';
import {Stack,Badge,Link} from '@mui/material';

const DeptBadge = () =>{
    
    return (
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 5, sm: 5, md: 5 }} useFlexGap flexWrap="wrap">
            <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 20, borderRadius:50 } }}>
                <Link href="#" variant="h5" >AM</Link>  
            </Badge>
            <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 20, borderRadius:50 } }}>
                <Link href="#" variant="h5">PD</Link>  
            </Badge>
            <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
                <Link href="/purchase-order-details" variant="h5">PURCH</Link>  
            </Badge>
            <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
                <Link href="#" variant="h5" >PROD</Link>  
            </Badge>
            <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
                <Link href="#" variant="h5">QA</Link>  
            </Badge>
            <Badge color="error" badgeContent={3} sx={{ "& .MuiBadge-badge": { fontSize: 15, height: 20, minWidth: 25, borderRadius:50 } }}>
                <Link href="#" variant="h5">LOGS</Link>  
            </Badge>
        </Stack>
    )
};

export default DeptBadge;