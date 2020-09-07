'use strict';

async function getWeather(location) {
    const url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + location;
    const key = '&appid=77507ca00606a30af83452d6251687da';
    const units = '&units=metric';
    const endpoint = `${url}${key}${units}`;

    try {
        const response = await fetch(endpoint, {mode: 'cors'});
        if (response.ok) {
            return await response.json();
        }
        handleError('404');
    } catch {
        handleError('network');
    }
}

function render() {

    if (document.querySelector('.error')) document.querySelector('.error').remove();

    const forecast = weather.forecast[weather.selected];
    const time = forecast.time * 1000;

    const date = new Date(time + new Date().getTimezoneOffset() * 60 * 1000 + weather.timezone * 1000);
    const days = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const day = days[date.getDay()];
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    document.querySelector('.temp').textContent = `${forecast.temp}°C`;
    document.querySelector('.desc').textContent = forecast.desc;
    document.querySelector('.city').textContent = weather.city;
    document.querySelector('.date').textContent = `${day}, ${hour}:${minute < 10 ? '0' : ''}${minute}`;
    document.querySelector('img').src = `http://openweathermap.org/img/wn/${forecast.icon}@2x.png`;
    
    document.querySelector('.humidity').textContent = `Humidity: ${forecast.humidity} %`;
    document.querySelector('.pressure').textContent = `Pressure: ${forecast.pressure} hPa`;
    document.querySelector('.wind').textContent = `Wind: ${forecast.wind} km/h`;
}

function renderHours(start) {
    for (let i = start; i < start + 8; i++) {
        const date = new Date(weather.forecast[i].time * 1000 + new Date().getTimezoneOffset() * 60 * 1000 + weather.timezone * 1000);
        const hour = date.getHours();

        document.querySelector(`.hour:nth-child(${i + 1 - start})`).data = i;

        document.querySelector(`.hour:nth-child(${i + 1 - start})`).textContent = `${hour < 10 ? '0' : ''}${hour}:00`;
    }
}

function renderDays() {
    const days = ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.'];

    for (let i = 0; i < weather.forecast.length; i += 8) {
        const date = new Date(weather.forecast[i].time * 1000 + new Date().getTimezoneOffset() * 60 * 1000 + weather.timezone * 1000);
        const day = days[date.getDay()];

        const div = document.createElement('div');
        div.textContent = day;
        div.classList.toggle('day');
        div.data = i;
        div.addEventListener('click', changeTime);
        div.addEventListener('click', e => {
            document.querySelector('.day.active').classList.toggle('active');
            e.target.classList.toggle('active');
            document.querySelector('.hour.active').classList.toggle('active');
            document.querySelector('.hour').classList.toggle('active');
            renderHours(e.target.data);
        });
        document.querySelector('.forecast').appendChild(div);
    }

    document.querySelector('.day').classList.toggle('active');
}

const weather = {}

function updateWeather(data) {
    weather.city = data.city.name;
    weather.timezone = data.city.timezone;
    weather.forecast = [];
    weather.selected = 0;

    for (let item of data.list) {
        weather.forecast.push({
            time: item.dt,
            temp: Math.round(item.main.temp),
            desc: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            pressure: item.main.pressure,
            wind: item.wind.speed
        });
    }
}

function changeTime(e) {
    weather.selected = e.target.data;
    render();
}

document.querySelectorAll('.hour').forEach(item => item.addEventListener('click', changeTime));

async function getInput(e) {
    e.preventDefault();
    updateWeather(await getWeather(document.querySelector('[type="text"]').value));
    render(weather.forecast[0]);
    renderHours(0);
}

document.querySelector('form').addEventListener('submit', getInput);
document.querySelectorAll('.hour').forEach(item => item.addEventListener('click', e => {
    document.querySelector('.hour.active').classList.toggle('active');
    e.target.classList.toggle('active');
}));

getWeather('London').then(result => updateWeather(result)).then(() => {
    render(weather.forecast[0]);
    renderHours(0);
    renderDays();
});

function handleError(error) {
    const message = document.createElement('span');
    if (error === '404') {
        message.textContent = "Couldn't find that city. Try entering a nearby location.";
    } else {
        message.textContent = 'There was a network error. Try checking your internet connection.';
    }
    message.classList.toggle('error');
    document.querySelector('nav').insertBefore(message, document.querySelector('form'));
}