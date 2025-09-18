document.addEventListener('DOMContentLoaded', () => {
    const predictBtn = document.getElementById('predict-btn');
    const resultDiv = document.getElementById('result');
    const gpsStatus = document.getElementById('gps-status');

    // --- 1. Handle GPS and Auto-fill Data ---
    const getAutomaticData = async (lat, lon) => {
        gpsStatus.textContent = '✅ GPS Found. Fetching live soil and weather data...';
        
        try {
            const response = await fetch('/get_environmental_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon }),
            });
            const data = await response.json();

            if (Object.keys(data).length > 0) {
                // Populate ALL form fields with data from our smart API
                document.getElementById('nitrogen').value = data.N || '';
                document.getElementById('phosphorus').value = data.P || '';
                document.getElementById('potassium').value = data.K || '';
                document.getElementById('ph').value = data.pH || '';
                document.getElementById('rainfall').value = Math.round(data.rainfall) || '';
                document.getElementById('temperature').value = Math.round(data.temperature) || '';
                document.getElementById('soil_color').value = data.soil_color || ''; // Set the soil dropdown
                gpsStatus.innerHTML = `✅ Live data loaded successfully! <br> Please select your District and Crop.`;
            } else {
                throw new Error("Empty data received from server.");
            }
        } catch (error) {
            console.error("API Fetch Error:", error);
            gpsStatus.textContent = '❌ Could not fetch automatic data. Please fill all fields manually.';
            gpsStatus.style.color = 'red';
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => getAutomaticData(position.coords.latitude, position.coords.longitude),
            () => {
                gpsStatus.textContent = '⚠️ GPS permission denied. Please fill all fields manually.';
                gpsStatus.style.color = 'orange';
            }
        );
    } else {
        gpsStatus.textContent = 'GPS is not supported. Please fill all fields manually.';
    }

    // --- 2. Handle Prediction Button Click (No changes here) ---
    predictBtn.addEventListener('click', async () => {
        const data = {
            district: document.getElementById('district').value,
            soil_color: document.getElementById('soil_color').value,
            crop: document.getElementById('crop').value,
            nitrogen: document.getElementById('nitrogen').value,
            phosphorus: document.getElementById('phosphorus').value,
            potassium: document.getElementById('potassium').value,
            ph: document.getElementById('ph').value,
            rainfall: document.getElementById('rainfall').value,
            temperature: document.getElementById('temperature').value,
        };
        for (const key in data) {
            if (!data[key]) {
                resultDiv.innerHTML = `<p class="error">Please fill in all fields.</p>`;
                return;
            }
        }
        resultDiv.innerHTML = `<p>Calculating...</p>`;
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        resultDiv.innerHTML = `<p class="success">Recommended Fertilizer: <strong>${result.prediction}</strong></p>`;
    });
});