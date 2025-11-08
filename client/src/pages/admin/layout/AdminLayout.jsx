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

  // Sidebar & responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const tablet = width > 768 && width <= 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Close sidebar automatically on mobile/tablet
      if (mobile || tablet) setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout API error:', err?.response?.data || err.message);
    } finally {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const adminId = storedUser?.id || admin?.id;

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
      setAdmin(null);
      navigate('/admin/login', { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;
    async function checkAuthentication() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) throw new Error('User data not found');

        const response = await api.get(`/getUserById/${userData.id}`);
        if (!mounted) return;
        setAdmin(response.data);
        localStorage.setItem(`user_${userData.id}`, JSON.stringify(response.data));
        setLoading(false);
      } catch (err) {
        console.error('Authentication failed:', err);
        setError('Failed to authenticate');
        localStorage.clear();
        navigate('/admin/login', { replace: true });
      }
    }
    checkAuthentication();
    return () => (mounted = false);
  }, [navigate]);

  useAuthRefresh(admin?.id);

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <h3 style={{ color: 'red' }}>{error}</h3>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 12,
            padding: '10px 18px',
            background: '#3858d6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );

  // === Dynamic classes for full responsive layout
  const responsiveClass = `
    admin-panel-header-div
    ${isMobile ? 'mobile-view' : ''}
    ${isTablet ? 'tablet-view' : ''}
    ${isSidebarOpen ? 'sidebar-open' : ''}
  `.trim();

  return (
    <div className="Dashboard-container">
      <Sidebar
        admin={admin}
        onLogout={handleLogout}
        isMobile={isMobile}
        isTablet={isTablet}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div>
        <Navbar
          admin={admin}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* This main wrapper now behaves exactly like GetProperties */}
        <main className={responsiveClass}>
          <Outlet context={{ admin }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
