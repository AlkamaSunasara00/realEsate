import axios from 'axios';

const authAxios = axios.create({
  baseURL: 'http://localhost:4500',
});

authAxios.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  localStorage.setItem("lastActivity", Date.now());
  
  return config;
});

authAxios.interceptors.response.use(
  response => {
    localStorage.setItem("lastActivity", Date.now());
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default authAxios;
