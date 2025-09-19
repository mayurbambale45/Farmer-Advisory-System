const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- Main API Endpoint for Your React App (Now using Open-Meteo) ---
app.post('/api/get-advisory', async (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Missing location parameters.' });
    }

    try {
        console.log('Received request. Fetching data from Open-Meteo for:', { latitude, longitude });

        // --- Step A: Construct the Open-Meteo API URL ---
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,windspeed_10m,rain&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

        // --- Step B: Call the Open-Meteo API ---
        const weatherResponse = await axios.get(openMeteoUrl);
        const weatherData = weatherResponse.data;

        // --- Step C: Call your Python ML API for a rainfall prediction ---
        const mlPredictionResponse = await axios.post('http://127.0.0.1:5000/predict', {
            max_temp_c: weatherData.daily.temperature_2m_max[0],
            min_temp_c: weatherData.daily.temperature_2m_min[0],
            humidity_percent: weatherData.current.relativehumidity_2m,
            wind_speed_kmh: weatherData.current.windspeed_10m
        });
        const aiPrediction = mlPredictionResponse.data;

        // --- Step D: Transform the data to match frontend expectations ---
        const transformedData = {
            currentWeather: {
                Temperature: weatherData.current.temperature_2m,
                Humidity: weatherData.current.relativehumidity_2m,
                Wind_Speed: weatherData.current.windspeed_10m,
                'Last 24 hrs Rainfall': weatherData.current.rain,
            },
            sevenDayForecast: {
                Station_Name: "Your Location",
                ...Array.from({ length: 7 }, (_, i) => ({
                    [`Day_${i + 1}_Max_Temp`]: weatherData.daily.temperature_2m_max[i],
                    [`Day_${i + 1}_Min_temp`]: weatherData.daily.temperature_2m_min[i],
                    [`Day_${i + 1}_Forecast`]: getWeatherDescription(weatherData.daily.weathercode[i]),
                })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                Todays_Forecast_Max_Temp: weatherData.daily.temperature_2m_max[0],
                Todays_Forecast_Min_temp: weatherData.daily.temperature_2m_min[0],
                Todays_Forecast: getWeatherDescription(weatherData.daily.weathercode[0]),
            },
            fiveDayWarnings: {
                Day_1: "1" // Placeholder
            },
            aiRainfallPrediction: aiPrediction
        };

        res.json(transformedData);

    } catch (error) {
        console.error("❌ Error in /api/get-advisory:", error.message);
        res.status(500).json({ error: 'Failed to fetch advisory data from Open-Meteo or the ML API.' });
    }
});

// Helper function to translate weather codes into text
function getWeatherDescription(code) {
    const codes = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
        55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with hail'
    };
    return codes[code] || 'Unknown';
}

// Scheduled placeholder for IMD alerts
cron.schedule('*/30 * * * *', () => {
    console.log('⏰ Scheduled job placeholder: IMD alert check would run here.');
});

app.listen(PORT, () => {
    console.log(`✅ Node.js backend server is running on http://localhost:${PORT}`);
});
