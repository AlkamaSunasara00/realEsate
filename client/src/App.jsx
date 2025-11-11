// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./assets/css/main.css";
import DashboardRoute from "./routes/admin/DashboardRoute";
import HomeRoute from "./routes/client/HomeRoute";

const App = () => {
  return (
    <>
      {/* client routes and admin routes both rely on same Router context */}
      <HomeRoute />
      <DashboardRoute />
    </>
  );
};

export default App;
