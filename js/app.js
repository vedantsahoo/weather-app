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

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    console.log('City entered:',city);
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});
