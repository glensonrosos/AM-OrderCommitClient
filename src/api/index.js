import axios from 'axios';

const url = 'http://localhost:5000/purchaseOrder';

export const getPO = () => axios.get(url);