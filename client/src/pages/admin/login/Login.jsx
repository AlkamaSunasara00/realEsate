import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const adminId = userData.id;
    const isLoggedIn = adminId ? localStorage.getItem(`isLoggedIn_${adminId}`) : null;
    const token = adminId ? localStorage.getItem(`accessToken_${adminId}`) : localStorage.getItem('accessToken');

    if (token && isLoggedIn === 'true') {
      navigate('/admin/dashboard', { replace: true });
    }

    const params = new URLSearchParams(location.search);
    if (params.get('reason') === 'new-login') {
      setMessage('You were logged out because you logged in from another device.');
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/login', loginInfo);

      const adminId = res.data.admin.id;
      localStorage.setItem(`accessToken_${adminId}`, res.data.accessToken);
      localStorage.setItem(`user_${adminId}`, JSON.stringify(res.data.admin));
      localStorage.setItem(`isLoggedIn_${adminId}`, 'true');
      localStorage.setItem(`lastActivityUpdate_${adminId}`, Date.now());
      localStorage.setItem('accessToken', res.data.accessToken); // Backward compatibility
      localStorage.setItem('user', JSON.stringify(res.data.admin));
      localStorage.setItem('isLoggedIn', 'true');

      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = error?.response?.data?.error || 'Login failed. Please try again.';
      console.error('Login error:', error.response?.data || error.message);
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-login">
      <div className="loginn wrap">
        <h1 className="h1" id="login">Admin Login</h1>
        {message && <div style={{ color: 'red', marginBottom: '10px' }}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <input
            name="identifier"
            type="text"
            onChange={handleChange}
            value={loginInfo.identifier}
            placeholder="Email or Phone Number"
            autoComplete="username"
            required
            disabled={loading}
          />
          <input
            name="password"
            type="password"
            onChange={handleChange}
            value={loginInfo.password}
            placeholder="Password"
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <button className="button type1" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
