import { GET_ORDER_ITEMS_POID,GET_ORDER_ITEM_IMAGE,DELETE_ORDER_ITEM,CREATE_ORDER_ITEM_POID,UPDATE_CELL_ORDER_ITEM,START_LOADING_HOME,END_LOADING_HOME, UPDATE_CELL_ORDER_ITEM_IMAGE } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    orderItems:[],
}


export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_ORDER_ITEMS_POID:
            return {
                ...state,
                orderItems: action.payload
            }
        case CREATE_ORDER_ITEM_POID:
            return {
                ...state,
                orderItems :[
                    ...state.orderItems, 
                    action.payload
                ]
            };
        case GET_ORDER_ITEM_IMAGE:
            return{
                ...state,
                orderItems : state.orderItems.map((oi)=> {
                   if(oi._id === action.payload[0]?._id){
                    return {
                        ...oi,
                        image: action.payload[0]?.image
                    }
                   }else
                    return oi
                })
            }
        case UPDATE_CELL_ORDER_ITEM:
        case UPDATE_CELL_ORDER_ITEM_IMAGE:
            return{
                ...state,
                orderItems : state.orderItems.map((oi)=> oi._id === action.payload._id ? action.payload : oi)
            }
        case DELETE_ORDER_ITEM:
            return{
                ...state,
                orderItems : state.orderItems.filter((oi)=> oi._id !== action.payload._id)
            }
        case START_LOADING_HOME:
            return{
                ...state,
                isLoading:true
            }
        case END_LOADING_HOME:
            return{
                ...state,
                isLoading:false
            }
        default:
            return state;
    }
}