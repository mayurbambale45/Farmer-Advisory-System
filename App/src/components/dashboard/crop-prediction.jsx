"use client";

import { useState, useTransition, useEffect } from "react";
import React from 'react';
// All imports are now in a single file
// Removed specific component imports to make it a single file as per the request.
// In a single-file setup, these would be defined within the file.
// For this example, I am defining some simplified components for demonstration.

// I've removed the zod and react-hook-form imports to simplify the component.
// I will use standard React state and form handling.

// Simplified UI Components for this single file
const Card = ({ children }) => <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">{children}</div>;
const CardHeader = ({ children }) => <div className="p-6 md:p-8 space-y-2">{children}</div>;
const CardTitle = ({ children }) => <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2 mb-2 text-black">{children}</h1>;
const CardDescription = ({ children }) => <p className="text-center text-gray-500 mb-6 md:mb-8">{children}</p>;
const CardContent = ({ children }) => <div className="p-6 md:p-8 space-y-4">{children}</div>;
const CardFooter = ({ children }) => <div className="p-6 md:p-8 flex flex-col items-stretch gap-4">{children}</div>;
const Button = ({ children, type, disabled, className, onClick }) => <button type={type} disabled={disabled} className={`w-full py-3 px-4 rounded-md font-bold text-white transition-colors ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} ${className}`} onClick={onClick}>{children}</button>;
const Input = ({ type, step, id, name, value, onChange, placeholder, required }) => <input type={type} step={step} id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-green-500 focus:ring-green-500" />;
const Textarea = ({ id, name, value, onChange, placeholder, required }) => <textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-green-500 focus:ring-green-500"></textarea>;
const Badge = ({ children }) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">{children}</span>;

// Lucide-react icons are replaced with simple SVGs to make the file self-contained
const Leaf = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3.9.44-8 2-12 .76 1.76 2.62 3.88 5 6.5C18 18.2 21 22 22 22"></path></svg>;
const Loader2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const Sparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="M9.9 2.4L12 6l2.1-3.6M2.4 9.9L6 12l-3.6 2.1m14.1-12.6L18 6l2.1-3.6m-12.6 14.1L6 18l-3.6 2.1m20.1-6.6L18 12l3.6-2.1m-2.1 14.1L18 18l2.1 3.6m-14.1-14.1L12 18l2.1 3.6m-2.1-20.1L12 6l2.1-3.6"></path></svg>;
const Wand2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-2"><path d="M21 7L14 2l-7 5L2 14l5 7l7-5l7 5Z"></path><path d="M5 14l7-7l5 7l-7 7l-5-7Z"></path><path d="M17 2l-5 5l5 5l5-5Z"></path></svg>;
const FlaskConical = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flask-conical"><path d="M10.992 18.067a2 2 0 0 1-1.016-.245L2.558 13.91a1 1 0 0 1-.362-.779V3.864a1 1 0 0 1 .845-.99c1.67-.23 3.34-.46 5.011-.693a2 2 0 0 1 1.054-.061l7.306 1.135c1.474.228 2.302.73 2.91 1.353a2 2 0 0 1 .494.856L17.29 17.584a2 2 0 0 1-1.054.912l-5.352 1.488ZM15 3.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" /><path d="M10 20.25a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /><path d="M14 20.25a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>;

