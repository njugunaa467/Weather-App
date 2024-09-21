
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
    alert("Geolocation is not supported by this browser.");
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherDataByCoords(lat, lon);
}

function showError(error) {
    alert(`Geolocation error: ${error.message}`);
}

function fetchWeatherData(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            return response.json();
        })
        .then(data => displayWeather(data))
        .catch(error => alert('Error fetching weather data: ' + error.message));
}

function fetchWeatherDataByCoords(lat, lon) {
    const apiKey = '53b5e01fe26c4efb2d6d867b8f475a88';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetchWeatherData(url);
}

function fetchWeatherDataByCity(city) {
    const apiKey = '53b5e01fe26c4efb2d6d867b8f475a88'; 
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetchWeatherData(url);
}

function displayWeather(data) {
    if (!data || !data.weather || data.weather.length === 0) {
        alert('No weather data available');
        return;
    }
    const weatherContainer = document.getElementById('weather');
    weatherContainer.innerHTML = `
        <h2>Weather in ${data.name}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Conditions: ${data.weather[0].description}</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

function searchWeather() {
    const city = document.getElementById('city').value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    fetchWeatherDataByCity(city);
}
