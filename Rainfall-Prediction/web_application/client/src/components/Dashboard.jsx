import React from 'react';

function Dashboard({ data }) {
    if (!data) return null;

    return (
        <div className="card dashboard-card">
            <h3>Current Conditions</h3>
            <p><strong>Temperature:</strong> {data.Temperature}°C</p>
            <p><strong>Humidity:</strong> {data.Humidity}%</p>
            <p><strong>Wind Speed:</strong> {data.Wind_Speed} km/h</p>
            <p><strong>Last 24hr Rainfall:</strong> {data['Last 24 hrs Rainfall']} mm</p>
        </div>
    );
}

export default Dashboard;