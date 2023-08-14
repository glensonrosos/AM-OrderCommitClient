import axios from 'axios';

//const API = axios.create({baseURL: 'http://localhost:5000/oc'});
const API = axios.create({baseURL: 'http://192.168.3.146:5000/oc'});

//PO
export const getPOs = (page) => API.get(`/purchaseOrders?page=${page}`);
export const getPO = (id) => API.get(`/purchaseOrders/${id}`);
export const getPOBySearch = (search) => API.get(`/purchaseOrders/search?option=${search.option}&value=${search.search}`);
export const createPO = (newPO) => API.post(`/purchaseOrders`,newPO);
export const updatePOByAm = (id,updatePO) => API.patch(`/purchaseOrders/${id}/AM`,updatePO);
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
export const createOrderItem = (newOrderItem) => API.post(`/orderitems`,newOrderItem);
export const deleteOrderItem = (id) => API.delete(`/orderitems/${id}`);
export const updateCellOrderItem = (id,newOrderItem) => API.patch(`/orderitems/${id}/updateCell`,newOrderItem);
export const updateCellOrderItemImage = (id,image) => API.patch(`/orderitems/${id}/updateCellImage`,image);

// AUTH
export const signIn = (user) => API.post(`/auth/signIn`,user);