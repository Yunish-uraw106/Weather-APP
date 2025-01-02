document.addEventListener("DOMContentLoaded", () => {
    const cityField = document.getElementById("city");
    const searchButton = document.getElementById("search-city");
    const locationButton = document.getElementById("current-location");
    const currentWeatherDiv = document.getElementById("current-weather");
    const forecastList = document.getElementById("forecast-list");

    const API_KEY = "c45c8b242c8b0154960764c9f934bbc5"; 

    const fetchWeatherData = (url, callback) => {
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => alert("Failed to fetch weather data."));
    };

    function updateCurrentWeather(city, data) {
        currentWeatherDiv.innerHTML = `
            <h2>${city} (${data.dt_txt.split(" ")[0]})</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
            <p>Temperature: ${(data.main.temp - 273.15).toFixed(1)}&deg;C</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
            <p>Humidity: ${data.main.humidity}%</p>
        `;
    }

    const updateForecast = (data) => {
        forecastList.innerHTML = "";
        const uniqueDays = [];

        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!uniqueDays.includes(date) && uniqueDays.length < 3) { 
                uniqueDays.push(date);
                forecastList.innerHTML += `
                    <li>
                        <p>${date}</p>
                        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather icon">
                        <p>Temp: ${(item.main.temp - 273.15).toFixed(1)}&deg;C</p>
                        <p>Wind: ${item.wind.speed} m/s</p>
                        <p>Humidity: ${item.main.humidity}%</p>
                    </li>
                `;
            }
        });
    };

    const getCityWeather = () => {
        const cityName = cityField.value.trim();
        if (!cityName) return alert("Please enter a city name.");

        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

        fetchWeatherData(geoUrl, geoData => {
            if (!geoData.length) return alert("City not found.");

            const { lat, lon, name } = geoData[0];
            const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

            fetchWeatherData(weatherUrl, weatherData => {
                updateCurrentWeather(name, weatherData.list[0]);
                updateForecast(weatherData);
            });
        });
    };

    const getCurrentLocationWeather = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

                fetchWeatherData(weatherUrl, weatherData => {
                    const cityName = weatherData.city.name;
                    updateCurrentWeather(cityName, weatherData.list[0]);
                    updateForecast(weatherData);
                });
            },
            () => alert("Failed to get current location."));
    };

    searchButton.addEventListener("click", getCityWeather);
    locationButton.addEventListener("click", getCurrentLocationWeather);
});
