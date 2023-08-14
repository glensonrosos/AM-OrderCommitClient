import * as api from '../api';
import { GET_ORDER_ITEMS_POID,GET_ORDER_ITEM_IMAGE,DELETE_ORDER_ITEM,CREATE_ORDER_ITEM_POID,START_LOADING_HOME,END_LOADING_HOME, UPDATE_CELL_ORDER_ITEM,UPDATE_CELL_ORDER_ITEM_IMAGE } from '../constant/actionTypes';

export const getOrderItems = (id) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        const {data} = await api.getOrderItem(id);
        dispatch({type: GET_ORDER_ITEMS_POID,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}

export const getOrderItemImage = (id) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.getOrderItemImage(id);
        dispatch({type: GET_ORDER_ITEM_IMAGE,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}

export const createOrderItem = (newOrderitem) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.createOrderItem(newOrderitem);

        dispatch({type: CREATE_ORDER_ITEM_POID, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const updateCellOrderItem = (id,newOrderitem) => async (dispatch) =>{
    try{
        //dispatch({type: START_LOADING_HOME});
        const { data } = await api.updateCellOrderItem(id,newOrderitem);

        dispatch({type: UPDATE_CELL_ORDER_ITEM, payload: data});

       // dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const updateCellOrderItemImage = (id,image) => async (dispatch) =>{
    try{
        //dispatch({type: START_LOADING_HOME});
        const { data } = await api.updateCellOrderItemImage(id,image);

        dispatch({type: UPDATE_CELL_ORDER_ITEM_IMAGE, payload: data});

       // dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const deleteOrderItem = (id) => async (dispatch) =>{
    try{
        //dispatch({type: START_LOADING_HOME});
        const { data } = await api.deleteOrderItem(id);

        dispatch({type: DELETE_ORDER_ITEM, payload: data});

       // dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}
