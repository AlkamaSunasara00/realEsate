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
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      const adminId = admin?.id;
      localStorage.removeItem(`accessToken_${adminId}`);
      localStorage.removeItem(`user_${adminId}`);
      localStorage.removeItem(`isLoggedIn_${adminId}`);
      localStorage.removeItem(`lastActivityUpdate_${adminId}`);
      navigate('/admin/login', { replace: true });
    }
  };

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          throw new Error('User data not found');
        }
        const response = await api.get(`/getagencybyid/${userData.id}`);
        setAdmin(response.data);
        localStorage.setItem(`user_${userData.id}`, JSON.stringify(response.data));
        setLoading(false);
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Failed to authenticate');
        localStorage.clear();
        navigate('/admin/login', { replace: true });
      }
    }

    checkAuthentication();
  }, [navigate]);

  useAuthRefresh(admin?.id);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
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
