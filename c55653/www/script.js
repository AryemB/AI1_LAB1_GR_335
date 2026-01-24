const btn = document.getElementById("weatherBtn");

function getDotColor(hour) {
    if (hour >= 5 && hour <= 10) return "#ffbfae";   
    if (hour >= 11 && hour <= 16) return "#ff9aac";  
    if (hour >= 17 && hour <= 20) return "#d6768f";  
    return "#5a3b5e";                                
}

function createCard(item) {

    let hour;
    if (item.dt_txt === "Aktualnie") {
        hour = new Date().getHours();
    } else {
        hour = new Date(item.dt_txt).getHours();
    }

    const dotColor = getDotColor(hour);

    return `
        <div class="card">
            <div class="dot" style="background:${dotColor}"></div>
            <div class="temp-block">
                <div class="time">${item.dt_txt}</div>
                <div class="temp">${item.main.temp.toFixed(1)} °C</div>
                <div class="feel">Feel: ${item.main.feels_like.toFixed(1)} °C</div>
                <div class="desc">${item.weather[0].description}</div>
            </div>
        </div>
    `;
}

btn.addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;
    const apiKey = "060b589168e9e00e44f8665391e3613c"; 

    if (!city) {
        alert("Wpisz nazwę miasta!");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    xhr.onload = function () {

        console.log("Current weather response:", xhr.responseText); 

        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            document.getElementById("currentWeather").innerHTML =
                createCard({
                    dt_txt: "Aktualnie",
                    main: data.main,
                    weather: data.weather
                });
        } else {
            document.getElementById("currentWeather").innerHTML =
                `<div class="error-block">Błąd pobierania aktualnej pogody.</div>`;
        }
    };

    xhr.onerror = function () {
        document.getElementById("currentWeather").innerHTML =
            `<div class="error-block">Błąd sieci podczas pobierania danych.</div>`;
    };

    xhr.send();

    fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    )
        .then(response => response.json())
        .then(data => {

            console.log("Forecast response:", data); 

            if (!data.list) {
                document.getElementById("forecast").innerHTML =
                    `<div class="error-block">Nie udało się pobrać prognozy.</div>`;
                return;
            }

            const html = data.list
                .map(item => createCard(item))
                .join("");

            document.getElementById("forecast").innerHTML = html;
        })
        .catch(error => {
            console.error("Forecast fetch error:", error);
            document.getElementById("forecast").innerHTML =
                `<div class="error-block">Błąd podczas pobierania prognozy.</div>`;
        });
});