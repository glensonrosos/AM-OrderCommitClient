import { GET_POS,GET_PO,GET_POS_BY_SEARCH,UPDATE_PO_BY_LOGISTICS,UPDATE_PO_BY_AM,START_LOADING_HOME,END_LOADING_HOME,CREATE_PO } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    purchaseOrders:[],
    currentPage:1,
    numberOfPages:1,
    total:1
}

export default(state = defaultState,action) => {
    switch(action.type){
        case GET_POS:
            const {purchaseOrders,currentPage,numberOfPages } = action.payload;
            return {
                ...state,
                purchaseOrders,
                currentPage,
                numberOfPages,
            };
        case GET_PO:
        case GET_POS_BY_SEARCH:
            return {
                ...state,
                purchaseOrders: action.payload,
            };
        case UPDATE_PO_BY_AM:
        case UPDATE_PO_BY_LOGISTICS:
            return{
                ...state,
                purchaseOrders : state.purchaseOrders.map((po)=> po._id === action.payload._id ? action.payload : po) 
            }
        case CREATE_PO:
            return {
                ...state,
                purchaseOrders:[
                    ...state.purchaseOrders,
                    action.payload
                ]
            };
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