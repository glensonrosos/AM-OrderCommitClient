import * as api from '../api';
import { GET_PO } from '../constant/actionTypes';

export const getPO = () => async (dispatch) =>{
    try{
        const {data} = await api.getPO();
        dispatch({type: GET_PO,payload:data});
    }catch(error){
        console.log(error.message);
    }
}