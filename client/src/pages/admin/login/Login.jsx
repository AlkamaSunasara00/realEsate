// src/pages/admin/login/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import '../../../assets/css/login.css';

// Simple XSS-safe sanitization (DOMPurify alternative)
const sanitizeInput = (str) => {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const identifierRef = useRef(null);

  // Focus first input on mount
  useEffect(() => {
    identifierRef.current?.focus();
  }, []);

  // Check existing session
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const adminId = userData.id;
    const isLoggedIn = adminId ? localStorage.getItem(`isLoggedIn_${adminId}`) : null;
    const token = adminId ? localStorage.getItem(`accessToken_${adminId}`) : localStorage.getItem('accessToken');

    if (token && isLoggedIn === 'true') {
      navigate('/admin/dashboard', { replace: true });
    }

    const params = new URLSearchParams(location.search);
    if (params.get('reason') === 'new-login') {
      setMessage({
        text: 'You were logged out because you logged in from another device.',
        type: 'error'
      });
    }
  }, [navigate, location]);

  const validateForm = () => {
    const newErrors = {};
    const sanitizedIdentifier = sanitizeInput(loginInfo.identifier);
    const sanitizedPassword = sanitizeInput(loginInfo.password);

    if (!sanitizedIdentifier) newErrors.identifier = 'Email or phone is required';
    if (!sanitizedPassword) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = sanitizeInput(value);
    setLoginInfo(prev => ({ ...prev, [name]: sanitized }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post('/admin/login', {
        identifier: loginInfo.identifier,
        password: loginInfo.password
      });

      const admin = res.data.admin;
      const accessToken = res.data.accessToken || res.data.token;

      if (!admin || !accessToken) {
        throw new Error('Invalid response from server');
      }

      const adminId = admin.id;

      // Store securely
      localStorage.setItem('admin_id', adminId);
      localStorage.setItem(`accessToken_${adminId}`, accessToken);
      localStorage.setItem(`user_${adminId}`, JSON.stringify(admin));
      localStorage.setItem(`isLoggedIn_${adminId}`, 'true');
      localStorage.setItem(`lastActivityUpdate_${adminId}`, Date.now().toString());

      // Backward compatibility
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(admin));
      localStorage.setItem('isLoggedIn', 'true');

      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 800);
    } catch (error) {
      const serverError = error?.response?.data;
      let errorText = 'Login failed. Please try again.';

      if (serverError) {
        errorText = typeof serverError === 'object' && serverError.error
          ? serverError.error
          : typeof serverError === 'string'
            ? serverError
            : errorText;
      } else if (error?.message) {
        errorText = error.message;
      }

      console.error('Login error:', error);
      setMessage({ text: errorText, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-login">
      <div className="loginn wrap">
        <h1 className="h1" id="login">Admin Login</h1>

        {/* Success / Error Messages */}
        {message.text && (
          <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <input
            ref={identifierRef}
            name="identifier"
            type="text"
            value={loginInfo.identifier}
            onChange={handleChange}
            placeholder="Email or Phone Number"
            autoComplete="username"
            required
            disabled={loading}
            className={errors.identifier ? 'input-error' : ''}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
          />
          {errors.identifier && (
            <div id="identifier-error" className="error-message" style={{ marginTop: '-8px', marginBottom: '8px', fontSize: '13px' }}>
              {errors.identifier}
            </div>
          )}

          <input
            name="password"
            type="password"
            value={loginInfo.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="current-password"
            required
            disabled={loading}
            className={errors.password ? 'input-error' : ''}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <div id="password-error" className="error-message" style={{ marginTop: '-8px', marginBottom: '8px', fontSize: '13px' }}>
              {errors.password}
            </div>
          )}

          <button className="button type1" type="submit" disabled={loading} aria-label={loading ? 'Logging in' : 'Login'}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;