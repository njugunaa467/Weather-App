
const apiKey = '53b5e01fe26c4efb2d6d867b8f475a88';

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, handleGeolocationError);
} else {
    alert("Geolocation is not supported by this browser.");
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeatherData(lat, lon);
}

function handleGeolocationError(error) {
    alert(`Error fetching location: ${error.message}`);
}

function getWeatherData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => alert('Error fetching weather data: ' + error.message));
}

function displayWeather(data) {
    const weatherContainer = document.getElementById('weather');
    weatherContainer.innerHTML = `
        <h2>Weather in ${data.name}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Conditions: ${data.weather[0].description}</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

function searchWeather() {
    const city = document.getElementById('city').value.trim();
    if (city === '') {
        alert("Please enter a city name.");
        return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => alert('Error fetching weather data: ' + error.message));
}
