// DOM elements
const cityElement = document.getElementById('city');
const countryElement = document.getElementById('country');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherIconElement = document.getElementById('weather-icon');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const favoritesList = document.getElementById('favorites-list');

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

// Load favorites from local storage
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    renderFavorites(favorites);
}

// Save a city to favorites
function saveFavorite(city) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites(favorites);
    } else {
        alert(`${city} is already in your favorites.`);
    }
}

// Remove a city from favorites
function removeFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites(favorites);
}

// Function to fetch weather for a favorite city
function fetchWeatherForFavorite(city) {
    if (!city) {
        alert('City name is missing.');
        return;
    }

    // Use the existing getWeatherData function to fetch and display weather
    getWeatherData(city);
}

// Render the favorites list
function renderFavorites(favorites) {
    favoritesList.innerHTML = '';
    favorites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;

        // Button to fetch weather for the favorite city
        const fetchBtn = document.createElement('button');
        fetchBtn.textContent = 'View Weather';
        fetchBtn.style.marginRight = '0.5rem';
        fetchBtn.addEventListener('click', () => fetchWeatherForFavorite(city));

        // Button to remove the favorite city
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeFavorite(city));

        li.appendChild(fetchBtn);
        li.appendChild(removeBtn);
        favoritesList.appendChild(li);
    });
}

// Add a button to save the current city to favorites
function addSaveToFavoritesButton() {
    const saveBtn = document.createElement('button');
    saveBtn.id = 'save-favorite-btn';
    saveBtn.textContent = 'Add to Favorites';
    saveBtn.style.marginTop = '1rem';
    saveBtn.style.padding = '0.5rem 1rem';
    saveBtn.style.backgroundColor = '#0083b0';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '20px';
    saveBtn.style.cursor = 'pointer';

    saveBtn.addEventListener('click', () => {
        const city = cityElement.textContent;
        if (city && city !== 'City Name') {
            saveFavorite(city);
        } else {
            alert('No city to save. Please search for a city first.');
        }
    });

    document.querySelector('.weather-info').appendChild(saveBtn);
}

// Initialize the favorites feature
function initFavoritesFeature() {
    loadFavorites();
    addSaveToFavoritesButton();
}

// Call the initialization function
initFavoritesFeature();