export function CropPrediction() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Getting your location...");
  const [formData, setFormData] = useState({
    location: "",
    soilType: "",
    historicalWeatherData: "",
    Nitrogen: "",
    Phosphorus: "",
    Potassium: "",
    pH: "",
    Rainfall: "",
    Temperature: "",
    Soil_color: "",
  });

  const fetchData = () => {
    setStatus("Getting your location...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStatus("📍 Location Acquired. Fetching local soil and weather data...");
          const { latitude, longitude } = position.coords;
          fetch('http://127.0.0.1:5000/get_all_defaults', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lon: longitude }),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then(data => {
            setFormData(prevState => ({
              ...prevState,
              Nitrogen: data.N.toFixed(2),
              Phosphorus: data.P.toFixed(2),
              Potassium: data.K.toFixed(2),
              pH: data.pH.toFixed(2),
              Rainfall: data.rainfall.toFixed(2),
              Temperature: data.temperature.toFixed(2),
              Soil_color: data.soil_type || "",
            }));
            setStatus("✅ Local data loaded! You can now get a suggestion.");
          })
          .catch(e => {
            console.error('Error fetching data:', e);
            setStatus("Could not fetch local data. Please enter values manually.");
          });
        },
        () => {
          setStatus("Unable to retrieve location. Please enter values manually.");
        }
      );
    } else {
      setStatus("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  function onSubmit(e) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
          throw new Error("Failed to get prediction from backend.");
        }
        const data = await response.json();
        setResult(data.prediction_text);
      } catch (e) {
        setError("Failed to get prediction. Please try again.");
        console.error(e);
      }
    });
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 flex items-center justify-center">
      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>
              <Leaf />
              <span className="text-xl md:text-2xl">Crop Prediction Engine</span>
            </CardTitle>
            <CardDescription>Get AI-powered crop recommendations for your farm.</CardDescription>
            <Button type="button" onClick={fetchData}>
              {status.includes("Fetching") ? (
                <Loader2 />
              ) : (
                <Wand2 />
              )}
              Fetch Data
            </Button>
          </CardHeader>
          <CardContent>
            <p id="location-status" className="text-center text-sm italic text-gray-500 min-h-[20px]">{status}</p>

            <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="Nitrogen" className="block text-sm font-medium text-gray-700">Nitrogen (N) in soil:</label>
                  <Input type="number" step="any" id="Nitrogen" name="Nitrogen" value={formData.Nitrogen} onChange={handleChange} placeholder="e.g. 50" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="Phosphorus" className="block text-sm font-medium text-gray-700">Phosphorus (P) in soil:</label>
                  <Input type="number" step="any" id="Phosphorus" name="Phosphorus" value={formData.Phosphorus} onChange={handleChange} placeholder="e.g. 20" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="Potassium" className="block text-sm font-medium text-gray-700">Potassium (K) in soil:</label>
                  <Input type="number" step="any" id="Potassium" name="Potassium" value={formData.Potassium} onChange={handleChange} placeholder="e.g. 100" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pH" className="block text-sm font-medium text-gray-700">pH value of soil:</label>
                  <Input type="number" step="any" id="pH" name="pH" value={formData.pH} onChange={handleChange} placeholder="e.g. 6.5" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="Rainfall" className="block text-sm font-medium text-gray-700">Annual Rainfall (mm):</label>
                  <Input type="number" step="any" id="Rainfall" name="Rainfall" value={formData.Rainfall} onChange={handleChange} placeholder="e.g. 1500" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="Temperature" className="block text-sm font-medium text-gray-700">Current Temperature (°C):</label>
                  <Input type="number" step="any" id="Temperature" name="Temperature" value={formData.Temperature} onChange={handleChange} placeholder="e.g. 25" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="Soil_color" className="block text-sm font-medium text-gray-700">Soil Color:</label>
                  <select id="Soil_color" name="Soil_color" value={formData.Soil_color} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-green-500 focus:ring-green-500" required>
                      <option value="" disabled>-- Fetching data... --</option>
                      <option value="Black">Black</option>
                      <option value="Dark Brown">Dark Brown</option>
                      <option value="Light Brown">Light Brown</option>
                      <option value="Medium Brown">Medium Brown</option>
                      <option value="Red">Red</option>
                      <option value="Red ">Red </option>
                      <option value="Reddish Brown">Reddish Brown</option>
                  </select>
                </div>
            </div>
            
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 />
              ) : (
                <Wand2 />
              )}
              Get Recommendation
            </Button>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {result && (
              <div className="space-y-4 rounded-lg border bg-gray-100 p-4">
                <h3 className="font-semibold flex items-center gap-2 text-green-700">
                  <Sparkles />
                  AI Suggestions
                </h3>
                <p className="text-sm text-gray-700 font-medium">
                  {result}
                </p>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
