import * as api from '../api';
import { AUTH_SIGNIN,START_LOADING,END_LOADING } from '../constant/actionTypes';

export const signIn = (userData,navigate) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING});
        const data = await api.signIn(userData);
        dispatch({type: AUTH_SIGNIN,payload:data});
        navigate(`/purchase-order-detail/`);
        dispatch({type: END_LOADING});
    }catch(error){
        console.log(error.message)
    }
}