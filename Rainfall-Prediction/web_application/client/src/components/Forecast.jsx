import React from 'react';

function Forecast({ data }) {
    if (!data) return null;

    // Create an array for the 7 days to make it easy to map
    const forecastDays = Array.from({ length: 7 }, (_, i) => {
        const dayKey = i === 0 ? "Todays" : `Day_${i + 1}`;
        const forecastKey = i === 0 ? "Todays_Forecast" : i === 3 ? "Day 4 Forecast" : i === 5 ? "Day 6 Forecast" : `Day_${i+1}_Forecast`;

        return {
            day: i + 1,
            maxTemp: data[`${dayKey}_Forecast_Max_Temp`] || data[`Day_${i+1}_Max_Temp`],
            minTemp: data[`${dayKey}_Forecast_Min_temp`] || data[`Day_${i+1}_Min_temp`],
            forecast: data[forecastKey]
        };
    });

    return (
        <div className="card forecast-card">
            <h3>7-Day Forecast</h3>
            <table>
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Condition</th>
                        <th>Temp (Min/Max)</th>
                    </tr>
                </thead>
                <tbody>
                    {forecastDays.map(day => (
                        <tr key={day.day}>
                            <td>Day {day.day}</td>
                            <td>{day.forecast}</td>
                            <td>{day.minTemp}° / {day.maxTemp}°</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Forecast;