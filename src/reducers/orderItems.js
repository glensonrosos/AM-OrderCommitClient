import { GET_ORDER_ITEMS_POID,GET_ORDER_ITEM_IMAGE,DELETE_ORDER_ITEM,CREATE_ORDER_ITEM_POID,
    UPDATE_CELL_ORDER_ITEM,START_LOADING_HOME,END_LOADING_HOME, UPDATE_CELL_ORDER_ITEM_IMAGE,
    GET_ORDER_ITEM_STATUS_OPEN, UPDATE_CELL_ORDER_ITEM_BULK,CLEAR_DATE_CELL_ORDER_ITEM_BULK,UPDATE_CELL_ORDER_ITEM_ITEM_CODE, GET_ORDER_ITEMS_IMAGES_POID } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    orderItems:[],
    departmentStatus: null,
    success: false,
    message:null,
    images:[],
}


export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_ORDER_ITEMS_POID:
            return {
                ...state,
                orderItems: action.payload,
                message:null,
            }
        case GET_ORDER_ITEMS_IMAGES_POID:
            return {
                ...state,
                images: action.payload,
                message:null,
            }
        case UPDATE_CELL_ORDER_ITEM_ITEM_CODE:
            if(action.payload.message === 'no order item with that item code')
                return {
                    ...state, 
                    message:'no order item with that item code',
                    orderItems : state.orderItems.map((oi)=> oi._id === action.payload.orderItem._id ? action.payload.orderItem : oi)
                }
            else
                return {
                    ...state,
                    message:'success',
                    orderItems : state.orderItems.map((oi)=> oi._id === action.payload.orderItem._id ? action.payload.orderItem : oi)
                }
        case CREATE_ORDER_ITEM_POID:
            return {
                ...state,
                message:null,
                orderItems :[
                    ...state.orderItems, 
                    action.payload
                ]
            };
        case GET_ORDER_ITEM_IMAGE:
            return{
                ...state,
                message:null,
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
                message:null,
                orderItems : state.orderItems.map((oi)=> oi._id === action.payload._id ? action.payload : oi)
            }
        case DELETE_ORDER_ITEM:
            return{
                ...state,
                message:null,
                orderItems : state.orderItems.filter((oi)=> oi._id !== action.payload._id)
            }
        case START_LOADING_HOME:
            return{
                ...state,
                message:null,
                isLoading:true
            }
        case END_LOADING_HOME:
            return{
                ...state,
                message:null,
                isLoading:false
            }
        case GET_ORDER_ITEM_STATUS_OPEN:
            return{
                ...state,
                message:null,
                departmentStatus: action.payload
            }
        case UPDATE_CELL_ORDER_ITEM_BULK:
        case CLEAR_DATE_CELL_ORDER_ITEM_BULK:
        default:
            return state;
    }
}