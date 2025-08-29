import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';
import { WiDaySunny, WiCloudy, WiRain, WiSnow } from 'react-icons/wi';

// Import video files from the public folder
import tex1 from '/tex1.mp4';
import tex2 from '/tex2.mp4';
import tex3 from '/tex3.mp4';
import tex4 from '/tex4.mp4';
import tex5 from '/tex5.mp4';

// Dummy data for new charts
const payloadData = [
    { name: 'Truck A', Payload: 120 },
    { name: 'Truck B', Payload: 150 },
    { name: 'Truck C', Payload: 90 },
    { name: 'Truck D', Payload: 110 },
    { name: 'Truck E', Payload: 135 },
];

// Locations for the trucks
const miningLocations = [
    { name: 'Dhanbad', lat: 23.7998, lon: 86.4305 },
    { name: 'Sindri', lat: 23.6805, lon: 86.4874 },
    { name: 'Jharia', lat: 23.7515, lon: 86.4203 },
];

// Initial truck details with dummy data
const initialTruckDetails = [
    { id: 1, title: 'Truck 1', src: tex1, driver: 'Rajesh Kumar', load: 'Coal', speed: 0, location: miningLocations[0], lat: 0, lon: 0 },
    { id: 2, title: 'Truck 2', src: tex2, driver: 'Priya Sharma', load: 'Iron Ore', speed: 0, location: miningLocations[1], lat: 0, lon: 0 },
    { id: 3, title: 'Truck 3', src: tex3, driver: 'Amit Singh', load: 'Limestone', speed: 0, location: miningLocations[2], lat: 0, lon: 0 },
    { id: 4, title: 'Truck 4', src: tex4, driver: 'Sanjay Yadav', load: 'Coal', speed: 0, location: miningLocations[0], lat: 0, lon: 0 },
    { id: 5, title: 'Truck 5', src: tex5, driver: 'Deepak Patel', load: 'Overburden', speed: 0, location: miningLocations[1], lat: 0, lon: 0 },
];

// Weather API logic
const getWeatherIcon = (condition) => {
    if (condition.includes("sunny")) return <WiDaySunny size={48} className="text-yellow-400" />;
    if (condition.includes("cloud")) return <WiCloudy size={48} className="text-gray-400" />;
    if (condition.includes("rain")) return <WiRain size={48} className="text-blue-400" />;
    if (condition.includes("snow")) return <WiSnow size={48} className="text-blue-200" />;
    return <WiDaySunny size={48} className="text-yellow-400" />;
};

