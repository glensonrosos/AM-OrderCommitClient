import * as api from '../api';
import { GET_STATUS,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const getStatus = () => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getStatus();
        dispatch({type: GET_STATUS,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}