// DOM elements
const cityElement = document.getElementById('city');
const countryElement = document.getElementById('country');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherIconElement = document.getElementById('weather-icon');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');

//function to fetch weather data
async function getWeatherData(city) {
    const apiKey = '295b67fe71f946549d6101332242410'; // Sign up at weatherapi to get an API key
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no`;
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok || typeof city !== 'string' || city.trim() === '') {
            // Check if the response is not ok or if the city is not a string or empty
            throw new Error('Invalid city name, Please provide a valid city.');
        }
        
        const data = await response.json();
        console.log("Weather data:", data);
        updateWeatherUI(data);
        updateForecastUI(data.forecast.forecastday);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert(error.message);
    }
}

let isCelsius = true;
let latestWeatherData = null;
let latestForecastData = null;

//function to update the UI
function updateWeatherUI(data) {
    latestWeatherData = data; // Save for toggling
    cityElement.textContent = data.location.name;
    countryElement.textContent = data.location.country;
    // Update temperature based on the unit
    const temp = isCelsius ? Math.round(data.current.temp_c) : convertTemperature(data.current.temp_c, true); // Convert to Fahrenheit if needed
    temperatureElement.textContent = isCelsius ? `${temp}°C` : `${temp}°F`;
    descriptionElement.textContent = data.current.condition.text;
    weatherIconElement.src = `https:${data.current.condition.icon}`;
    weatherIconElement.alt = data.current.condition.text || 'Weather icon';
    humidityElement.textContent = `${data.current.humidity}%`;
    windSpeedElement.textContent = `${data.current.wind_kph} km/h`;
    
    // Update coordinates with 2 decimal places
    document.getElementById('latitude').textContent = Number(data.location.lat).toFixed(2);
    document.getElementById('longitude').textContent = Number(data.location.lon).toFixed(2);
}

// Function to update the forecast UI with real data
function updateForecastUI(forecastData) {
    latestForecastData = forecastData; // Save for toggling
    const dayCards = document.querySelectorAll('.day-card');

    forecastData.forEach((day, index) => {
        const card = dayCards[index];
        const date = new Date(day.date);
        
        // Update each card with real forecast data
        card.querySelector('.day-date').textContent = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' :
         date.toLocaleDateString('en-US', { weekday: 'long' });
        const weatherIcon = card.querySelector('.day-weather-icon img');
        weatherIcon.src = `https:${day.day.condition.icon}`;
        weatherIcon.alt = day.day.condition.text || 'Weather icon';
        // Update temperature based on the unit
        const temp = isCelsius ? Math.round(day.day.avgtemp_c) : convertTemperature(day.day.avgtemp_c, true); // Convert to Fahrenheit if needed
        card.querySelector('.day-temperature').textContent = isCelsius ? `${temp}°C` : `${temp}°F`;
        card.querySelector('.day-description').textContent = day.day.condition.text;
        card.querySelector('.day-humidity').textContent = `Humidity: ${day.day.avghumidity}%`;
    });
}

// Add new function to get weather by coordinates
async function getWeatherByCoords(latitude, longitude) {
    const apiKey = '295b67fe71f946549d6101332242410';
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=3&aqi=no`;
    
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Location not found');
        }
        
        const data = await response.json();
        console.log("Weather data:", data);
        updateWeatherUI(data);
        updateForecastUI(data.forecast.forecastday);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert(error.message);
    }
}

// Add function to handle geolocation
function handleGeolocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    const locationBtn = document.getElementById('location-btn');
    locationBtn.textContent = 'Loading...';
    locationBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            // Update coordinates immediately when getting user's location
            document.getElementById('latitude').textContent = Number(latitude).toFixed(2);
            document.getElementById('longitude').textContent = Number(longitude).toFixed(2);
            getWeatherByCoords(latitude, longitude);
            locationBtn.textContent = '📍 Current Location';
            locationBtn.disabled = false;
        },
        (error) => {
            let message = 'Unable to retrieve your location';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Please allow location access to use this feature';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out';
                    break;
            }
            alert(message);
            locationBtn.textContent = '📍 Current Location';
            locationBtn.disabled = false;
        }
    );
}

// Add event listener for location button
document.getElementById('location-btn').addEventListener('click', handleGeolocation);

// Add debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to check if input that is -> "city" is valid
function isValidInput(input) {
    return input.length >= 3 && /^[a-zA-Z\s-]+$/.test(input);
}

// Update the city input event listener
const cityInput = document.getElementById('city-input');

// Create debounced version of getWeatherData
const debouncedGetWeather = debounce((city) => {
    if (isValidInput(city)) {
        getWeatherData(city);
    }
}, 500); // Wait 500ms after user stops typing

// Remove existing event listeners and add new one
cityInput.addEventListener('input', (event) => {
    const city = event.target.value.trim();
    
    // Clear previous results if input is too short
    if (city.length < 3) {
        // Optionally reset the display
        return;
    }
    
    debouncedGetWeather(city);
});

// Toggle button logic
const unitToggleBtn = document.getElementById('unit-toggle');
unitToggleBtn.addEventListener('click', () => {
    isCelsius = !isCelsius;
    unitToggleBtn.textContent = isCelsius ? '°C / °F' : '°F / °C';
    // Re-render UI with new unit
    if (latestWeatherData) updateWeatherUI(latestWeatherData);
    if (latestForecastData) updateForecastUI(latestForecastData);
});

// Update convertTemperature to always return Fahrenheit if tempF=true
function convertTemperature(tempC, tempF = true) {
    if (tempF) {
        return Math.round((tempC * 9/5) + 32); // Convert to Fahrenheit
    } else {
        return Math.round(tempC); // Keep Celsius as is
    }
}
