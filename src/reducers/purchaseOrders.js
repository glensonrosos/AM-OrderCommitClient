import { GET_POS,GET_PO,GET_POS_BY_SEARCH,UPDATE_PO_BY_LOGISTICS,UPDATE_PO_BY_AM,
    START_LOADING_HOME,END_LOADING_HOME,CREATE_PO,UPDATE_CELL_EDIT_BY,UPDATE_PO_BY_AUTO,GET_REQ_ATT_DEPTS } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    purchaseOrders:[],
    currentPage:1,
    numberOfPages:1,
    total:1,
    reqAttDepts:null,
    message:null,
}

export default(state = defaultState,action) => {
    switch(action.type){
        case GET_POS:
        case GET_POS_BY_SEARCH:
            const {purchaseOrders,currentPage,numberOfPages } = action.payload;
            return {
                ...state,
                purchaseOrders,
                currentPage,
                numberOfPages,
            };
        case GET_REQ_ATT_DEPTS:
            return {
                ...state,
                reqAttDepts: action.payload
            };
        case GET_PO:
            return {
                ...state,
                purchaseOrders: action.payload,
            };
        case UPDATE_PO_BY_AM:
            if(action.payload.message === 'success')
                return {
                    ...state,
                    message: 'success',
                    purchaseOrders : state.purchaseOrders.map((po)=> po._id === action.payload.po._id ? action.payload.po : po) 
                };
            else
                return {
                    ...state,
                    message: 'PO Number exist'
                }
        case UPDATE_PO_BY_AUTO:
        case UPDATE_PO_BY_LOGISTICS:
        case UPDATE_CELL_EDIT_BY:
            return{
                ...state,
                purchaseOrders : state.purchaseOrders.map((po)=> po._id === action.payload._id ? action.payload : po) 
            }
        case CREATE_PO:
            if(action.payload.message === 'success')
                return {
                    ...state,
                    purchaseOrders:[
                        ...state.purchaseOrders,
                        action.payload.po
                    ]
                };
            else
                return {
                    ...state,
                    message: 'PO Number exist'
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