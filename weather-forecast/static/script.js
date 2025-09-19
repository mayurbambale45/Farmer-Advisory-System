// static/script.js

window.onload = function() {
    getLocation();
};

function getLocation() {
    if (navigator.geolocation) {
        const options = { timeout: 10000 };
        navigator.geolocation.getCurrentPosition(showPosition, showError, options);
    } else {
        document.getElementById("location-info").innerText = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    document.getElementById("coords").innerText = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;

    // Call Geocoding API to get place name
    const geocodeUrl = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(geoData => {
            const place = geoData.address.city || geoData.address.town || geoData.address.village || "Nearby Location";
            document.getElementById("place-name").innerText = place;
        })
        .catch(err => {
            console.error("Geocoding error:", err);
            document.getElementById("place-name").innerText = "Could not find place name.";
        });

    // Fetch weather data from our server
    fetch(`/weather?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            console.log("Data received from server:", data);
            updateUI(data);
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            alert("An error occurred while fetching weather data: " + error.message);
            document.getElementById("location-info").innerText = "Could not fetch weather data.";
        });
}

function showError(error) {
    let message = "";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = "You denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            message = "The request to get your location timed out."
            break;
        default:
            message = "An unknown error occurred while getting location."
            break;
    }
    alert(message);
    document.getElementById("location-info").innerText = message;
}

// Converts WMO weather code to an emoji icon
function getWeatherIcon(wmoCode) {
    const icons = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
        80: '🌧️', 81: '🌧️', 82: '🌧️', 95: '⛈️',
    };
    return icons[wmoCode] || '❓';
}

// Fills the UI with data for the new design
function updateUI(data) {
    if (!data || !data.current || !data.daily || !data.agricultural_advice) {
        console.error("Incomplete data received from server:", data);
        alert("Could not update UI because data from the server was incomplete.");
        return;
    }

    // Show the hidden cards now that we have data
    document.getElementById("advice-section").classList.remove("hidden");
    document.getElementById("current-weather-card").classList.remove("hidden");
    document.getElementById("forecast-card").classList.remove("hidden");
    
    // Update current weather with icon
    const currentWeather = data.current;
    document.getElementById("current-icon").innerText = getWeatherIcon(currentWeather.weather_code);
    document.getElementById("current-temp").innerText = Math.round(currentWeather.temperature_2m) ?? 'N/A';
    document.getElementById("current-humidity").innerText = currentWeather.relative_humidity_2m ?? 'N/A';
    document.getElementById("current-wind").innerText = currentWeather.wind_speed_10m ?? 'N/A';

    // Update the advice section
    document.getElementById("advice-text").innerText = data.agricultural_advice;

    // Update 7-day forecast
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    if (data.daily && data.daily.time && data.daily.time.length > 0) {
        for (let i = 0; i < data.daily.time.length; i++) {
            const date = new Date(data.daily.time[i]);
            const day = date.toLocaleDateString("en-US", { weekday: 'short' });

            const icon = getWeatherIcon(data.daily.weather_code[i]);
            const maxTemp = Math.round(data.daily.temperature_2m_max[i]) ?? 'N/A';
            const minTemp = Math.round(data.daily.temperature_2m_min[i]) ?? 'N/A';

            const forecastCard = `
                <div class="forecast-day">
                    <p class="date">${day}</p>
                    <p class="icon">${icon}</p>
                    <p class="temps">${maxTemp}° / ${minTemp}°</p>
                </div>
            `;
            forecastContainer.innerHTML += forecastCard;
        }
    } else {
        forecastContainer.innerHTML = "<p>Forecast data is not available.</p>";
    }
}