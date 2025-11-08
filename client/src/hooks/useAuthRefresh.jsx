import { useEffect, useRef } from 'react';
import api from '../api/axiosInstance';

export default function useAuthRefresh(adminId) {
  const refreshInterval = 120 * 60 * 1000 + 55 * 1000;
  const activityThrottle = 5 * 1000;
  const refreshTimer = useRef(null);
  const activityTimer = useRef(null);

  const scheduleRefresh = () => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      const token = localStorage.getItem(`accessToken_${adminId}`);
      if (!token) {
        handleLogout();
        return;
      }

      try {
        const { data } = await api.post('/admin/refresh-token', { accessToken: token });
        localStorage.setItem(`accessToken_${adminId}`, data.accessToken);
        localStorage.setItem(`lastActivityUpdate_${adminId}`, Date.now());
        scheduleRefresh();
      } catch {
        handleLogout();
      }
    }, refreshInterval);
  };

  const handleActivity = () => {
    const now = Date.now();
    const lastUpdate = parseInt(localStorage.getItem(`lastActivityUpdate_${adminId}`) || '0', 10);

    if (now - lastUpdate < activityThrottle) return;

    localStorage.setItem(`lastActivityUpdate_${adminId}`, now);
    api.post('/admin/update-activity').catch(() => {});
  };

  const handleLogout = () => {
    api.post('/admin/logout').catch(() => {}).finally(() => {
      localStorage.removeItem('admin_id');
      localStorage.removeItem(`accessToken_${adminId}`);
      localStorage.removeItem(`user_${adminId}`);
      localStorage.removeItem(`isLoggedIn_${adminId}`);
      localStorage.removeItem(`lastActivityUpdate_${adminId}`);
      localStorage.removeItem('user');
      localStorage.clear()
      window.location.href = '/admin/login';
    });
  };

  useEffect(() => {
    if (!adminId) return;

    const token = localStorage.getItem(`accessToken_${adminId}`);
    const isLoggedIn = localStorage.getItem(`isLoggedIn_${adminId}`);
    if (!token || isLoggedIn !== 'true') {
      handleLogout();
      return;
    }

    scheduleRefresh();

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(refreshTimer.current);
      clearTimeout(activityTimer.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [adminId]);

  return null;
}
