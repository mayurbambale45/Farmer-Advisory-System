import React, { useState } from 'react';
import { fetchAdvisoryData } from './services/apiService';
import Dashboard from './components/Dashboard';
import Advisory from './components/Advisory';
import Forecast from './components/Forecast';

function App() {
    const [advisoryData, setAdvisoryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchData = async () => {
        setIsLoading(true);
        setError(null);
        setAdvisoryData(null);

        // --- Mock data for testing. In a real app, this will come from user input or GPS. ---
        const mockLocation = {
            lat: 16.85,
            lon: 74.58,
            districtId: "573",
            stationId: "42182"
        };

        try {
            const data = await fetchAdvisoryData(
                mockLocation.lat,
                mockLocation.lon,
                mockLocation.districtId,
                mockLocation.stationId
            );
            setAdvisoryData(data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <header>
                <h1>Agro-Advisory System</h1>
                <p>Data-driven insights for farmers in Maharashtra.</p>
                <button onClick={handleFetchData} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Get Weather Advisory for Sangli'}
                </button>
            </header>

            <main>
                {error && (
                    <div className="card error-card">
                        <h2>An Error Occurred</h2>
                        <p>{error}</p>
                        <p><i>(Note: This is the expected result if your IP address is not yet whitelisted by the IMD.)</i></p>
                    </div>
                )}

                {advisoryData && (
                    <div className="results">
                        <Advisory 
                            warnings={advisoryData.fiveDayWarnings} 
                            aiPrediction={advisoryData.aiRainfallPrediction} 
                        />
                        <Dashboard data={advisoryData.currentWeather} />
                        <Forecast data={advisoryData.sevenDayForecast} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;