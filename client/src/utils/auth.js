import api from '../api/axiosInstance';

export async function logoutUser(navigate) {
  try {
    await api.post('/admin/logout');
  } catch (err) {
    console.error('Error during logout', err);
  } finally {
    localStorage.clear();
    if (navigate) navigate('/admin/login');
    else window.location.href = '/admin/login';
  }
}
