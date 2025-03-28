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
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no`;
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('City not found');
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

//function to update the UI
function updateWeatherUI(data) {
    cityElement.textContent = data.location.name;
    countryElement.textContent = data.location.country;
    temperatureElement.textContent = `${(data.current.temp_c)}°C`;
    descriptionElement.textContent = data.current.condition.text;
    weatherIconElement.src = `https:${data.current.condition.icon}`;
    humidityElement.textContent = `${data.current.humidity}%`;
    windSpeedElement.textContent = `${data.current.wind_kph} km/h`;
    
    // Update coordinates with 2 decimal places
    document.getElementById('latitude').textContent = 
        Number(data.location.lat).toFixed(2);
    document.getElementById('longitude').textContent = 
        Number(data.location.lon).toFixed(2);
}

// Function to update the forecast UI with real data
function updateForecastUI(forecastData) {
    const dayCards = document.querySelectorAll('.day-card');
    
    forecastData.forEach((day, index) => {
        const card = dayCards[index];
        const date = new Date(day.date);
        
        // Update each card with real forecast data
        card.querySelector('.day-date').textContent = index === 0 ? 'Today' : 
            index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });
        card.querySelector('.day-weather-icon img').src = `https:${day.day.condition.icon}`;
        card.querySelector('.day-temperature').textContent = `${Math.round(day.day.avgtemp_c)}°C`;
        card.querySelector('.day-description').textContent = day.day.condition.text;
        card.querySelector('.day-humidity').textContent = `Humidity: ${day.day.avghumidity}%`;
    });
}

// Add new function to get weather by coordinates
async function getWeatherByCoords(latitude, longitude) {
    const apiKey = '295b67fe71f946549d6101332242410';
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=3&aqi=no`;
    
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
            
            // Update coordinates immediately when getting user's location
            document.getElementById('latitude').textContent = 
                Number(latitude).toFixed(2);
            document.getElementById('longitude').textContent = 
                Number(longitude).toFixed(2);
            
            getWeatherByCoords(latitude, longitude);
            locationBtn.textContent = '📍 Use My Location';
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
            locationBtn.textContent = '📍 Use My Location';
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

// Function to check if input is valid
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
