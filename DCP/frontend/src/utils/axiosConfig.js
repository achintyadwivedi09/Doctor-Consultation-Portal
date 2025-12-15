import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: '/api'
});

export default axiosInstance;

