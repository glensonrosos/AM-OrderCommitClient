import * as api from '../api';
import { GET_ORDER_ITEMS_POID,GET_ORDER_ITEM_IMAGE,DELETE_ORDER_ITEM,CREATE_ORDER_ITEM_POID,
    START_LOADING_HOME,END_LOADING_HOME, UPDATE_CELL_ORDER_ITEM,
    UPDATE_CELL_ORDER_ITEM_IMAGE,GET_ORDER_ITEM_STATUS_OPEN,UPDATE_CELL_ORDER_ITEM_BULK,CLEAR_DATE_CELL_ORDER_ITEM_BULK,
    UPDATE_CELL_ORDER_ITEM_ITEM_CODE, GET_ORDER_ITEMS_IMAGES_POID } from '../constant/actionTypes';

export const getOrderItems = (id) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        const {data} = await api.getOrderItem(id);
        dispatch({type: GET_ORDER_ITEMS_POID,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const getOrderItemsImages = (id) => async(dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        const {data} = await api.getOrderItemImages(id);
        dispatch({type: GET_ORDER_ITEMS_IMAGES_POID,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const updateCellOrderItemWithItemCode = (id,itemCode) => async (dispatch) =>{
    try{

        const {data} = await api.updateCellOrderItemWithItemCode(id,itemCode);
        dispatch({type: UPDATE_CELL_ORDER_ITEM_ITEM_CODE,payload:data});
        
    }catch(error){
        console.log(error)
    }
}

export const getOrderItemsNoLoading = (id) => async (dispatch) =>{
    try{
        const {data} = await api.getOrderItem(id);
        dispatch({type: GET_ORDER_ITEMS_POID,payload:data});
        
    }catch(error){
        console.log(error)
    }
}

export const getOrderItemImage = (id) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.getOrderItemImage(id);
        dispatch({type: GET_ORDER_ITEM_IMAGE,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
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

export const updateCellOrderItemInBulk = (details) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.updateCellOrderItemInBulk(details);

        dispatch({type: UPDATE_CELL_ORDER_ITEM_BULK, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const clearDateOrderItemInBulk = (details) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.clearDateOrderItemInBulk(details);

        dispatch({type: CLEAR_DATE_CELL_ORDER_ITEM_BULK, payload: data});

        dispatch({type: END_LOADING_HOME});

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

export const getCountOrderItemStatusOpen = (id) => async (dispatch) =>{
    try{
        
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.getCountOrderItemStatusOpen(id);

        dispatch({type: GET_ORDER_ITEM_STATUS_OPEN, payload: data});

        dispatch({type: END_LOADING_HOME});
       
    }catch(error){
        console.log(error);
    }
}
