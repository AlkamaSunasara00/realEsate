import React from 'react';
import useAuthRefresh from '../../../hooks/useAuthRefresh';

const Dashboard = () => {
  useAuthRefresh();
  return <div>Dashboard Content</div>;
};

export default Dashboard;
