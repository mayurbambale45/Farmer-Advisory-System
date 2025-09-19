import axios from 'axios';

// The URL of your Node.js backend server.
const API_URL = 'http://localhost:3001/api/get-advisory';

/**
 * Fetches the complete advisory data package from the backend.
 * @param {number} lat - The latitude of the location.
 * @param {number} lon - The longitude of the location.
 * @param {string} districtId - The ID of the district.
 * @param {string} stationId - The ID of the weather station.
 * @returns {Promise<object>} The complete advisory data from the server.
 */
export const fetchAdvisoryData = async (lat, lon, districtId, stationId) => {
    try {
        // Send a POST request to our backend with the location data.
        console.log("Frontend: Sending request to backend...");
        const response = await axios.post(API_URL, {
            latitude: lat,
            longitude: lon,
            districtId: districtId,
            stationId: stationId
        });
        // Return the complete data package from the server.
        console.log("Frontend: Received data from backend:", response.data);
        return response.data;
    } catch (error) {
        // If the API call fails, we throw the error message from the backend.
        console.error("Frontend: Error fetching advisory data:", error);
        throw error.response.data.error || "An unknown error occurred on the server.";
    }
};