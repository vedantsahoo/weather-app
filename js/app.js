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
    const apiUrl=`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        console.log("Weather data:",data); // Explore the weather data in the console.
        updateWeatherUI(data);

    } catch (error) {
        console.error("Error fetching weather data:",error);
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
