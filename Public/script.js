const API_KEY = '53b5e01fe26c4efb2d6d8b8f475a8678';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let temperatureChart = null;

function getSeasonAndMonth(date = new Date()) {
    const month = date.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    
    let season = '';
    if (month >= 2 && month <= 4) season = 'Spring';
    else if (month >= 5 && month <= 7) season = 'Summer';
    else if (month >= 8 && month <= 10) season = 'Autumn';
    else season = 'Winter';

    return `${monthNames[month]} • ${season}`;
}

function getWeatherBackground(condition) {
    const main = condition.toLowerCase();
    if (main.includes('rain')) return 'rainy';
    if (main.includes('cloud')) return 'cloudy';
    if (main.includes('snow')) return 'snowy';
    if (main.includes('clear') || main.includes('sunny')) return 'sunny';
    return 'clear';
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.classList.add('show');
    document.getElementById('dashboard').style.display = 'none';

    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 5000);
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('show', show);
}

async function fetchWeather(query) {
    showLoading(true);
    document.getElementById('error').classList.remove('show');

    try {
        const endpoint = isCoordinates(query)
            ? `${BASE_URL}/weather?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${API_KEY}`
            : `${BASE_URL}/weather?q=${query}&units=metric&appid=${API_KEY}`;

        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'City not found. Please try again.' : 'Unable to fetch weather data.');
        }

        const currentData = await response.json();
        localStorage.setItem('lastCity', currentData.name);

        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        displayWeather(currentData);
        displayForecast(forecastData);
        createTemperatureChart(forecastData);

        const theme = getWeatherBackground(currentData.weather[0].main);
        document.body.className = theme;

        showLoading(false);
        document.getElementById('dashboard').style.display = 'grid';
    } catch (error) {
        showError(error.message);
        showLoading(false);
    }
}

function isCoordinates(query) {
    return typeof query === 'object' && 'lat' in query && 'lon' in query;
}

function displayWeather(data) {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('season-info').textContent = getSeasonAndMonth();
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('weather-icon').src = 
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
}

function displayForecast(forecastData) {
    const dailyData = {};

    forecastData.list.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString();

        if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
                day,
                temp: entry.main.temp,
                tempMax: entry.main.temp_max,
                tempMin: entry.main.temp_min,
                icon: entry.weather[0].icon
            };
        }
    });

    const container = document.getElementById('forecast-container');
    container.innerHTML = '';

    Object.values(dailyData).slice(0, 5).forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="day">${day.day}</div>
            <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="forecast">
            <div class="temp">${Math.round(day.temp)}°C</div>
            <div class="temp-min">${Math.round(day.tempMin)}° ~ ${Math.round(day.tempMax)}°</div>
        `;
        container.appendChild(card);
    });
}

function createTemperatureChart(forecastData) {
    const labels = [];
    const temps = [];

    forecastData.list.forEach((entry, index) => {
        if (index % 8 === 0) {
            const date = new Date(entry.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(day);
            temps.push(Math.round(entry.main.temp));
        }
    });

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    if (temperatureChart) {
        temperatureChart.destroy();
    }

    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: 'rgba(33, 150, 243, 0.8)',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: 'rgba(33, 150, 243, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#0d47a1',
                        font: { size: 12, family: 'Poppins' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(33, 150, 243, 0.1)' },
                    ticks: { color: '#1565c0' }
                },
                x: {
                    grid: { color: 'rgba(33, 150, 243, 0.1)' },
                    ticks: { color: '#1565c0' }
                }
            }
        }
    });
}

function handleSearch() {
    const city = document.getElementById('city').value.trim();
    if (city) {
        fetchWeather(city);
        document.getElementById('city').value = '';
    } else {
        showError('Please enter a city name.');
    }
}

function initializeGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeather({ lat: latitude, lon: longitude });
            },
            error => {
                const lastCity = localStorage.getItem('lastCity');
                if (lastCity) {
                    fetchWeather(lastCity);
                } else {
                    showError('Enable location access or search for a city.');
                }
            }
        );
    } else {
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
            fetchWeather(lastCity);
        } else {
            showError('Geolocation not supported. Please search for a city.');
        }
    }
}

document.getElementById('city').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

window.addEventListener('load', initializeGeolocation);
