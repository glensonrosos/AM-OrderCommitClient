import * as api from '../api';
import { GET_DEPARTMENTS,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const getDepartments = () => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getDepartments();
        dispatch({type: GET_DEPARTMENTS,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}