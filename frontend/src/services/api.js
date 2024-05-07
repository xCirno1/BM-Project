import axios from 'axios';

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL
});

export default api;
