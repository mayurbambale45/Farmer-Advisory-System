import React from 'react';

function Advisory({ warnings, aiPrediction }) {
    // A simple function to interpret the warning code from the IMD doc
    const getWarningText = (code) => {
        const warningMap = {
            "2": "Heavy Rain", "5": "Hailstorm", "9": "Heat Wave",
            "12": "Cold Wave", "14": "Ground Frost"
        };
        return warningMap[code] || `Warning Code: ${code}`;
    };

    const todayWarning = warnings?.Day_1;

    return (
        <div className="card advisory-card">
            <h2>Today's Advisory</h2>
            <div className="ai-prediction">
                <span>Our AI Prediction for Tomorrow's Rain:</span>
                <strong>{aiPrediction?.predicted_rainfall_mm} mm</strong>
            </div>
            <div className="imd-warning">
                <span>Official IMD Warning:</span>
                <strong className={todayWarning !== "1" ? "active-warning" : ""}>
                    {todayWarning && todayWarning !== "1" ? getWarningText(todayWarning) : "No Active Warnings"}
                </strong>
            </div>
        </div>
    );
}

export default Advisory;