const Dashboard = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [weatherError, setWeatherError] = useState("");
    const [trucks, setTrucks] = useState(initialTruckDetails);
    const [speedAlert, setSpeedAlert] = useState(null);
    const [speedChartData, setSpeedChartData] = useState([]);
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    // Weather data fetching
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchWeather(lat, lon);
                },
                (err) => {
                    setWeatherError(err.message);
                }
            );
        } else {
            setWeatherError("Geolocation not supported by your browser");
        }
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {
            const res = await axios.get(
                `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=7&aqi=no&alerts=no`
            );
            setWeatherData(res.data);
        } catch {
            setWeatherError("Failed to fetch weather data");
        }
    };

    const hourlyData = weatherData?.forecast.forecastday[0].hour
        .slice(0, 12)
        .map((hour) => ({
            time: hour.time.split(" ")[1],
            temp: hour.temp_c
        }));

    const dailyData = weatherData?.forecast.forecastday.map((day) => ({
        date: day.date,
        temp: day.day.avgtemp_c
    }));

    // Dynamic speed and location update logic
    useEffect(() => {
        const interval = setInterval(() => {
            const updatedTrucks = trucks.map(truck => {
                const newSpeed = Math.floor(Math.random() * (70 - 20) + 20); // Random speed between 20-70 km/h
                const newLat = (truck.location.lat + (Math.random() - 0.5) * 0.01).toFixed(4);
                const newLon = (truck.location.lon + (Math.random() - 0.5) * 0.01).toFixed(4);
                
                if (newSpeed > 50) {
                    setSpeedAlert({ id: truck.id, title: truck.title, speed: newSpeed });
                    setTimeout(() => setSpeedAlert(null), 3000); // Popup disappears after 3 seconds
                }
                return { 
                    ...truck, 
                    speed: newSpeed,
                    lat: newLat,
                    lon: newLon
                };
            });
            setTrucks(updatedTrucks);

            // Update speed chart data
            const currentSpeeds = updatedTrucks.map(t => ({
                name: t.title,
                speed: t.speed,
            }));
            setSpeedChartData(currentSpeeds);
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [trucks]);

    return (
        <div className="bg-gray-900 text-white min-h-screen p-8">
            <h1 className="text-4xl font-extrabold text-center mb-10">Mining Operations Dashboard[Dhanbad-Sindri Region]</h1>

            {speedAlert && (
                <div className="fixed top-8 right-8 z-50 bg-red-600 text-white p-4 rounded-lg shadow-xl animate-pulse">
                    <h3 className="font-bold">🚨 Speed Limit Exceeded!</h3>
                    <p className="mt-1">{speedAlert.title} is currently at {speedAlert.speed} km/h.</p>
                </div>
            )}

            {/* Live Video Feeds Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Live Mining Truck Feeds</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {trucks.map(truck => (
                        <div 
                            key={truck.id}
                            className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${truck.speed > 50 ? 'bg-red-700' : 'bg-gray-800'}`}
                        >
                            <div className="relative pt-[56.25%]">
                                <video
                                    src={truck.src}
                                    loop
                                    muted
                                    autoPlay
                                    playsInline
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2">{truck.title}</h3>
                                <div className="text-sm space-y-1">
                                    <p><strong>Driver:</strong> {truck.driver}</p>
                                    <p><strong>Load:</strong> {truck.load}</p>
                                    <p><strong>Current Speed:</strong> {truck.speed} km/h</p>
                                    <p><strong>Location:</strong> {truck.location.name}</p>
                                    <p><strong>Coordinates:</strong> {truck.lat}, {truck.lon}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <hr className="my-10 border-gray-700" />

            {/* Metrics & Graphs Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                
                {/* Live Speed Graph */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Live Speed Tracking (km/h)</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={speedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#999" />
                                <YAxis stroke="#999" domain={[0, 75]} />
                                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} labelStyle={{ color: '#fff' }} />
                                <Legend />
                                <Line type="monotone" dataKey="speed" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payload Chart */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Payload (tons)</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payloadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#999" />
                                <YAxis stroke="#999" />
                                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} labelStyle={{ color: '#fff' }} />
                                <Legend />
                                <Bar dataKey="Payload" fill="#f87171" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </section>
            
            <hr className="my-10 border-gray-700" />

            {/* Weather Section */}
            {weatherData && (
                <section className="mb-12">
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">
                                Current Weather in {weatherData.location.name}
                            </h2>
                            <p className="text-lg text-gray-400">
                                {weatherData.current.temp_c}°C • {weatherData.current.condition.text}
                            </p>
                        </div>
                        <div className="flex-shrink-0 mt-4 md:mt-0">
                            {getWeatherIcon(weatherData.current.condition.text.toLowerCase())}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* 12-Hour Forecast */}
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Hourly Forecast</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis dataKey="time" stroke="#999" />
                                        <YAxis stroke="#999" />
                                        <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} labelStyle={{ color: '#fff' }} />
                                        <Bar dataKey="temp" fill="#f87171" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 7-Day Forecast */}
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">7-Day Forecast</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis dataKey="date" stroke="#999" />
                                        <YAxis stroke="#999" />
                                        <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} labelStyle={{ color: '#fff' }} />
                                        <Bar dataKey="temp" fill="#4ade80" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {weatherError && <p className="text-red-500 text-center mb-10">{weatherError}</p>}
            {!weatherData && !weatherError && (
                <p className="text-center mb-10">📍 Detecting location & fetching weather data...</p>
            )}
        </div>
    );
};

export default Dashboard;