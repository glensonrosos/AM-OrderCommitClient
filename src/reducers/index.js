import { combineReducers } from "redux";
import purchaseOrders from './purchaseOrders';
import buyers from "./buyers";
import status from "./status";
import orderItems from "./orderItems";
import departments from "./departments";
import auth from './auth';

export default combineReducers({
    purchaseOrders,
    buyers,
    status,
    orderItems,
    departments,
    auth,
});