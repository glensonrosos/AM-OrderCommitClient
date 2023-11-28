import * as api from '../api';
import {GET_POS,GET_PO,GET_POS_BY_SEARCH,UPDATE_PO_BY_AM,UPDATE_PO_BY_LOGISTICS,START_LOADING_HOME,
    CREATE_PO,END_LOADING_HOME,UPDATE_CELL_EDIT_BY,UPDATE_PO_BY_AUTO,GET_REQ_ATT_DEPTS } from '../constant/actionTypes';

export const getPOs = (page) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});

        const {data} = await api.getPOs(page);

        console.log(data);
        dispatch({type: GET_POS,payload:data});

        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message);
    }
}

export const getReqAttDepts = (page) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});

        const {data} = await api.getReqAttDepts();

        dispatch({type: GET_REQ_ATT_DEPTS,payload:data});

        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message);
    }
}

export const getReqAttDeptsNoLoading = (page) => async (dispatch) =>{
    try{
        const {data} = await api.getReqAttDepts();
        dispatch({type: GET_REQ_ATT_DEPTS,payload:data});

    }catch(error){
        console.log(error.message);
    }
}

export const getPO = (id) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getPO(id);
        
        dispatch({type:GET_PO,payload:data});
        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error.message)
    }
}

export const getPONoLoading = (id) => async (dispatch) =>{
    try{
        const {data} = await api.getPO(id);
        dispatch({type:GET_PO,payload:data});
    }catch(error){
        console.log(error.message)
    }
}

export const getPOBySearch = (search) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getPOBySearch(search);     

        dispatch({type:GET_POS_BY_SEARCH,payload:data});
        
        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error.message)
    }
}

export const createPO = (newPO,navigate) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.createPO(newPO);

        dispatch({type: CREATE_PO, payload: data});

        if(data.message === 'success')
            navigate(`/purchase-order-detail/${data?.po?._id}`);

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const updatePOByAm = (id,updatePO) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.updatePOByAm(id,updatePO);

        dispatch({type:UPDATE_PO_BY_AM,payload:data});
        
        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const updatePOByAuto = (id,updatePO) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.updatePOByAuto(id,updatePO);

        console.log(data);
        dispatch({type:UPDATE_PO_BY_AUTO,payload:data});
        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const updateCellEditedBy = (id,updatePO) => async (dispatch) =>{
    try{
       
        const {data} = await api.updateCellEditedBy(id,updatePO);

        console.log(data);
        dispatch({type:UPDATE_CELL_EDIT_BY,payload:data});
       

    }catch(error){
        console.log(error);
    }
}

export const updatePOByLogistics = (id,updatePO) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.updatePOByLogistics(id,updatePO);
        dispatch({type:UPDATE_PO_BY_LOGISTICS,payload:data});
        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}