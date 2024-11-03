const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastContainer = document.querySelector('.forecast-items-container');

const apiKey = 'get your Api key';

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeather(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeather(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function fetchWeatherData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('City not found');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function updateForecastInfo(city) {
    const forecastData = await fetchWeatherData('forecast', city);
    if (!forecastData || forecastData.cod !== "200") {
        console.error("Could not retrieve forecast data.");
        return;
    }

    const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

    forecastContainer.innerHTML = '';
    dailyForecasts.slice(0, 4).forEach(day => {
        const { dt_txt, main: { temp }, weather: [{ id, main }] } = day;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        const forecastDate = new Date(dt_txt).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });

        const weatherIconMap = {
            2: 'thunderstorm',
            3: 'drizzle',
            5: 'rain',
            6: 'snow',
            7: 'atmosphere',
            8: id === 800 ? 'clear' : 'clouds'
        };
        const weatherIcon = weatherIconMap[Math.floor(id / 100)] || 'default';

        forecastItem.innerHTML = `
            <span class="forecast-date">${forecastDate}</span>
            <img src="weather/${weatherIcon}.svg" alt="${main}" class="forecast-item-img">
            <span class="forecast-temp">${Math.round(temp)} °C</span>
        `;

        forecastContainer.appendChild(forecastItem);
    });
}

async function updateWeather(city) {
    const weatherData = await fetchWeatherData('weather', city);
    if (!weatherData || weatherData.cod !== 200) {
        displaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = `${temp} °C`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} M/s`;
    currentDateTxt.textContent = new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    });

    const weatherIconMap = {
        2: 'thunderstorm',
        3: 'drizzle',
        5: 'rain',
        6: 'snow',
        7: 'atmosphere',
        8: id === 800 ? 'clear' : 'clouds'
    };
    const weatherIcon = weatherIconMap[Math.floor(id / 100)] || 'default';
    weatherSummaryImg.src = `weather/${weatherIcon}.svg`;

    displaySection(weatherInfoSection);

    await updateForecastInfo(city);
}

function displaySection(activeSection) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach((sec) => {
        sec.style.display = 'none';
    });
    activeSection.style.display = 'flex';
}
