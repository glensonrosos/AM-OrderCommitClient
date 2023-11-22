import axios from 'axios';

//const API = axios.create({baseURL: 'http://localhost:5000/oc'});
const API = axios.create({baseURL: 'http://10.0.1.249:5000/oc'});

//PO
export const getPOs = (page) => API.get(`/purchaseOrders?page=${page}`);
export const getReqAttDepts = () => API.get(`/purchaseOrders/getReqAttDepts`);
export const getPO = (id) => API.get(`/purchaseOrders/${id}`);
export const getPOBySearch = (search) => API.get(`/purchaseOrders/search?option=${search.option}&value=${search.search}&page=${search?.page}`);
export const createPO = (newPO) => API.post(`/purchaseOrders`,newPO);
export const updatePOByAm = (id,updatePO) => API.patch(`/purchaseOrders/${id}/AM`,updatePO);
export const updatePOByAuto = (id,updatePO) => API.patch(`/purchaseOrders/${id}/Auto`,updatePO);
export const updateCellEditedBy = (id,edit) => API.patch(`/purchaseOrders/${id}/CellEditedBy`,edit);
export const updatePOByLogistics = (id,updatePO) => API.patch(`/purchaseOrders/${id}/Logistics`,updatePO)

//BUYER
export const getBuyers = () => API.get(`/buyers`);

//STATUS
export const getStatus = () => API.get(`/status`);

//DEPARTMENT
export const getDepartments = () => API.get(`/departments`);

//ORDER ITEM
export const getOrderItem = (id) => API.get(`/orderitems/${id}`);
export const getOrderItemImage = (id) => API.get(`/orderitems/${id}/image`);
export const getCountOrderItemStatusOpen = (id) => API.get(`/orderitems/${id}/getCountOrderItemStatusOpen`);
export const createOrderItem = (newOrderItem) => API.post(`/orderitems`,newOrderItem);
export const deleteOrderItem = (id) => API.delete(`/orderitems/${id}`);
export const updateCellOrderItem = (id,newOrderItem) => API.patch(`/orderitems/${id}/updateCell`,newOrderItem);
export const updateCellOrderItemInBulk = (details) => API.post(`/orderitems/updateOrderItemInBulk`,details);
export const clearDateOrderItemInBulk = (details) => API.post(`/orderitems/clearDateOrderItemInBulk`,details);

export const updateCellOrderItemImage = (id,image) => API.patch(`/orderitems/${id}/updateCellImage`,image);

// AUTH
export const signIn = (user) => API.post(`/auth/signIn`,user);
export const changePassword = (user) => API.post('/auth/changePassword',user);