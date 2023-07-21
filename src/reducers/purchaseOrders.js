import { GET_PO } from "../constant/actionTypes";


export default(state = [],action) =>{
    switch(action.type){
        case GET_PO:
            return action.payload;
        case 'CREATE':
            return state;
        default:
            return state;
    }
}