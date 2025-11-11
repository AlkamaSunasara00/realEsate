// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./assets/css/main.css";
import DashboardRoute from "./routes/admin/DashboardRoute";

const App = () => {
  return (
    <>
      <DashboardRoute />
    </>
  );
};

export default App;
