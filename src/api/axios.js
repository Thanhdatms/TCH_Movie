import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = "https://tchserver.edwardxd.site/api/v1";

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
        const refreshUrl = `https://tchserver.edwardxd.site/api/v1/auth/refresh-token`;
        const response = await axios.post(refreshUrl, {}, { withCredentials: true });
        const { accessToken } = response.data;
        
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Only clear tokens if refresh explicitly fails
        if (refreshError.response?.status === 401) {
          localStorage.removeItem('accessToken');
          Cookies.remove('refreshToken');
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
