const API_KEY = '4a3c56ad48296808490fd2d32e0e7a7c'; // Get from OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather icon mapping
const iconMap = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️',
    '50d': '🌫️', '50n': '🌫️'
};

// Initialize with default city
document.addEventListener('DOMContentLoaded', function() {
    searchWeather('New York');
});

// Handle Enter key press
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Wrapper functions for onclick handlers
function handleSearch() {
    searchWeather();
}

function handleCurrentLocation() {
    getCurrentLocation();
}

async function searchWeather(defaultCity) {
    const city = defaultCity || document.getElementById('cityInput').value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();

    try {
        // Get current weather
        const currentResponse = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=imperial`);
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }

        const currentData = await currentResponse.json();

        // Get forecast
        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=imperial`);
        const forecastData = await forecastResponse.json();

        displayWeather(currentData, forecastData);
        hideLoading();

    } catch (error) {
        hideLoading();
        showError(error.message === 'City not found' ? 'City not found. Please try again.' : 'Unable to fetch weather data. Using demo data.');
        
        // Show demo data when API fails
        showDemoData();
    }
}

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            showLoading();
            
            try {
                const response = await fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`);
                const data = await response.json();
                
                const forecastResponse = await fetch(`${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`);
                const forecastData = await forecastResponse.json();
                
                displayWeather(data, forecastData);
                hideLoading();
                
            } catch (error) {
                hideLoading();
                showError('Unable to fetch weather data for your location');
                showDemoData();
            }
        },
        (error) => {
            showError('Unable to retrieve your location');
        }
    );
}

function displayWeather(currentData, forecastData) {
    // Current weather
    document.getElementById('cityName').textContent = `${currentData.name}, ${currentData.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(currentData.main.temp)}°F`;
    document.getElementById('description').textContent = currentData.weather[0].description;
    document.getElementById('weatherIcon').textContent = iconMap[currentData.weather[0].icon] || '🌤️';
    
    // Details
    document.getElementById('feelsLike').textContent = `${Math.round(currentData.main.feels_like)}°F`;
    document.getElementById('humidity').textContent = `${currentData.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${currentData.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${currentData.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(currentData.visibility / 1000).toFixed(1)} km`;
    
    // Sunrise/Sunset
    document.getElementById('sunrise').textContent = new Date(currentData.sys.sunrise * 1000).toLocaleTimeString([], {timeStyle: 'short'});
    document.getElementById('sunset').textContent = new Date(currentData.sys.sunset * 1000).toLocaleTimeString([], {timeStyle: 'short'});

    // Forecast
    displayForecast(forecastData);
    
    document.getElementById('weatherContent').style.display = 'block';
}

function displayForecast(forecastData) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    // Get one forecast per day (every 8th item, as API returns 3-hour intervals)
    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${iconMap[forecast.weather[0].icon] || '🌤️'}</div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°F</div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">${forecast.weather[0].description}</div>
        `;
        
        forecastGrid.appendChild(forecastItem);
    });
}

function showDemoData() {
    // Demo data to show functionality
    const demoCurrentData = {
        name: 'New York',
        sys: { country: 'US', sunrise: Date.now() / 1000 - 3600, sunset: Date.now() / 1000 + 7200 },
        main: { temp: 22, feels_like: 25, humidity: 60, pressure: 1013 },
        weather: [{ description: 'partly cloudy', icon: '02d' }],
        wind: { speed: 3.5 },
        visibility: 10000
    };

    const demoForecastData = {
        list: [
            { dt: Date.now() / 1000, main: { temp: 22 }, weather: [{ description: 'sunny', icon: '01d' }] },
            { dt: Date.now() / 1000 + 86400, main: { temp: 25 }, weather: [{ description: 'cloudy', icon: '03d' }] },
            { dt: Date.now() / 1000 + 172800, main: { temp: 20 }, weather: [{ description: 'rainy', icon: '10d' }] },
            { dt: Date.now() / 1000 + 259200, main: { temp: 18 }, weather: [{ description: 'stormy', icon: '11d' }] },
            { dt: Date.now() / 1000 + 345600, main: { temp: 24 }, weather: [{ description: 'clear', icon: '01d' }] }
        ]
    };

    displayWeather(demoCurrentData, demoForecastData);
}

function showLoading() {
    document.getElementById('loadingDiv').style.display = 'block';
    document.getElementById('errorDiv').style.display = 'none';
    document.getElementById('weatherContent').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingDiv').style.display = 'none';
}

function showError(message) {
    document.getElementById('errorDiv').textContent = message;
    document.getElementById('errorDiv').style.display = 'block';
    setTimeout(() => {
        document.getElementById('errorDiv').style.display = 'none';
    }, 5000);
}