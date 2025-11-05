import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import api from '../../../api/axiosInstance';
import useAuthRefresh from '../../../hooks/useAuthRefresh';

const AdminLayout = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call server logout (verifyToken middleware will validate token)
      await api.post('/logout');
    } catch (err) {
      // Even if API fails, continue clearing local data to force logout on client
      console.error('Logout API error:', err?.response?.data || err.message);
    } finally {
      // Clear per-admin keys + backward compatible global keys
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const adminId = storedUser?.id || admin?.id;

      if (adminId) {
        localStorage.removeItem(`accessToken_${adminId}`);
        localStorage.removeItem(`user_${adminId}`);
        localStorage.removeItem(`isLoggedIn_${adminId}`);
        localStorage.removeItem(`lastActivityUpdate_${adminId}`);
      }

      // Remove fallback/global keys
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('lastActivityUpdate');

      setAdmin(null);
      navigate('/admin/login', { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          throw new Error('User data not found');
        }

        // fetch fresh admin data (includes role)
        const response = await api.get(`/getagencybyid/${userData.id}`);
        if (!mounted) return;

        setAdmin(response.data);
        // persist fresh user data under per-admin key
        localStorage.setItem(`user_${userData.id}`, JSON.stringify(response.data));
        setLoading(false);
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Failed to authenticate');
        // Remove any possibly stale auth info and redirect to login
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        const adminId = storedUser?.id;
        if (adminId) {
          localStorage.removeItem(`accessToken_${adminId}`);
          localStorage.removeItem(`user_${adminId}`);
          localStorage.removeItem(`isLoggedIn_${adminId}`);
          localStorage.removeItem(`lastActivityUpdate_${adminId}`);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('lastActivityUpdate');

        navigate('/admin/login', { replace: true });
      }
    }

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // pass admin id to refresh hook (it will use token from storage)
  useAuthRefresh(admin?.id);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="Dashboard-container">
      <Sidebar admin={admin} onLogout={handleLogout} />
      <div>
        <Navbar admin={admin} onLogout={handleLogout} />
        <main className="admin-panel-header-div">
          <Outlet context={{ admin }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
