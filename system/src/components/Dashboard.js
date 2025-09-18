import React from 'react';
import './Dashboard.css'; // We will create this file next

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="sidebar">
        {/* All the sidebar links will go here */}
        <h2>AgriAssist</h2>
        <p>Dashboard</p>
        <p>Weather</p>
        <p>Crop Prediction</p>
      </div>
      <div className="main-content">
        {/* The weather and crop cards will go here */}
        <h1>Main Content Area</h1>
      </div>
    </div>
  );
}

export default Dashboard;