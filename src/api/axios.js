import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.DEV 
  ? "http://localhost:5000/api/v1"
  : "https://tchserver.edwardxd.site/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(request => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    request.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return request;
}, error => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Only attempt refresh if it's a 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshUrl = import.meta.env.DEV 
          ? `http://localhost:5000/api/v1/auth/refresh-token`
          : `https://tchserver.edwardxd.site/api/v1/auth/refresh-token`;
          
        // Make refresh token request
        const response = await axios.post(refreshUrl, {}, { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.accessToken) {
          // Update access token in localStorage and axios headers
          localStorage.setItem('accessToken', response.data.accessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens only on explicit refresh failure
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
