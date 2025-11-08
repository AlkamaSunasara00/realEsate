import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4500', // ✅ root, covers everything
});

api.interceptors.request.use((config) => {
  // skip auth for login route
  if (config.url.includes('/login')) {
    return config;
  }

  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const adminId = userData.id;
  const accessToken =
    adminId
      ? localStorage.getItem(`accessToken_${adminId}`) || localStorage.getItem('accessToken')
      : null;

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      const adminId = userData.id;
      localStorage.removeItem(`accessToken_${adminId}`);
      localStorage.removeItem(`user_${adminId}`);
      localStorage.removeItem(`isLoggedIn_${adminId}`);
      localStorage.removeItem(`lastActivityUpdate_${adminId}`);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('admin_id');
      localStorage.clear();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
