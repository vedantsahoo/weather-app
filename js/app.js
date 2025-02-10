const apiKey = '295b67fe71f946549d6101332242410'; // Sign up at weatherapi to get an API key
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');

// DOM elements
const cityElement = document.getElementById('city');
const countryElement = document.getElementById('country');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherIconElement = document.getElementById('weather-icon');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');

async function getWeatherData(city) {
    try {
        const response = await fetch(
            `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        alert(error.message);
    }
}

function updateWeatherUI(data) {
    cityElement.textContent = data.location.name;
    countryElement.textContent = data.location.country;
    temperatureElement.textContent = `${(data.current.temp_c)}°C`;
    descriptionElement.textContent = data.current.condition.text;
    weatherIconElement.src = `https:${data.current.condition.icon}`;
    humidityElement.textContent = `${data.current.humidity}%`;
    windSpeedElement.textContent = `${data.current.wind_kph} km/h`;
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
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
